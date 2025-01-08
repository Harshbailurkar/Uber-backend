import Router from "express";
import { createRide } from "../controllers/ride.controller.js";
import { verifyJWT, verifyCaptainJWT } from "../middlewares/authMiddleware.js";
import {
  calculateFare,
  startRide,
  confirmRide,
  endRide,
} from "../controllers/ride.controller.js";

const router = Router();

router.route("/create").post(verifyJWT, createRide);
router.route("/fare").post(verifyJWT, calculateFare);
router.route("/confirm").post(verifyCaptainJWT, confirmRide);
router.route("/start-ride").post(verifyCaptainJWT, startRide);
router.route("/end-ride").post(verifyCaptainJWT, endRide);
export default router;

router.route;
