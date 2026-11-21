import { Router } from "express";
import {
  completeOnboarding,
  getOnboarding,
  saveActivities,
  saveGoals,
  saveLifestyle,
  saveProfile,
} from "../controllers/onboarding.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { checkRequestOrigin } from "../middleware/origin-check";

const router = Router();

router.get("/", requireAuth, getOnboarding);
router.put("/profile", requireAuth, checkRequestOrigin, saveProfile);
router.put("/goals", requireAuth, checkRequestOrigin, saveGoals);
router.put("/activities", requireAuth, checkRequestOrigin, saveActivities);
router.put("/lifestyle", requireAuth, checkRequestOrigin, saveLifestyle);
router.post("/complete", requireAuth, checkRequestOrigin, completeOnboarding);

export default router;
