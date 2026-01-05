import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./db";
import voterRoutes from "./routes/voter";
import adminRoutes from "./routes/admin";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

connectDB();

app.use("/api/voters", voterRoutes);
app.use("/api/admin", adminRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Backend running on port ${PORT}`);
});