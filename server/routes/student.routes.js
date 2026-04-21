import express from 'express';
import { enrollStudent, uploadStudentDocs } from '../controllers/student.controller.js';

const router = express.Router();

router.post('/register', uploadStudentDocs, enrollStudent);

export default router;
