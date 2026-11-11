import passport from 'passport';
import { Strategy as GoogleStrategy, Profile, VerifyCallback } from 'passport-google-oauth20';
import { prisma } from './database';



passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
            callbackURL: 'http://localhost:5000/api/auth/google/callback',
            scope: ['profile, email'],
        },

        async (_accessToken: string, _refreshToken: string, profile: Profile, done: VerifyCallback) =>{
            try{
                const email = profile.emails?.[0].value;

                if(!email) {
                    return done (new Error('No email found from Google'), undefined);
                }


                let user =  await prisma.user.findFirst({
                    where: {
                        OR: [
                            { googleId: profile.id },
                            { email: email },
                        ],
                    },
                });

                if(user) {
                    // 2. If user exists but doesn't have a googleId (they registered normally before),

                    // update their account to link the Google ID.

                    if (!user.googleId) {
                        user = await prisma.user.update({
                            where: { id: user.id },
                            data: { googleId: profile.id },
                        });
                    }
                } else {
                        // create a new user

                        user = await prisma.user.create({
                            data: {
                                email: email,
                                googleId: profile.id,
                                firstName: profile.name?.givenName || 'Customer',
                                lastName: profile.name?.familyName || '',
                                role: 'CUSTOMER',
                                language: 'en',
                            },
                        });
                }

                return done(null, user);
            } catch (error){
                return done(error as Error, undefined);
            }
        }
    )
);


export default passport;