import { prisma } from "../config/database";
import { BadRequestError, NotFoundError } from "../utils/errors";
import { OrderStatus, PaymentStatus } from "@prisma/client";



//dashbord stats


export async function getDashboardStats(){
    const totalOrders = await prisma.order.count();
    const totalRevenue = await prisma.order.aggregate({
        _sum: { total: true },
        where: { paymentStatus: 'PAID'},
    });



    const lowStockVariants = await prisma.variant.count({
        where: { currentStock: { lte: 5 }, isActive: true },
    });


    const recentOrders = await prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc'},
        include: {
            items: { include: { design: { select: { name: true } } } },
            user: { select: { firstName: true, lastName: true} }, 
        },
    });


    return {
        totalOrders,
        totalRevenue: totalRevenue._sum.total || 0,
        lowStockVariants,
        recentOrders,
    };
}


// Get All Orders (for the admin table)

export async function getAllOrders(){
    return prisma.order.findMany({
        include: {
            items: {
                include: {
                    design: { select: {name: true } },
                    variant: {select: {size: true, color: true } }, 
                },
            },
            payment: true,
            user: { select: { firstName: true, lastName: true } },
        },
    });
}

// Update Order Status (Verify Payment, Ship, Deliver)


export async function updateOrderStatus(
    orderId: string,
    newStatus: OrderStatus,
    newPaymentStatus: PaymentStatus,
    note?: string
) {
    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { payment: true },
    });

    if (!order) {
        throw new NotFoundError('Order not found');
    }


    //Business Rule: If cancelling or refunding, return stock to the variant


   if (newStatus === OrderStatus.CANCELLED || newStatus === OrderStatus.REFUNDED){

    if (order.status === OrderStatus.CANCELLED || order.status === OrderStatus.REFUNDED)
    {
        throw new BadRequestError('This order is already cancelled or refunded.');
    }

   

   const orderItems = await prisma.orderItem.findMany({
    where: { orderId: order.id },
   });

        //get the order items to restore stock

        await prisma.$transaction(async (tx) => {
            for ( const item of orderItems) {
                const variant = await tx.variant.findUnique({
                    where: { id: item.variantId },
                });


                if (variant) {
                    const previousStock = variant.currentStock;
                    const newStock = previousStock + item.quantity;


                    await tx.variant.update({
                        where: { id: variant.id },
                        data: { currentStock: newStock },
                    });


                    await tx.stockMovement.create({
                        data: {
                            variantId: variant.id,
                            type: newStatus === OrderStatus.CANCELLED ? 'CANCELLATION' : 'RETURN',
                            quantity: item.quantity,
                            previousStock,
                            newStock,
                            reason: `Order ${order.orderNumber} was ${newStatus.toLowerCase()}`,
                            orderId: order.id,
                        },
                    });
                }
            }

           // update the order and payment


           await tx.order.update({
                where: { id: order.id },
                data: {
                    status: newStatus,
                    paymentStatus: newPaymentStatus,
                    statusReason: note || null,
                },
           });

           if (order.payment) {
            await tx.payment.update({
                where: { id: order.payment.id },
                data: { status: newPaymentStatus },
            });
           }

           //add status history

           await tx.orderStatusHistory.create({
            data: {
                orderId: order.id,
                status: newStatus,
                paymentStatus: newPaymentStatus,
                note: note || `Status updated  by owner`,
            },
           });
        });

        return { message: 'Order updated and stock restored.'};
    }


    // Normal status update (no stock restoration needed)



    const updatedOrder = await prisma.order.update({
        where: { id: order.id },
        data: {
            status: newStatus,
            paymentStatus: newPaymentStatus,
            statusReason: note || null,
        },
    });


    if(order.payment) {
        await prisma.payment.update({
            where: { id: order.payment.id },
            data: { status: newPaymentStatus },
        });
    }


    await prisma.orderStatusHistory.create({
        data: {
            orderId: order.id,
            status: newStatus,
            paymentStatus: newPaymentStatus,
            note: note || `Status updated by owner`,
        },
    });

    return updatedOrder;
}