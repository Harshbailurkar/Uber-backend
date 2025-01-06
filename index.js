import { configDotenv } from "dotenv";
import app from "./app.js";
import connectDB from "./db/index.js";

configDotenv({
  path: "./.env",
});
const PORT = 4000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.log("Connection error: " + error);
  });
