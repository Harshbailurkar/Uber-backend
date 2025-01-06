import { Router } from "express";
import {
  loginCaptain,
  registerCaptain,
  logoutCaptain,
  captainProfile,
} from "../controllers/captain.controller.js";
import { verifyCaptainJWT } from "../middlewares/authMiddleware.js";
const router = Router();

router.route("/register").post(registerCaptain);
router.route("/login").post(loginCaptain);
router.route("/logout").post(verifyCaptainJWT, logoutCaptain);
router.route("/profile").post(verifyCaptainJWT, captainProfile);

export default router;
