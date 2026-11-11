import {prisma} from '../config/database';
import { hashPassword, comparePassword} from '../utils/password';
import {signToken} from '../utils/jwt';
import { ConflictError, UnauthorizedError, NotFoundError } from '../utils/errors';
import { RegisterInput, LoginInput} from '../schemas/auth.schema';
import speakeasy from 'speakeasy';
import QRcode from 'qrcode';



export async function registerUser(input: RegisterInput) {
    const existingUser = await prisma.user.findUnique({
        where: {email: input.email},
    });


    if (existingUser) {
        throw new ConflictError('An account with this email already exists');
    }

    const passwordHash = await hashPassword(input.password);

    const user = await prisma.user.create({
        data:{
            email:input.email,
            passwordHash,
            firstName: input.firstName,
            lastName: input.lastName,
            language: input.language,
            role:'CUSTOMER',
            
        },
        select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true, 
            role: true,
            language: true,
            createdAt: true,
            tokenVersion: true,
        },
    });


    const token = signToken({
        userId: user.id,
        role: user.role,
        tokenVersion: user.tokenVersion,
    });
    return{ user, token};
}


export async function loginUser(input: LoginInput, sessionId?: string) {
    const user =  await prisma.user.findUnique({
        where: { email: input.email },
    });


    if(!user){
        throw new UnauthorizedError('Invalid email or password');
    }

    if(!user.passwordHash) {
        throw new UnauthorizedError('This account uses Google Login.Please sign in with google.')
    }
    const isPasswordValid =  await comparePassword(input.password, user.passwordHash)

    if(!isPasswordValid ) {
        throw new UnauthorizedError('Invalid email or password');
    }

    if(sessionId){
        const guestCart = await prisma.cart.findFirst({
            where: { sessionId,
                userId: null,
             },
             include: { items: true},
        });

        if (guestCart) {
            let userCart = await prisma.cart.findFirst({
                where: { userId: user.id },
                include: { items: true },
            });

            if(!userCart) {
                await prisma.cart.update({
                    where: { id: guestCart.id },
                    data: { userId: user.id, sessionId: null },
                });
            }else {
                for ( const guestItem of guestCart.items) {
                    const existingItem = userCart.items.find((i) => i.variantId === guestItem.variantId);

                    if (existingItem) {
                        await prisma.cartItem.update({
                            where: { id: existingItem.id },
                            data: { quantity: existingItem.quantity + guestItem.quantity },
                        });
                    } else{
                        await prisma.cartItem.update({
                            where: { id: guestItem.id },
                            data: { cartId: userCart.id},
                        });
                    }
                }

                await prisma.cart.delete({
                    where: { id: guestCart.id }
                });
            }
        }
    }

    if ( user.twoFactorSecret) {
        return {
            requires2FA: true,
            userId: user.id,
        };
    }

    const token = signToken({
        userId: user.id,
        role: user.role,
        tokenVersion: user.tokenVersion,
    });


    const safeUser = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        language: user.language,
        createdAt: user.createdAt,
    };
    return { user: safeUser, token };
}
export async function getUserById (userId: string){
    const user = await prisma.user.findUnique({
        where: {id: userId},
        select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            language: true,
            createdAt: true,
        },
    });


    if(!user){
        throw new NotFoundError('Sorry, User not found');
    }
    return user;
}



export async function logoutUser (userId: string) {
    await prisma.user.update({
        where: { id: userId },
        data: { tokenVersion: { increment: 1} },
    });
}



export async function  generate2FASecret(userId: string) {
    const user = await prisma.user.findUnique({where: {id: userId}});
    if(!user) throw new NotFoundError('User not found');

    const secret = speakeasy.generateSecret({
        name: `ThreadCraft (${user.email})` ,
        issuer: 'ThreadCraft',
    });


    await prisma.user.update({
        where: {id: userId},
        data: {twoFactorSecret: secret.base32},
    });


    const qrCodeUrl = await QRcode.toDataURL(secret.otpauth_url as string);
    return { secret: secret.base32, qrCodeUrl };
}


export async function verify2FALogin(userId: string, code: string, sessionId?: string) {
    const user = await prisma.user.findUnique({where: {id: userId}});

    if(!user || !user.twoFactorSecret) {
        throw new UnauthorizedError('2FA is not set up for this account');

    }


    const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token: code,
        window: 1,
    });


    if (!verified) {
        throw new UnauthorizedError('Invalid 2FA code');
    }

    if(sessionId){
        const guestCart =  await prisma.cart.findFirst({
            where: { sessionId, userId: null },
            include: { items: true },
        });

        if(guestCart){
            let userCart = await prisma.cart.findFirst({
                where: { userId: user.id },
                include: { items: true },
            });

            if(!userCart) {
                await prisma.cart.update({
                    where: { id: guestCart.id },
                    data: { userId: user.id, sessionId: null },
                });
            } else{
                for ( const guestItem of guestCart.items) {
                    const existingItem = userCart.items.find(
                        (i) => i.variantId === guestItem.variantId);

                        if (existingItem){
                            await prisma.cartItem.update({
                                where: { id: existingItem.id },
                                data: { quantity: existingItem.quantity + guestItem.quantity},
                            });
                        } else {
                            await prisma.cartItem.update({
                                where: { id: guestItem.id },
                                data: { cartId: userCart.id },
                            });
                        }
                }

                await prisma.cart.delete({
                    where: { id: guestCart.id}
                });
            }
        }
    }

    const token = signToken({
        userId: user.id,
        role: user.role,
        tokenVersion: user.tokenVersion,
    });


    const safeUser = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        language: user.language,
        createdAt: user.createdAt,
    };
    return { user: safeUser, token};
}
