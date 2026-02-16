import express from 'express';
import { saveTeamIdentity, getTeam, saveDisciplines, saveFacilities, updateTeam } from '../controllers/teamController.js';
import { isAuthenticatedUser } from '../middlewares/auth.js';

const router = express.Router();

router.post('/identity', isAuthenticatedUser, saveTeamIdentity);
router.post('/disciplines', isAuthenticatedUser, saveDisciplines);
router.post('/facilities', isAuthenticatedUser, saveFacilities);
router.put('/', isAuthenticatedUser, updateTeam);
router.get('/', isAuthenticatedUser, getTeam);

export default router;
