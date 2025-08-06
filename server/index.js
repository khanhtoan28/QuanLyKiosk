// server/index.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./mongodb/connection.js";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Import route files
import authRouter from "./routes/auth.js";
import kioskPlanRoutes from "./routes/kioskPlanRoutes.js";
import dropdownRoutes from "./routes/dropdownOptions.js";
import notificationsRoute from "./routes/notifications.js";
import verifyEmailRoute from './routes/verifyEmail.js';
import User from "./models/register.js";


dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());


app.use("/api", authRouter);
app.use("/api/kiosk-plans", kioskPlanRoutes);
app.use("/api/dropdown-options", dropdownRoutes);
app.use("/api/notifications", notificationsRoute);
app.use("/api", notificationsRoute); 
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api', verifyEmailRoute);


app.put('/api/users/:id/status', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const { id } = req.params;
    const rawBody = req.body.toString();
    const { isOnline } = JSON.parse(rawBody);

    // Cập nhật DB
    await User.findByIdAndUpdate(id, {
      isOnline,
      lastActive: new Date(),
    });

    console.log(`✅ Trạng thái user ${id} cập nhật thành:`, isOnline);
    res.status(200).json({ message: "Trạng thái cập nhật" });
  } catch (err) {
    console.error("❌ Lỗi cập nhật trạng thái:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
});
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
