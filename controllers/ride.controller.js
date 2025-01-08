import { asyncHandler } from "../utils/asyncHandler.js";
import { APIError } from "../utils/APIError.js";
import { APIResponse } from "../utils/APIResponse.js";
import { createRideService } from "../services/ride.service.js";
import { getFare } from "../services/ride.service.js";
import {
  getCaptainsInTheRadius,
  getAddressCoordinate,
} from "../services/maps.service.js";

import { sendMessageToSocketId } from "../socket.js";
import { Ride } from "../models/ride.model.js";

const createRide = asyncHandler(async (req, res, next) => {
  const { pickup, destination, vehicleType } = req.body;

  if (!pickup || !destination || !vehicleType) {
    return new APIError("Pickup and destination are required");
  }
  if (pickup.length < 3 || destination.length < 3) {
    return new APIError("Pickup and destination must be at least 3 characters");
  }

  if (pickup === destination) {
    return new APIError("Pickup and destination cannot be the same");
  }

  const userId = req.user._id;

  if (!userId) {
    return new APIError("User is required");
  }

  const ride = await createRideService({
    user: userId,
    pickup,
    destination,
    vehicleType,
  });

  if (!ride) {
    return new APIError("Failed to create ride");
  }
  res.status(201).json(new APIResponse(201, ride));
  const pickupCordinate = await getAddressCoordinate(pickup);
  const data = {
    ltd: pickupCordinate.lat,
    lng: pickupCordinate.lng,
  };

  const captainsInRadius = await getCaptainsInTheRadius(data.ltd, data.lng, 2);

  ride.otp = "";
  const rideWithUser = await Ride.findById(ride._id)
    .populate("user")
    .select("-password -refreshToken -socketId ");
  await captainsInRadius.map((captain) => {
    sendMessageToSocketId(captain.socketId, "new-ride", {
      data: rideWithUser,
    });
  });
});

const calculateFare = asyncHandler(async (req, res, next) => {
  const { pickup, destination } = req.body;

  if (!pickup || !destination) {
    return new APIError("Pickup and destination are required");
  }

  const fare = await getFare(pickup, destination);

  if (!fare) {
    return new APIError("Failed to calculate fare");
  }

  return res.status(200).json(new APIResponse(200, fare));
});

const confirmRide = asyncHandler(async (req, res, next) => {
  const { rideId } = req.body;
  await Ride.findByIdAndUpdate(rideId, {
    status: "accepted",
    captain: req.captain._id,
  });

  const ride = await Ride.findById(rideId)
    .populate("user")
    .populate("captain")
    .select("-password -refreshToken -socketId +otp");

  if (!ride) {
    return new APIError("Ride not found");
  }
  sendMessageToSocketId(ride.user.socketId, "ride-confirmed", {
    data: ride,
  });

  res.status(200).json(new APIResponse(200, ride));
});

const startRide = asyncHandler(async (req, res, next) => {
  const { rideId, otp } = req.body;

  if (!otp || otp.length !== 4) {
    return new APIError("OTP is required");
  }
  if (!rideId) {
    return new APIError("Ride ID is required");
  }

  const ride = await Ride.findOne({ _id: rideId })
    .populate("user")
    .populate("captain")
    .select("+otp");

  if (!ride) {
    return new APIError("Ride not found");
  }
  if (ride.status !== "accepted") {
    return new APIError("Ride is not accepted yet");
  }
  if (ride.otp !== otp) {
    return new APIError("Invalid OTP");
  }

  const updatedRide = await Ride.findByIdAndUpdate(
    rideId,
    { status: "ongoing" },
    { new: true }
  )
    .populate("user")
    .populate("captain");

  sendMessageToSocketId(updatedRide.user.socketId, "ride-started", {
    data: updatedRide,
  });

  return res.status(200).json(new APIResponse(200, updatedRide));
});

const endRide = asyncHandler(async (req, res, next) => {
  const { rideId } = req.body;

  if (!rideId) {
    return new APIError("Ride ID is required");
  }

  const ride = await Ride.findOne({ _id: rideId, captain: req.captain._id })
    .populate("user")
    .populate("captain");

  if (!ride) {
    return new APIError("Ride not found");
  }
  if (ride.status !== "ongoing") {
    return new APIError("Ride is not ongoing");
  }
  const updatedRide = await Ride.findByIdAndUpdate(rideId, {
    status: "completed",
  });

  sendMessageToSocketId(ride.user.socketId, "ride-ended", {
    data: updatedRide,
  });

  return res.status(200).json(new APIResponse(200, updatedRide));
});

export { createRide, calculateFare, confirmRide, startRide, endRide };
