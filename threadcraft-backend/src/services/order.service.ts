import { prisma } from '../config/database';
import { BadRequestError, NotFoundError } from '../utils/errors';
import { CheckoutInput } from '../schemas/order.schema';
import { OrderStatus, PaymentStatus, PaymentMethod, StockMovementType, OrderSource } from '@prisma/client';
import { sendWhatsAppNotification } from './whatsapp.service';


export async function checkout(
    input: CheckoutInput,
    userId?: string,
    sessionId?: string
){
    if (!userId && !sessionId ) {
        throw new BadRequestError('Cart identity missing. Please log in or provide a session ID.');

    }


    const cart = await prisma.cart.findFirst({
        where: userId ? { userId } : { sessionId },
        include: {
            items: {
                include: {
                    variant: {
                        include: { design: true },
                    },
                },
            },
        },
    });

    if (!cart || cart.items.length === 0 ){
        throw new BadRequestError(' You cart is empty.');
    }

    if (!userId && (!input.guestEmail || !input.guestPhone)) {
        throw new BadRequestError('Guest checkout requires an email and phone number.');
    }



    let discountAmount = 0;
    let discountCodeId: string | null = null;

    


    if(input.discountCode) {
        const discount = await prisma.discountCode. findUnique({
            where: {code: input.discountCode.toUpperCase() }
        });


        if (!discount || !discount.isActive) {
            throw new BadRequestError('Invalid or inactive dicount code.');
        }

        if (discount.usageLimit && discount.usedCount >= discount.usageLimit) {
            throw new BadRequestError('This discount code has recieved its usage limit.');
        }

        discountCodeId = discount.id;
    }


    const subtotal= cart.items.reduce(
        (sum, item) => sum + Number(item.unitPrice) * item.quantity,0
    );



    const shippingCost = 2000;
    const tax = 0;

    if (input.discountCode) {
        const discount =  await prisma.discountCode.findUnique({ where: { code: input.discountCode.toUpperCase() }});

        if (discount) {
            if ( discount.type === 'PERCENTAGE') {
                discountAmount = subtotal * (Number(discount.value)/ 100);
                if (discount.maxDiscount && discountAmount > Number(discount.maxDiscount)) {
                    discountAmount = Number(discount.maxDiscount);
                }

            } else if (discount.type === 'FIXED'){
                discountAmount = Number(discount.value);
            }
        }
    }


    //ensure discount doesn/t exceed subtotal

    if (discountAmount > subtotal) discountAmount = subtotal;

    const total = subtotal + shippingCost + tax - discountAmount;



    //generate a unique order number


    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 9000 + 1000);
    const orderNumber = `TC-${timestamp}-${random}`;


     // START ATOMIC TRANSACTION

     const result = await prisma.$transaction(async (tx) => {


        for (const item of cart.items) {
            const variant = await tx.variant.findUnique({
                where: {id: item.variantId},
            });


            if (!variant || !variant.isActive || variant.currentStock < item.quantity) {
                throw new BadRequestError(
                    `Not enough stock for ${item.variant.design.name} (${item.variant.size}, ${item.variant.color}). Only ${variant?.currentStock || 0} left.`
                );
            }
        }


        const order = await tx.order.create({

            data: {
                orderNumber,
                userId: userId || null,
                guestEmail: input.guestEmail || null,
                guestPhone: input.guestPhone || null,
                shippingAddress: input.shippingAddress,
                subtotal,
                discountAmount,
                shippingCost,
                tax,
                total,
                status: OrderStatus.PENDING,//pending until payment is verified.
                paymentStatus: PaymentStatus.PENDING,
                source: OrderSource.WEBSITE,
                discountCodeId,
                items: {
                    create: cart.items.map((item) => ({
                        designId: item.variant.designId,
                        variantId: item.variantId,
                        unitPrice: item.unitPrice,
                        quantity: item.quantity,
                        sizeSnapshot: item.variant.size,
                        colorSnapshot: item.variant.color,
                    })),
                } ,
            },
        });



        for (const item of cart.items) {
            const variant = await tx.variant.findUnique({ where: {id: item.variantId }});
            if (!variant) throw new NotFoundError('Variant not found');

            const previousStock = variant.currentStock;
            const newStock = previousStock - item.quantity;



            await tx.variant.update({
                where: { id: item.variantId },
                data: { currentStock: newStock },
            });


            await tx.stockMovement.create({
                data: {
                    variantId: item.variantId,
                    type: StockMovementType.SALE,
                    quantity: item.quantity,
                    previousStock,
                    newStock,
                    reason: `Order ${orderNumber}`,
                    orderId: order.id,
                },
            });
        }


            //increment discount usage
        if (discountCodeId) {
            await tx.discountCode.update({
                where: { id: discountCodeId},
                    data: { usedCount: {increment: 1}},
                });
            }



            //create order status history


            await tx.orderStatusHistory.create({
                data: {
                    orderId: order.id,
                    status: OrderStatus.PENDING,
                    paymentStatus: PaymentStatus.PENDING,
                    note: 'Order placed by customer. Awaiting payment verification.',
                   
                },
            });



            await tx.payment.create({
                data: {
                    orderId: order.id,
                     amount: total,
                    currency: 'RWF',
                    method: input.paymentMethod as PaymentMethod,
                    provider: input.paymentMethod === 'STRIPE' ? 'stripe' : 'manual',
                    providerPaymentId: `PAY-${orderNumber}`, //placehlder until stripe is fully integreated.

                    status: PaymentStatus.PENDING,

                }
            })

            //clear cart

            await tx.cartItem.deleteMany({
                where: {cartId: cart.id },
            });

            return order;
            },{
            isolationLevel: 'Serializable',
            maxWait: 5000,// 5s
            timeout: 10000,//10s
        });



           // TRANSACTION COMPLETE 
           //Send WhatsApp Notification to Owner (outside transaction so it doesn't block DB)
            // We fetch the owner to get their phone number


            const owner = await prisma.user.findFirst({ where: { role: 'OWNER'} });

            if (owner) {

                //build message

                const itemsList = cart.items
                .map((i) => `${i.quantity}x ${i.variant.design.name} (Size: ${i.variant.size}, Color: ${i.variant.color})`)
                .join('\n');

                const message = `
                NEW ORDER: ${result.orderNumber}
                
                
                Customer: ${userId ? 'Registered User' : input.guestEmail}
                Phone: ${input.guestPhone || 'N/A'}
                Payment: ${input.paymentMethod}
                
                Items:
                ${itemsList}
                
                
                Total: ${total.toLocaleString()} RWF
                
                
                Please verify payment and update the dashboard.
                `.trim();



                // Send it (we will build this service next)
                
                
                await sendWhatsAppNotification(message).catch((err:unknown) =>
                console.error('Failed to send WhatsApp notification:',err));



                // log the notification attempt in the database

                await prisma.notification.create({
                    data: {
                        orderId: result.id,
                        channel: 'WHATSAPP',
                        recipient: owner.email, // Using email as placeholder until phone is added to user model

                        message: message,
                        status: 'SENT',
                        sentAt: new Date(),
                    }
                });
            }
            return result;
        }




        export async function getOrders(userId: string) {
            return prisma.order.findMany({
                where: { userId },
                include: {
                    items: {
                        include: {
                            design: { select: { name: true, images: true } },
                        },
                    },
                },
                orderBy: { createdAt: 'desc'},
            });
        }




        export async function getOrderById( orderId: string, userId: string) {
            const order = await prisma.order.findFirst({
                where: { id: orderId, userId },
                include: {
                    items: {
                        include: {
                            design: {select: {name: true, images: true }},
                        },
                    },
                    payment:true,
                    statusHistory: { orderBy: { createdAt: 'asc'} },
                },
            });

            if (!order ){
                throw new NotFoundError('Order not found');
            }

            return order;
        }
 
