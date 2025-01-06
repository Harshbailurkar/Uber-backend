import { APIError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { APIResponse } from "../utils/apiResponse.js";
import {
  getAddressCoordinate,
  getDistanceTimeService,
  getAutoCompleteSuggestionsService,
} from "../services/maps.service.js";

const getCordinates = asyncHandler(async (req, res, next) => {
  const { address } = req.query;

  if (!address) {
    return next(new APIError(400, "Address is required"));
  } else if (typeof address !== "string") {
    return next(new APIError(400, "Address must be a string"));
  } else if (address.length < 3) {
    return next(new APIError(400, "Address must be at least 3 characters"));
  }

  const coordinates = await getAddressCoordinate(address);

  if (!coordinates) {
    return new APIError(500, "Failed to fetch coordinates");
  }
  return res.status(200).json(new APIResponse(200, coordinates));
});

const getDistanceTime = asyncHandler(async (req, res, next) => {
  const { origin, destination } = req.query;
  if (!origin || !destination) {
    return new APIError(400, "Origin and destination are required");
  }
  const distanceTime = await getDistanceTimeService(origin, destination);
  if (!distanceTime) {
    return new APIError(500, "Failed to fetch distance and time");
  }
  return res.status(200).json(new APIResponse(200, distanceTime));
});

const getAutoCompleteSuggestions = asyncHandler(async (req, res, next) => {
  const { address } = req.query;
  if (!address) {
    return new APIError(400, "Address is required");
  }
  const suggestions = await getAutoCompleteSuggestionsService(address);
  if (!suggestions) {
    return new APIError(500, "Failed to fetch suggestions");
  }
  return res.status(200).json(new APIResponse(200, suggestions));
});

export { getCordinates, getDistanceTime, getAutoCompleteSuggestions };
