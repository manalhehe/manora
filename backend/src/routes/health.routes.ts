import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "MANORA API is healthy 🌸",
    timestamp: new Date()
  });
});

export default router;