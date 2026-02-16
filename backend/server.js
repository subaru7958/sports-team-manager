import app from './app.js';
import mongoose from 'mongoose';
import { checkEnvVars } from './config/config.js';

// Validate Environment Variables
checkEnvVars();

const PORT = process.env.PORT || 5000;

// Handle Uncaught exceptions
process.on('uncaughtException', (err) => {
    console.log(`ERROR: ${err.message}`);
    console.log('Shutting down due to uncaught exception');
    process.exit(1);
});

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/tm-manager')
    .then(() => console.log('Connected to MongoDB Successfully'))
    .catch((err) => console.log('MongoDB connection error:', err));

const server = app.listen(PORT, () => {
    console.log(`Server started on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});

// Handle Unhandled Promise rejections
process.on('unhandledRejection', (err) => {
    console.log(`ERROR: ${err.message}`);
    console.log('Shutting down the server due to Unhandled Promise rejection');
    server.close(() => {
        process.exit(1);
    });
});
