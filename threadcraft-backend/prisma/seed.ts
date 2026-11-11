import {PrismaClient, Role, DiscountType, OrderStatus, PaymentStatus, OrderSource, PaymentMethod, StockMovementType,User,Design,Variant} from '@prisma/client';
import bcrypt from 'bcryptjs';



const prisma  = new PrismaClient();



async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
}




function generateOrderNumber(): string {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 9000 + 1000);
    return `TC-${timestamp}-${random}`; 
}




   async function main() {
  console.log('🌱 Seeding database...');
  
  // Step 1: Clean existing data (order matters — children first)
  console.log('🧹 Clearing existing data...');
  await prisma.orderStatusHistory.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.variant.deleteMany();
  await prisma.design.deleteMany();
  await prisma.category.deleteMany();
  await prisma.address.deleteMany();
  await prisma.discountCode.deleteMany();
  await prisma.user.deleteMany();
  console.log('✅ Cleared existing data');

  console.log('Create owner account ...');
  const ownerPassword = await hashPassword('owner123');
  const owner = await prisma.user.create({
    data: {
        email:'owner@threadcraft.com',
        passwordHash: ownerPassword,
        firstName: 'Store',
        lastName: 'Owner',
        role: Role.OWNER,
        language: 'en'
    },
  });
  console.log(`Owner acccount created: ${owner.email}`);


  console.log("Create customer account");
  const customerPassword = await hashPassword('customer123');


  const customersData = [
    {firstName: 'Jean', lastName: 'Uwimana', email: 'jean@threadcraft.com', phone: '+250788100001', street: 'KG 11 Ave, House 42', city: 'Kigali', state: 'Kicukiro',
    },
    {firstName: 'Aline', lastName: 'Mukamana', email: 'aline@threadcraft.com',phone: '+250788100002', street: 'KN 5 Rd, House 18', city: 'Kigali', state: 'Gasabo'},
    {firstName: 'Eric', lastName: 'Habimana', email: 'eric@threadcraft.com', phone: '+250788100003', street: 'KK 15 Ave, House7', city: 'Kigali', state: 'Kicukiro'},
    {firstName: 'Remy', lastName: 'Igiraneza', email: 'remy@threadcraft.com', phone: '+250788100004', street: 'Musanze Main St, House 12', city: 'Musanze', state: 'Northern'},
    {firstName: 'chrispin', lastName: 'Tumaini', email: 'chrispin@threadcraft.com', phone: '+250788100005', street: 'Huye Main St, House 5', city: 'Huye', state: 'Sourthern'},

  ];

  const customers: User[] = [];
  for (const data of customersData) {
    const customer =  await prisma.user.create({
        data: {
            email: data.email,
            passwordHash: customerPassword,
            firstName: data.firstName,
            lastName: data.lastName,
            role: Role.CUSTOMER,
            language: 'en',
            addresses: {
                create: {
                    street: data.street,
                    city: data.city,
                    state: data.state,
                    postalCode: '00000',
                    country: 'RWANDA',
                    isDefault: true,

                },
            },

        },
    });
    customers.push(customer);
  }
  console.log(`Created ${customers.length} customers`);



  console.log('Creating catefgories...');
  const graphicCat = await prisma.category.create({
    data: {
        name: 'Graphic',
        slug: 'graphic',
        description: 'Bold graphic prints and illustrations',
    },
  });

  const minimalCat = await prisma.category.create({
    data: {
        name: 'Minimalist',
        slug: 'minimalist',
        description: 'Clean, simple, understated designs',
    },
  });

  const limitedCat = await prisma.category.create({
    data: {
        name: 'Limited Drops',
        slug: 'limited-drops',
        description: 'Small-batch exclussive designs,'
    },
  });

  console.log('Created 3 categories');



  console.log('Creating designs...');

  const designsData = [
    {
        name: 'Static Bloom',
        slug: 'static-bloom',
        description: 'A hand-drawn floral reduced to a single ink pass. Heavyweight 2 40gsm cotton , garment-dyed for a softer hand-feel. Made in Rwanda.',
        basePrice: 25000,
        categoryId: graphicCat.id,
    },
    {
        name: 'Night Circuit',
        slug: 'night-circuit',
        description: 'Circuit linework across the chest, printed in glowing violet ink on jet black cotton. Made in Rwanda.',
        basePrice: 30000,
        categoryId: graphicCat.id,
    },
    {
        name: 'Paper Moon',
        slug: 'paper-moon',
        description: 'A single quit crescent, off-center. Undyed cotton, minimal print, masimum wear. Made in Rwanda.',
        basePrice: 25000,
        categoryId: minimalCat.id,
    },
    {
        name: 'Concrete Garden',
        slug: 'concrete-garden',
        description: 'Botanical linework growing throughh a concrete grid-screen-printed in two passes. Made in Rwanda.',
        basePrice:28000,
        categoryId: graphicCat.id,
    },
    {
        name: 'Signal Loss',
        slug: 'signal-loss',
        description: 'Limited drop. Distorted broacdcat in coral spot-ink . Only 40 units printed. Made in Rwanda.',
        basePrice: 35000,
        categoryId: limitedCat.id,
    },
    {
        name: 'Slow Burn',
        slug: 'slow-burn',
        description: 'A single ember line, warped across the chest like heat off asphalt. Made in Rwanda.',
        basePrice: 28000,
        categoryId: minimalCat.id,
    },
    {
        name: 'Faultiline',
        slug: 'faultline',
        description: 'Cracked topographic linework inspired by the fault maps. Limited run, numbered inside collar. Made in Rwanda.',
        basePrice: 40000,
        categoryId: limitedCat.id,
    },
    {
        name: 'Halo Grain',
        slug: 'halo-grain',
        description: 'A soft halftone halo, faded like a photocopy left in the sun too long. Made in Rwanda',
        basePrice: 25000,
        categoryId: graphicCat.id,

    },
  ];


  const designs: Design[] = [];
  for (const data of designsData) {
    const design = await prisma.design.create({
        data:{
            name: data.name,
            slug: data.slug,
            description: data.description,
            basePrice: data.basePrice,
            images: [],
            isActive: true,
            categoryId: data.categoryId,
        },
    });
    designs.push(design);
  }

  console.log(`Created ${designs.length} designs`);




  console.log('Creating variants....');


  const sizes = ['S', 'M', 'L', 'XL'];

  const colorsByDesign: Record<string, string[]> = {
    'static-bloom':['Black', 'White', 'Violet'],
    'night-circuit':['Black', 'Violet'],
    'paper-moon':['Bone', 'Navy'],
    'concrete-garden':['Black', 'Mint', 'White'],
    'signal-loss':['Black', 'Coral'],
    'slow-burn':['Black', 'Coral'],
    'faultline':['Black', 'Violet'],
    'halo-grain':['Bone', 'Black'],
  };

  const skuPrefix: Record<string, string> = {
    'static-bloom': 'STATIC',
    'night-circuit':'NIGHT',
    'paper-moon':'MOON',
    'concrete-garden':'GARDEN',
    'signal-loss':'SIGNAL',
    'slow-burn':'BURN',
    'faultline':'FAULT',
    'halo-grain':'HALO',
  };

  const colorCode: Record<string, string> ={
    'Black':'BLK',
    'White':'WHT',
    'Violet':'VIO',
    'Bone': 'BON',
    'Navy':'NVY',
    'Mint':'MNT',
    'Coral':'COR',
  };


  const variants: Variant[] = [];
  for (const design of designs){
    const colors = colorsByDesign[design.slug] || ['Black'];
    const prefix = skuPrefix[design.slug] || 'TSHIRT';



    for (const color of colors){
        for (const size of sizes){
             const variant = await prisma.variant.create({
                data:{
                    designId: design.id,
                    size: size,
                    color: color,
                    sku: `${prefix}-${colorCode[color]}-${size}`,
                    currentStock:0,
                    minStockThreshold:5,
                    isActive:true,
                },
             });
             variants.push(variant);
        }
    }
  }
  console.log(`Created ${variants.length} variants`);




  console.log('Adding initial stock via RESTOCK movements...');


  const INITIAL_STOCK = 15;
   let stockMovementsCreated = 0;


   for (const variant of variants){

    await prisma.stockMovement.create({
        data:{
            variantId: variant.id,
            type: StockMovementType.RESTOCK,
            quantity : INITIAL_STOCK,
            previousStock:0,
            newStock:INITIAL_STOCK,
            reason: 'Initial seed stock',
            restockReference: 'SEED-INITIAL',
        },
    });

    await prisma.variant.update({
        where: {id:variant.id},
        data: {currentStock: INITIAL_STOCK},
    });

    stockMovementsCreated++;

   }


   console.log(`Created ${stockMovementsCreated} stock movement`);





console.log(' Creating discount codes.....');


const welcome10 = await prisma.discountCode.create({
    data:{
        code: 'WELCOME10',
        type: DiscountType.PERCENTAGE,
        value:10,
        usageLimit: 100,
        isActive: true,
        startsAt: new Date(),
        expiresAt: new Date(Date.now()+ 365 * 24 * 60 * 60 * 1000),
    },
});


const season04 = await prisma.discountCode.create({
    data:{
        code: 'SEASON04',
        type: DiscountType.PERCENTAGE,
        value:15,
        usageLimit:50,
        isActive:true,
        startsAt: new Date(),
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000 ),
    },
});



