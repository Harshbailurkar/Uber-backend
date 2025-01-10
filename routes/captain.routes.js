import { Router } from "express";
import {
  loginCaptain,
  registerCaptain,
  logoutCaptain,
  captainProfile,
  captainMonthlyEarnings,
} from "../controllers/captain.controller.js";
import { verifyCaptainJWT } from "../middlewares/authMiddleware.js";
const router = Router();

router.route("/register").post(registerCaptain);
router.route("/login").post(loginCaptain);
router.route("/logout").post(verifyCaptainJWT, logoutCaptain);
router.route("/profile").post(verifyCaptainJWT, captainProfile);
router.route("/earnings").post(verifyCaptainJWT, captainMonthlyEarnings);

export default router;
