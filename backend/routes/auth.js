import express from 'express';
import jwt from 'jsonwebtoken';
import catchAsync from '../utils/catchAsync.js';
import ErrorHandler from '../utils/ErrorHandler.js';

const router = express.Router();

// Static credentials
const STATIC_USER = {
    email: 'mehrez1251@gmail.com',
    password: 'mehrez123',
    name: 'Manager'
};

router.post('/login', catchAsync(async (req, res, next) => {
    const { email, password } = req.body;
    console.log(`Login attempt for: ${email}`);

    if (email === STATIC_USER.email && password === STATIC_USER.password) {
        console.log('Credentials matched successfully');

        const token = jwt.sign(
            { email: STATIC_USER.email, name: STATIC_USER.name },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES || '7d' }
        );

        res.cookie('token', token, {
            expires: new Date(Date.now() + (process.env.COOKIE_EXPIRE || 7) * 24 * 60 * 60 * 1000),
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
        });

        return res.status(200).json({
            success: true,
            message: 'Login successful',
            user: {
                email: STATIC_USER.email,
                name: STATIC_USER.name
            },
            token
        });
    }

    console.log(`Failed login attempt for: ${email}`);
    return next(new ErrorHandler('Invalid email or password', 401));
}));

router.get('/logout', catchAsync(async (req, res, next) => {
    res.cookie('token', null, {
        expires: new Date(Date.now()),
        httpOnly: true
    });

    res.status(200).json({
        success: true,
        message: 'Logged out successfully'
    });
}));

export default router;