const flat5 = await prisma.discountCode.create({
    data:{
        code: 'FLAT5',
        type: DiscountType.FIXED,
        value: 5000,
        minOrderAmount:30000,
        usageLimit: 200,
        isActive: true,
        startsAt: new Date(),
        expiresAt: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
    },
});



const vip20 = await prisma.discountCode.create({
    data:{
        code: 'VIP20',
        type: DiscountType.PERCENTAGE,
        value: 20,
        maxDiscount: 20000,
        minOrderAmount: 100000,
        usageLimit: 10,
        isActive: true,
        startsAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
});


console.log('Created discount codes');








console.log('Creating sample orders.....');

async function createFullOrder(params: {
    customerIndex: number;
    items: {variantId: string; quantity: number }[];
    status: OrderStatus;
    paymentStatus: PaymentStatus;
    source: OrderSource;
    paymentMethod: PaymentMethod;
    statusReason?: string;
    trackingNumber?: string;
    daysAgo: number;
}){

    const customer = customers[params.customerIndex];
    const customerAddress = await prisma.address.findFirst({
        where: {userId: customer.id},
    });


    const itemDetails = [];
    for (const item of params.items){
        const variant = await prisma.variant.findUnique({
            where: {id: item.variantId }, 
            include: {design: true },
        });

        if (!variant) throw new Error(`Variant ${item.variantId} not found`);

        const unitPrice = variant.priceOverride ?? variant.design.basePrice;
        itemDetails.push({ variant, unitPrice, quantity: item.quantity });
    }


    const subtotal = itemDetails.reduce(
        (sum, d) => sum + Number(d.unitPrice) * d.quantity,0
    );

    const shippingCost = 2000;
    const tax = 0;
    const discountAmount = 0;
    const total = subtotal + shippingCost + tax - discountAmount;


    const createdAt = new Date(Date.now() - params.daysAgo * 24 * 60 * 60 * 1000);



    const order = await prisma.order.create({
        data: {
            orderNumber: generateOrderNumber(),
            userId: customer.id,
            shippingAddress: {
                street: customerAddress?.street,
                city: customerAddress?.city,
                state: customerAddress?.state,
                postalCode: customerAddress?.postalCode,
                country: customerAddress?.country,
            },

            subtotal: subtotal,
            discountAmount: discountAmount,
            shippingCost: shippingCost,
            tax: tax,
            total: total,
            status: params.status,
            paymentStatus: params.paymentStatus,
            source: params.source,
            statusReason: params.statusReason,
            trackingNumber: params.trackingNumber,
            shippedAt: params.status === 'SHIPPED' || params.status === 'DELIVERED'? new Date(createdAt.getTime() + 24 * 60 *60 * 1000) : null,
            createdAt: createdAt,
        },
    });



    for (const detail of itemDetails) {
         await prisma.orderItem.create({
            data: {
                orderId: order.id,
                designId: detail.variant.designId,
                variantId: detail.variant.id,
                unitPrice: detail.unitPrice,
                quantity: detail.quantity,
                sizeSnapshot: detail.variant.size,
                colorSnapshot: detail.variant.color,
            },
         });


         if (params.status !== OrderStatus.CANCELLED && params.status !== OrderStatus.REFUNDED){
         const previousStock = detail.variant.currentStock;
         const newStock = previousStock - detail.quantity;


         await prisma.stockMovement.create({
            data: {
                variantId: detail.variant.id,
                type: StockMovementType.SALE,
                quantity: detail.quantity,
                previousStock: previousStock,
                newStock: newStock,
                reason:`Order ${order.orderNumber}`,
                orderId: order.id,
                createdAt: createdAt,
            },
         });
         
         await prisma.variant.update({

            where: {id: detail.variant.id },
            data: {currentStock: newStock },
         });
        }
    }

    if (params.paymentStatus === PaymentStatus.PAID || params.paymentStatus === PaymentStatus.REFUNDED) {
        await prisma.payment.create({
            data: {
                orderId: order.id,
                amount: total,
                currency: 'RWF',
                method: params.paymentMethod,
                provider: 'manual',
                providerPaymentId: `PAY-${order.orderNumber}`,
                transactionReference: `REF-${order.orderNumber}`,
                status: params.paymentStatus,
                createdAt: createdAt,
            },
        });
    }


    await prisma.orderStatusHistory.create({
        data: {
            orderId: order.id,
            status: OrderStatus.PENDING,
            paymentStatus: PaymentStatus.PENDING,
            note: 'Order created',
            createdAt: createdAt,
        },
    });

    if(params.paymentStatus === PaymentStatus.PAID || params.paymentStatus ===  PaymentStatus.REFUNDED){
        await prisma.orderStatusHistory.create({
            data: {
                orderId: order.id,
                status: OrderStatus.PENDING,
                paymentStatus: params.paymentStatus,
                note: params.paymentStatus === PaymentStatus.REFUNDED ? 'Payment refunded' : `Payment verified via ${params.paymentMethod}`,
                createdAt: new Date(createdAt.getTime() + 2 * 60 * 60 * 1000),
            },
        });
    }

    if (params.status !== OrderStatus.PENDING) {
        await prisma.orderStatusHistory.create({
            data: {
                orderId: order.id,
                status: params.status,
                note: params.statusReason || `Status changed to ${params.status}`,
                createdAt: new Date(createdAt.getTime() + 24 * 60 * 60 * 1000),
            },
        });
    }

    await prisma.notification.create({
        data: {
            orderId: order.id,
            channel: 'WHATSAPP',
            recipient: '+250788000000',
            message: `New order ${order.orderNumber} - ${total} RWF`,
            status: 'SENT',
            sentAt: createdAt,
            createdAt: createdAt,
        },
    });

    return order;
}


console.log('Order helper created');






const variant1 = variants.find(v => v.sku === 'STATIC-BLK-M')!;
const variant2 = variants.find(v => v.sku === 'STATIC-WHT-L')!;
const variant3 = variants.find(v => v.sku === 'NIGHT-VIO-M')!;
const variant4 = variants.find(v => v.sku === 'MOON-BON-S')!;
const variant5 = variants.find(v => v.sku === 'GARDEN-MNT-XL')!;
const variant6 = variants.find(v => v.sku === 'SIGNAL-COR-M')!;
const variant7 = variants.find(v => v.sku === 'BURN-BON-M')!;
const variant8 = variants.find(v => v.sku === 'HALO-BORN-M')!; 

await createFullOrder({
    customerIndex: 0,
    items: [
        {variantId: variant2.id, quantity: 2 },
        

    ],
    status: OrderStatus.SHIPPED,
    paymentStatus: PaymentStatus.PAID,
    source: OrderSource.WEBSITE,
    paymentMethod: PaymentMethod.MOMO,
    trackingNumber:'TRK-2026-0001',
    daysAgo: 15,
});



await createFullOrder({
    customerIndex: 1,
    items: [
        {variantId: variant2.id, quantity: 1 },
        {variantId: variant3.id, quantity: 1 },

    ],
    status: OrderStatus.SHIPPED,
    paymentStatus: PaymentStatus.PAID,
    source: OrderSource.WEBSITE,
    paymentMethod: PaymentMethod.MOMO,
    trackingNumber:'TRK-2026-0002',
    daysAgo: 7,
});

await createFullOrder({
    customerIndex: 2,
    items: [
        {variantId: variant4.id, quantity: 1}
    ],
    
    status: OrderStatus.PAID,
    paymentStatus: PaymentStatus.PAID,
    source: OrderSource.INSTAGRAM,
    paymentMethod: PaymentMethod.AIRTEL_MONEY,
    daysAgo: 3,
});

await createFullOrder({
    customerIndex: 3,
    items: [{variantId: variant5.id, quantity:1 }],
    status: OrderStatus.PENDING,
    paymentStatus: PaymentStatus.PENDING,
    source: OrderSource.WEBSITE,
    paymentMethod: PaymentMethod.MOMO,
    daysAgo: 1,
});


await createFullOrder({
    customerIndex: 4,
    items:[{ variantId: variant6.id, quantity: 1}],
    status: OrderStatus.CANCELLED,
    paymentStatus: PaymentStatus.REFUNDED,
    source: OrderSource.WEBSITE,
    paymentMethod: PaymentMethod.BANK_TRANSFER,
    statusReason: 'Customer changed mind before shipping',
    daysAgo: 20,
});

console.log('Created sample orders');

  
  console.log('✅ Seed completed!');
}
main()
    .catch((e)=>{
        console.error('Seed failed:', e);
        process.exit(1)
    })
    .finally(async() =>{

        await prisma.$disconnect();

    });