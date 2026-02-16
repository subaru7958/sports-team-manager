import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import morgan from 'morgan';
import authRoutes from './routes/auth.js';
import teamRoutes from './routes/teamRoutes.js';
import seasonRoutes from './routes/seasonRoutes.js';
import coachRoutes from './routes/coachRoutes.js';
import playerRoutes from './routes/playerRoutes.js';
import groupRoutes from './routes/groupRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import facilityRoutes from './routes/facilityRoutes.js';
import errorMiddleware from './middlewares/errorMiddleware.js';

dotenv.config({ path: './config.env' });

const app = express();

app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));
app.use(cookieParser());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/team', teamRoutes);
app.use('/api/v1/seasons', seasonRoutes);
app.use('/api/v1/coaches', coachRoutes);
app.use('/api/v1/players', playerRoutes);
app.use('/api/v1/groups', groupRoutes);
app.use('/api/v1/events', eventRoutes);
app.use('/api/v1/facilities', facilityRoutes);

app.get('/', (req, res) => {
    res.send('AthleticOS API is running');
});

// Global Error Middleware
app.use(errorMiddleware);

export default app;
