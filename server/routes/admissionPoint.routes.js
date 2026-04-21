import express from 'express';
import { createAdmissionPoint, uploadAdmissionFiles, getPendingAdmissionPoints, updateAdmissionPointStatus } from '../controllers/admissionPoint.controller.js';

const router = express.Router();

router.post('/register', uploadAdmissionFiles, createAdmissionPoint);
router.get('/pending', getPendingAdmissionPoints);
router.patch('/:id/status', updateAdmissionPointStatus);

export default router;
