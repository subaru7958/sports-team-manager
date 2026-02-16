import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: 'config.env' });

const requiredEnvVars = [
    'PORT',
    'MONGO_URI',
    'JWT_SECRET',
    'JWT_EXPIRES',
    'COOKIE_EXPIRE',
    'FRONTEND_URL'
];

export const checkEnvVars = () => {
    const missing = requiredEnvVars.filter(key => !process.env[key]);

    if (missing.length > 0) {
        console.error('CRITICAL ERROR: Missing environment variables:');
        missing.forEach(v => console.error(` - ${v}`));
        process.exit(1);
    }

    console.log('Environment variables validated successfully.');
};
