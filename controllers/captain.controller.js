import { Captain } from "../models/captain.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { APIError } from "../utils/apiError.js";
import { APIResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshToken = async (captainId) => {
  try {
    const captain = await Captain.findById(captainId);
    if (!captain) {
      throw new APIError(404, "captain not found");
    }

    const accessToken = await captain.generateAccessToken();
    const refreshToken = await captain.generateRefreshToken();

    captain.refreshToken = refreshToken;
    await captain.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (err) {
    console.error("Error generating tokens:", err);
    throw new Error(500, "Failed to generate tokens");
  }
};

const loginCaptain = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new APIError(400, "Missing required fields");
  }

  const captain = await Captain.findOne({ email });
  if (!captain) {
    throw new APIError(404, "Captain not found");
  }
  const isPasswordValid = await captain.matchPassword(password);
  if (!isPasswordValid) {
    throw new APIError(400, "Incorrect Password");
  }
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    captain._id
  );
  const loggedInCaptain = await Captain.findById(captain._id)
    .select("-password -refreshToken")
    .lean();

  const tokenOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "None",
    path: "/",
  };
  return res
    .status(200)
    .cookie("captainAccessToken", accessToken, tokenOptions)
    .cookie("captainRefreshToken", refreshToken, tokenOptions)
    .json(
      new APIResponse(
        200,
        { captain: loggedInCaptain, accessToken, refreshToken },
        "captain logged in successfully"
      )
    );
});

const registerCaptain = asyncHandler(async (req, res, next) => {
  const {
    firstName,
    lastName,
    email,
    password,
    vechicalType,
    vehicalCapacity,
    vehicalColor,
    vehicalPlate,
  } = req.body;

  if (
    !firstName ||
    !lastName ||
    !email ||
    !password ||
    !vechicalType ||
    !vehicalCapacity ||
    !vehicalColor ||
    !vehicalPlate
  ) {
    throw new APIError(400, "Missing required fields");
  }

  const existingCaptain = await Captain.findOne({
    email,
  });
  if (existingCaptain) {
    throw new APIError(400, "Email already exists");
  }
  const NewCaptain = await Captain.create({
    fullName: { firstName, lastName },
    email,
    password,
    vehical: {
      color: vehicalColor,
      plate: vehicalPlate,
      capacity: vehicalCapacity,
      vehicleType: vechicalType,
    },
  });

  const captain = await Captain.findById(NewCaptain._id);
  if (!captain) {
    throw new APIError(404, "captain does not created please try again");
  }
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    captain._id
  );
  const tokenOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "None",
    path: "/",
  };
  return res
    .status(200)
    .cookie("captainAccessToken", accessToken, tokenOptions)
    .cookie("captainRefreshToken", refreshToken, tokenOptions)
    .json(
      new APIResponse(
        200,
        { captain, accessToken, refreshToken },
        "captain registered successfully"
      )
    );
});

const logoutCaptain = asyncHandler(async (req, res, next) => {
  console.log("logout captain");

  const captain = await Captain.findByIdAndUpdate(
    req.captain._id,
    { $unset: { refreshToken: 1 } },
    { new: true }
  );
  if (!captain) {
    throw new APIError(500, "Failed to log out user");
  }

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "None",
    path: "/",
  };

  return res
    .status(200)
    .clearCookie("captainAccessToken", cookieOptions)
    .clearCookie("captainRefreshToken", cookieOptions)
    .json(new APIResponse(200, null, "captain logged out successfully"));
});

const captainProfile = asyncHandler(async (req, res, next) => {
  const accessToken = req.headers.authorization.split(" ")[1];
  const decodedToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

  const captain = await Captain.findById(decodedToken._id).select(
    "-password -refreshToken"
  );
  if (!captain) {
    throw new APIError(404, "captain not found");
  }
  return res.status(200).json(new APIResponse(200, captain, "captain profile"));
});

export { loginCaptain, registerCaptain, logoutCaptain, captainProfile };
