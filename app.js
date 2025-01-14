import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import userRoutes from "./routes/user.routes.js";
import captainRoutes from "./routes/captain.routes.js";
import mapsRoutes from "./routes/maps.routes.js";
import rideRoutes from "./routes/ride.routes.js";
const app = express();
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    // credentials: true,
  })
);

app.use(express.urlencoded({ extended: true, limit: "50kb" }));
app.use(express.static("public"));
app.use(cookieParser());
app.use(express.json({ limit: "50kb" }));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/api/v1/users", userRoutes);
app.use("/api/v1/captain", captainRoutes);
app.use("/api/v1/maps", mapsRoutes);
app.use("/api/v1/ride", rideRoutes);

export default app;
