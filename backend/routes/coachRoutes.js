import express from 'express';
import { addCoach, getMyCoaches, updateCoach, deleteCoach } from '../controllers/coachController.js';
import { isAuthenticatedUser } from '../middlewares/auth.js';

const router = express.Router();

router.post('/new', isAuthenticatedUser, addCoach);
router.get('/my', isAuthenticatedUser, getMyCoaches);
router.put('/:id', isAuthenticatedUser, updateCoach);
router.delete('/:id', isAuthenticatedUser, deleteCoach);

export default router;
