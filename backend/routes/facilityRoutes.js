import express from 'express';
import { getFacilities, createFacility } from '../controllers/facilityController.js';
import { isAuthenticatedUser } from '../middlewares/auth.js';

const router = express.Router();

router.get('/', isAuthenticatedUser, getFacilities);
router.post('/', isAuthenticatedUser, createFacility);

export default router;
