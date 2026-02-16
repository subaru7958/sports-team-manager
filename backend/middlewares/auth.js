import jwt from 'jsonwebtoken';
import catchAsync from '../utils/catchAsync.js';
import ErrorHandler from '../utils/ErrorHandler.js';

export const isAuthenticatedUser = catchAsync(async (req, res, next) => {
    const { token } = req.cookies;

    if (!token) {
        return next(new ErrorHandler('Login first to access this resource', 401));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // In a real app, you would find the user in DB
        // For now, attaching the static user info from token
        req.user = decoded;
        next();
    } catch (error) {
        return next(new ErrorHandler('Invalid or expired token', 401));
    }
});
