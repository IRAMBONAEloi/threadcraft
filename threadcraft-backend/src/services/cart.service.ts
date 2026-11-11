import { prisma } from '../config/database';
import { BadRequestError, NotFoundError } from '../utils/errors';
import { AddToCartInput } from '../schemas/cart.schema';


// helper to find, create cart or guest session




async function getOrCreateCart (userId?: string, sessionId?: string) {
    if  (!userId && !sessionId) {
        throw new BadRequestError ('Either userId or sessionId is required');
    }



    let cart = await prisma.cart.findFirst({
        where: userId ? { userId } : { sessionId },
        include: {
            items: {
                include: {
                    variant: {
                        include: {design: true },
                    },
                },
            },
        },
    });


    if (!cart){
        cart = await prisma.cart.create({
            data: {
                userId: userId || null,
                sessionId: sessionId || null,
            },
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
    }
    return cart;
}

export async function getCart (userId?: string, sessionId?: string){
    const cart =  await getOrCreateCart(userId, sessionId);


    //calcualate total

    const subtotal = cart.items.reduce(
        (sum, item) => sum + Number(item.unitPrice) * item.quantity, 0
    );

    return {
        ...cart,
        subtotal,
    };
}


export async function addToCart (
    data: AddToCartInput,
    userId?: string,
    sessionId?: string
){
    const cart = await getOrCreateCart(userId, sessionId);

    const variant = await prisma.variant.findUnique({
        where: {id: data.variantId },
        include : { design: true },
    });


    if (!variant) {
        throw new NotFoundError ('Product variant not found');
    }

    if (!variant.isActive || !variant.design.isActive) {
        throw new BadRequestError ('This product is no longer available');
    }

// check it it is in the cart
    const existingItem = cart.items.find(
        (item) => item.variantId === data.variantId
    );


    const newQuantity = existingItem ? existingItem.quantity + data.quantity : data.quantity;



    // verify stock


    if ( variant.currentStock < newQuantity) {
        throw new BadRequestError(
            `Only ${variant.currentStock} items available in stock`
        );
    }


    //add or update item


    if (existingItem) {
        await prisma.cartItem.update({
            where: {id: existingItem.id },
            data: {quantity: newQuantity },
        });
    } else {
        await prisma.cartItem.create ({
            data: {
                cartId: cart.id,
                variantId: variant.id,
                quantity: data.quantity,
                unitPrice: variant.priceOverride ?? variant.design.basePrice,
            },
        });
    }


    //return updated cart

    return getCart(userId, sessionId);
}


export async function updateCartItemQuantity (
    itemId: string,
    quantity: number,
    userId?: string,
    sessionId?: string
) {
    const cart = await getOrCreateCart (userId, sessionId);

    const item = cart.items.find((i)=> i.id === itemId);
    if (!item) {
        throw new BadRequestError('Item not found in cart');
           
        
    }

    if (item.variant.currentStock < quantity){
        throw new BadRequestError (  
            `Only ${item.variant.currentStock} items available in stock`
        );
    }


    await prisma.cartItem.update ({
        where: {id: itemId },
        data: { quantity },
    });

    return getCart(userId, sessionId);
}


export async function removeCartItem (
    itemId: string,
    userId?: string,
    sessionId?:string
) {
    const cart = await getOrCreateCart(userId, sessionId);


    const item =  cart.items.find((i) => i.id === itemId);

    if (!item) {
        throw new NotFoundError ('Item not found in cart')
    }


    await prisma.cartItem.delete({
        where: { id: itemId },
    });

    return getCart(userId, sessionId);
}