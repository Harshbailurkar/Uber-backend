import axios from "axios";
import { APIError } from "../utils/apiError.js";
import { APIResponse } from "../utils/apiResponse.js";
const getAddressCoordinate = async (address) => {
  try {
    const response = await axios.get(
      "https://maps.googleapis.com/maps/api/geocode/json",
      {
        params: {
          address: address,
          key: process.env.GOOGLE_MAPS_API,
        },
      }
    );

    if (response.data.status !== "OK") {
      throw new Error("Failed to fetch coordinates");
    }

    const { lat, lng } = response.data.results[0].geometry.location;
    return { lat, lng };
  } catch (error) {
    console.error("Error fetching coordinates:", error.message);
    throw new Error("Failed to fetch coordinates");
  }
};

const getDistanceTimeService = async (origin, destination) => {
  if (!origin || !destination) {
    throw new APIError("Origin and destination are required");
  }
  const API_KEY = process.env.GOOGLE_MAPS_API;
  const URL = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(
    origin
  )}&destinations=${encodeURIComponent(destination)}&key=${API_KEY}`;
  try {
    const response = await axios.get(URL);
    if (response.data.status !== "OK") {
      throw new APIError("Failed to fetch distance and time");
    } else if (response.data.rows[0].elements[0].status === "ZERO_RESULTS") {
      throw new APIError("Failed to fetch distance and time");
    } else if (response.data.status === "OK") {
      return response.data.rows[0].elements[0];
    } else {
      throw new APIError("Failed to fetch distance and time");
    }
  } catch (error) {
    console.error("Error fetching distance and time:", error.message);
    throw new Error("Failed to fetch distance and time");
  }
};

const getAutoCompleteSuggestionsService = async (address) => {
  if (!address) {
    throw new APIError("Address is required");
  }
  const API_KEY = process.env.GOOGLE_MAPS_API;
  const URL = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
    address
  )}&key=${API_KEY}`;

  try {
    const response = await axios.get(URL);
    if (response.data.status !== "OK") {
      throw new APIError("Failed to fetch suggestions");
    }
    return response.data.predictions;
  } catch (error) {
    console.error("Error fetching suggestions:", error.message);
    throw new Error("Failed to fetch suggestions");
  }
};
export {
  getAddressCoordinate,
  getDistanceTimeService,
  getAutoCompleteSuggestionsService,
};
