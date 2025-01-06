import Router from "express";
import { createRide } from "../controllers/ride.controller.js";
import { verifyJWT } from "../middlewares/authMiddleware.js";
import { calculateFare } from "../controllers/ride.controller.js";
const router = Router();

router.route("/create").post(verifyJWT, createRide);
router.route("/fare").post(verifyJWT, calculateFare);
export default router;

router.route;
