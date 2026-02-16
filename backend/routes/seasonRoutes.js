import express from 'express';
import { createSeason, getMySeasons, deleteSeason } from '../controllers/seasonController.js';
import { isAuthenticatedUser } from '../middlewares/auth.js';

const router = express.Router();

router.post('/new', isAuthenticatedUser, createSeason);
router.get('/my', isAuthenticatedUser, getMySeasons);
router.delete('/:id', isAuthenticatedUser, deleteSeason);

export default router;
