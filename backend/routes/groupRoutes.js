import express from 'express';
import { createGroup, getSeasonGroups, updateGroup, deleteGroup } from '../controllers/groupController.js';
import { isAuthenticatedUser } from '../middlewares/auth.js';
import { validateCreateGroup, validateUpdateGroup } from '../middleware/validationMiddleware.js';

const router = express.Router();

router.post('/', isAuthenticatedUser, validateCreateGroup, createGroup);
router.get('/season/:seasonId', isAuthenticatedUser, getSeasonGroups);
router.put('/:groupId', isAuthenticatedUser, validateUpdateGroup, updateGroup);
router.delete('/:groupId', isAuthenticatedUser, deleteGroup);

export default router;
