import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import emailRoutes from "./routes/email.routes";

// Start the BullMQ worker
import "./queues/email.worker";

dotenv.config();

const app = express();

const PORT = Number(process.env.PORT) || 5000;

/* =========================
   MIDDLEWARE
========================= */

app.use(cors());

app.use(express.json());

/* =========================
   HEALTH CHECK
========================= */

app.get("/", (_req, res) => {
  res.status(200).json({
    message: "Email Scheduler API is running",
    status: "ok",
  });
});

/* =========================
   EMAIL ROUTES
========================= */

app.use("/emails", emailRoutes);

/* =========================
   START SERVER
========================= */

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log("BullMQ email worker started");
});