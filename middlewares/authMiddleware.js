import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { Captain } from "../models/captain.model.js";
import { APIError } from "../utils/APIError.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    const accessToken =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!accessToken) {
      throw new APIError(401, "Access Token Required");
    }

    const decodedToken = jwt.verify(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken._id).select(
      "-password -refreshToken"
    );
    if (!user) {
      throw new APIError(404, "user not found");
    }
    req.user = user;
    next();
  } catch (error) {
    throw new APIError(401, "Invalid Access Token");
  }
});
export const verifyCaptainJWT = asyncHandler(async (req, res, next) => {
  try {
    const accessToken =
      req.cookies?.captainAccessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!accessToken) {
      throw new APIError(401, "Access Token Required");
    }

    const decodedToken = jwt.verify(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET
    );

    const captain = await Captain.findById(decodedToken._id).select(
      "-password -refreshToken"
    );
    if (!captain) {
      throw new APIError(404, "user not found");
    }
    req.captain = captain;
    next();
  } catch (error) {
    throw new APIError(401, "Invalid Access Token");
  }
});
