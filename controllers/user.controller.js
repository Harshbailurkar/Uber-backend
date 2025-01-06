import { User } from "../models/user.model.js";
import { APIError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { APIResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";
const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new APIError(404, "User not found");
    }

    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (err) {
    console.error("Error generating tokens:", err);
    throw new Error(500, "Failed to generate tokens");
  }
};

const registerUser = async (req, res, next) => {
  try {
    console.log(req.body);
    const { firstName, lastName, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new APIError(400, "Email already exists");
    }

    const newUser = await User.create({
      fullName: { firstName, lastName },
      email,
      password,
    });

    const user = await User.findById(newUser._id);
    if (!user) {
      throw new APIError(404, "user does not created please try again");
    }
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      user._id
    );
    const tokenOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "None",
      path: "/",
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, tokenOptions)
      .cookie("refreshToken", refreshToken, tokenOptions)
      .json(
        new APIResponse(
          200,
          { user: newUser, accessToken, refreshToken },
          "User registered successfully"
        )
      );
  } catch (error) {
    console.error("Error registering user:", error.message);
    return res.status(500).send(error.message);
  }
};

const loginUser = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({
    email,
  });
  if (!user) {
    throw new APIError(404, "User not found");
  }

  const isPasswordValid = await user.matchPassword(password);
  if (!isPasswordValid) {
    throw new APIError(400, "Incorrect Password");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );
  const loggedInUser = await User.findById(user._id)
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
    .cookie("accessToken", accessToken, tokenOptions)
    .cookie("refreshToken", refreshToken, tokenOptions)
    .json(
      new APIResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "User logged in successfully"
      )
    );
});
const logoutUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $unset: { refreshToken: 1 } },
    { new: true }
  );
  if (!user) {
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
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new APIResponse(200, null, "User logged out successfully"));
});

const getUserProfile = asyncHandler(async (req, res, next) => {
  const accessToken = req.headers.authorization.split(" ")[1];
  const decodedToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

  const user = await User.findById(decodedToken._id).select(
    "-password -refreshToken"
  );
  if (!user) {
    throw new APIError(400, "invalied Token");
  }

  return res.status(200).json(new APIResponse(200, user, "User Profile"));
});

export { registerUser, loginUser, logoutUser, getUserProfile };
