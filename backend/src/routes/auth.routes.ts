import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import {
  getCurrentUser,
  login,
  logout,
  register,
} from "../controllers/auth.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { checkRequestOrigin } from "../middleware/origin-check";

const router = Router();
const authRateLimit = rateLimit({
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Too many authentication attempts. Try again later." },
  windowMs: 15 * 60 * 1000,
});

router.post("/register", checkRequestOrigin, authRateLimit, register);
router.post("/login", checkRequestOrigin, authRateLimit, login);
router.post("/logout", checkRequestOrigin, authRateLimit, logout);
router.get("/me", requireAuth, getCurrentUser);

export default router;
