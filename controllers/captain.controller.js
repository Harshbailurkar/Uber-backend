import { Captain } from "../models/captain.model.js";
import { Ride } from "../models/ride.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { APIError } from "../utils/APIError.js";
import { APIResponse } from "../utils/APIResponse.js";
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

const captainMonthlyEarnings = asyncHandler(async (req, res, next) => {
  if (!req.captain || !req.captain._id) {
    throw new APIError(400, "Captain details are missing in the request");
  }

  const captainId = req.captain._id;

  const currentDate = new Date();
  const startOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  );
  const endOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  );

  const rides = await Ride.aggregate([
    {
      $match: {
        captain: captainId,
        status: "completed",
        createdAt: { $gte: startOfMonth, $lte: endOfMonth },
      },
    },
    {
      $group: {
        _id: null,
        totalEarnings: { $sum: "$fare" },
        rides: { $push: "$$ROOT" },
      },
    },
  ]);

  let totalEarnings = rides.length > 0 ? rides[0].totalEarnings : 0;
  let totalDistance =
    rides.length > 0
      ? rides[0].rides.reduce((acc, ride) => acc + ride.distance, 0)
      : 0;
  // convert distance to km
  totalDistance = parseFloat((totalDistance / 1000).toFixed(2));
  totalEarnings = Math.round(totalEarnings);
  const totalMonthlyRides = rides.length > 0 ? rides[0].rides.length : 0;

  return res
    .status(200)
    .json(
      new APIResponse(
        200,
        { totalEarnings, totalMonthlyRides, totalDistance },
        "Captain monthly earnings and completed rides"
      )
    );
});

export {
  loginCaptain,
  registerCaptain,
  logoutCaptain,
  captainProfile,
  captainMonthlyEarnings,
};
