import { asyncHandler } from "../utils/asyncHandler.js";
import { APIError } from "../utils/apiError.js";
import { APIResponse } from "../utils/apiResponse.js";
import { createRideService } from "../services/ride.service.js";
import { getFare } from "../services/ride.service.js";

const createRide = asyncHandler(async (req, res, next) => {
  const { pickup, destination, vehicleType } = req.body;

  if (!pickup || !destination || !vehicleType) {
    return new APIError("Pickup and destination are required");
  }
  if (pickup.length < 3 || destination.length < 3) {
    return new APIError("Pickup and destination must be at least 3 characters");
  }
  //check if pickup and destination are the same
  if (pickup === destination) {
    return new APIError("Pickup and destination cannot be the same");
  }
  console.log("creating....");
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
  return res.status(201).json(new APIResponse(201, ride));
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

export { createRide, calculateFare };
