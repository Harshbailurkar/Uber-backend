import { Server } from "socket.io";
import { User } from "./models/user.model.js";
import { Captain } from "./models/captain.model.js";
import { APIError } from "./utils/APIError.js";
let io;

export function initializeSocket(server) {
  io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    // console.log(`New client connected: ${socket.id}`);

    socket.on("join", async (data) => {
      const { userId, userType } = data;

      // console.log(`User ${userId} joined as ${userType}`);
      if (userType == "user") {
        await User.findByIdAndUpdate(userId, { socketId: socket.id });
      } else {
        await Captain.findByIdAndUpdate(userId, { socketId: socket.id });
      }
    });

    socket.on("update-location-captain", async (data) => {
      const { userId, location } = data;

      if (!location || !location.ltd || !location.lng) {
        return socket.emit("error", "Invalid location");
      }
      // console.log(`User ${userId} updated location as ${location}`);
      const updatedCaptain = await Captain.findByIdAndUpdate(userId, {
        location: {
          ltd: location.ltd,
          lng: location.lng,
        },
      });

      if (!updatedCaptain) {
        new APIError("failed to update the captain");
      }
    });

    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });
}

export function sendMessageToSocketId(socketId, event, message) {
  if (io) {
    io.to(socketId).emit(event, message);
  } else {
    console.error("Socket.io is not initialized.");
  }
}
