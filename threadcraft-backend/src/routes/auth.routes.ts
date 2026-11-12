import { Router} from 'express';
import * as authController from '../controllers/auth.controller';
import {authenticate} from '../middleware/auth';
import passport from '../config/passport';




const router = Router();




router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me',authenticate, authController.getMe);
router.post('/2fa/setup', authenticate, authController.setup2FA);
router.post('/2fa/verify',authController.verifyEmailOtp);
router.post('/logout', authenticate, authController.logout);
router.post('/verify-email-otp', authController.verifyEmailOtp);

router.get(
    '/google',
    passport.authenticate('google', { scope: ['profile', 'email'], 
        session: false
    })
);





router.get(
    '/google/callback',
     passport.authenticate('google', {session: false, failureRedirect: '/login'}),
    authController.googleCallback
);



export default router;