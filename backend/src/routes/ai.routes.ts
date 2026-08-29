import { Router } from 'express';
import { analyzeApplication } from '../controllers/ai.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { UserRole } from '@prisma/client';
const router = Router();
router.post('/analyze', requireAuth, requireRole(UserRole.CANDIDATE), asyncHandler(analyzeApplication));
export default router;
