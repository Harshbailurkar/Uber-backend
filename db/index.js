import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/${process.env.DB_NAME}`);
    console.log(`Connected to database! ${process.env.DB_NAME}`);
    console.log("Host: " + mongoose.connection.host);
  } catch (error) {
    console.error("Connection error: " + error);
    process.exit(1);
  }
};
export default connectDB;
