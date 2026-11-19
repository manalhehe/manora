import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import healthRoutes from "./routes/health.routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/health", healthRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`MANORA server running on port ${PORT}`);
});