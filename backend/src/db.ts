import mongoose from "mongoose";
import { log } from "node:console";

export const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI as string);
        console.log("MongoDB Connected");
    } catch (err) {
        console.error("Failed to connect MongoDB", err);
        process.exit(1);
    }
};