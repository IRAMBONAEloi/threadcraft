import jwt from 'jsonwebtoken';
import {UnauthorizedError} from './errors';


const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = '7d';


if(!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');

}

export interface JwtPayload {
    userId: string;
    role: 'OWNER' | 'STAFF' | 'CUSTOMER';
    tokenVersion: number;
}

export function signToken(payload: JwtPayload) : string{
    return jwt.sign(payload, JWT_SECRET as string, {
        expiresIn: JWT_EXPIRES_IN,
    });
}

export function verifyToken (token: string): JwtPayload {
    try{
        const decoded = jwt.verify(token, JWT_SECRET as string);
        return decoded as JwtPayload;

    }catch (error) {
        throw new UnauthorizedError ('Invalid or expiredtoken');
    }
}