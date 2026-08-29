import { Router } from 'express';
import { listJobs, getJob } from '../controllers/job.controller.js';
import { asyncHandler } from '../utils/asyncHandler.js';
const router = Router();
router.get('/', asyncHandler(listJobs));
router.get('/:id', asyncHandler(getJob));
export default router;
