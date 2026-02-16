import express from 'express';
import { getEvents, createEvent, updateEvent, deleteEvent } from '../controllers/eventController.js';
import { isAuthenticatedUser } from '../middlewares/auth.js';

const router = express.Router();

router.get('/season/:seasonId', isAuthenticatedUser, getEvents); // Fetch all events for a season
router.post('/', isAuthenticatedUser, createEvent);
router.put('/:id', isAuthenticatedUser, updateEvent);
router.delete('/:id', isAuthenticatedUser, deleteEvent);

export default router;
