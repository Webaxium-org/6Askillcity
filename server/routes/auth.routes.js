import express from "express";
import {
  loginUser,
  loginAdmissionPoint,
} from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/login/user", loginUser);
router.post("/login/admission-point", loginAdmissionPoint);

export default router;
