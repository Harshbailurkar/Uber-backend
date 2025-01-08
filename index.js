import { configDotenv } from "dotenv";
import app from "./app.js";
import connectDB from "./db/index.js";
import { initializeSocket } from "./socket.js";

configDotenv({
  path: "./.env",
});
const PORT = 4000;

connectDB()
  .then(() => {
    const server = app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
    initializeSocket(server);
  })
  .catch((error) => {
    console.log("Connection error: " + error);
  });
