import express from "express";
import {
  loginUser,
  loginAdmissionPoint,
  getAllUsers,
} from "../controllers/auth.controller.js";
import { isAuthorized, requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.post("/login/user", loginUser);
router.post("/login/admission-point", loginAdmissionPoint);

router.get("/users", requireAuth, isAuthorized({ types: ["admin"] }), getAllUsers);

export default router;
