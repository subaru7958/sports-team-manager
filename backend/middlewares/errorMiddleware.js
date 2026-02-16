import ErrorHandler from '../utils/ErrorHandler.js';

const errorMiddleware = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || 'Internal Server Error';

    // Wrong Mongoose Object ID Error
    if (err.name === 'CastError') {
        const message = `Resource not found. Invalid: ${err.path}`;
        err = new ErrorHandler(message, 400);
    }

    // Mongoose Duplicate Key Error
    if (err.code === 11000) {
        const message = `Duplicate ${Object.keys(err.keyValue)} entered`;
        err = new ErrorHandler(message, 400);
    }

    // Mongoose Validation Error
    if (err.name === 'ValidationError') {
        const firstMessage = Object.values(err.errors || {})[0]?.message || err.message;
        err = new ErrorHandler(firstMessage, 400);
    }

    // Wrong JWT error
    if (err.name === 'JsonWebTokenError') {
        const message = `JSON Web Token is invalid. Try again!!!`;
        err = new ErrorHandler(message, 400);
    }

    // JWT EXPIRED error
    if (err.name === 'TokenExpiredError') {
        const message = `JSON Web Token is expired. Try again!!!`;
        err = new ErrorHandler(message, 400);
    }

    res.status(err.statusCode).json({
        success: false,
        message: err.message,
    });
};

export default errorMiddleware;
