import express from 'express';
import { addPlayer, getMyPlayers, updatePlayer, deletePlayer } from '../controllers/playerController.js';
import { isAuthenticatedUser } from '../middlewares/auth.js';

const router = express.Router();

router.post('/new', isAuthenticatedUser, addPlayer);
router.get('/my', isAuthenticatedUser, getMyPlayers);
router.put('/:id', isAuthenticatedUser, updatePlayer);
router.delete('/:id', isAuthenticatedUser, deletePlayer);

export default router;
