import { Ride } from "../models/ride.model.js";
import { APIError } from "../utils/APIError.js";
import { getDistanceTimeService } from "./maps.service.js";

import crypto from "crypto";

const getFare = async (pickup, destination) => {
  if (!pickup || !destination) {
    throw new APIError("Pickup and destination are required");
  }
  const distanceTime = await getDistanceTimeService(pickup, destination);

  const baseFare = {
    auto: 30,
    car: 50,
    bike: 20,
  };

  const perKmRate = {
    auto: 10,
    car: 15,
    bike: 8,
  };

  const fare = {
    auto: baseFare.auto + (perKmRate.auto * distanceTime.distance.value) / 1000,
    car: baseFare.car + (perKmRate.car * distanceTime.distance.value) / 1000,
    bike: baseFare.bike + (perKmRate.bike * distanceTime.distance.value) / 1000,
  };

  return fare;
};
const getOPT = async (num) => {
  const otp = crypto
    .randomInt(Math.pow(10, num - 1), Math.pow(10, num))
    .toString()
    .padStart(num, "0");
  return otp;
};

const createRideService = async ({
  user,
  pickup,
  destination,
  vehicleType,
}) => {
  if (!user || !pickup || !destination || !vehicleType) {
    throw new APIError(
      "User, pickup, destination and vehicleType are required"
    );
  }

  const fare = await getFare(pickup, destination);
  const otp = await getOPT(4);

  const ride = await Ride.create({
    user,
    pickup,
    destination,
    fare: fare[vehicleType],
    otp,
    status: "pending",
  });
  console.log(ride);

  return ride;
};

export { createRideService, getFare };
