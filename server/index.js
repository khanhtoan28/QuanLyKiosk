// server/index.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./mongodb/connection.js";

// ✅ Import route files
import authRouter from "./routes/auth.js";
import kioskPlanRoutes from "./routes/kioskPlanRoutes.js";
import dropdownRoutes from "./routes/dropdownOptions.js"; // sửa require -> import

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Mount routes
app.use("/api", authRouter);
app.use("/api/kiosk-plans", kioskPlanRoutes);
app.use("/api/dropdown-options", dropdownRoutes);

// ✅ Root route
app.get("/", (req, res) => {
  res.send("✅ Backend server is running...");
});

const startServer = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(process.env.PORT, () => {
      console.log(`🚀 Server is running at http://localhost:${process.env.PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
  }
};

startServer();
