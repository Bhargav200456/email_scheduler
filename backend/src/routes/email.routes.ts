import { Router } from "express";

import {
  scheduleEmailController,
  getEmailsController,
} from "../controllers/email.controller";

const router = Router();

router.post("/schedule", scheduleEmailController);

router.get("/", getEmailsController);

export default router;