import { Router } from "express";
import { verifyJWT } from "../middlewares/authMiddleware.js";
import {
  getCordinates,
  getDistanceTime,
  getAutoCompleteSuggestions,
} from "../controllers/maps.controller.js";

const router = Router();

router.route("/get-cordinates").get(verifyJWT, getCordinates);
router.route("/get-distance-time").get(verifyJWT, getDistanceTime);

router.route("/get-suggestions").get(verifyJWT, getAutoCompleteSuggestions);
export default router;
