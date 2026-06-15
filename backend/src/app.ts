import cors from "cors";
import "dotenv/config";
import type { Express } from "express";
import express from "express";
import helmet from "helmet";
import authRouter from "./routes/auth.ts";
import taskRouter from "./routes/tasks.ts";

const app: Express = express();

// middlewares
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "10kb" }));

// Routes
app.use("/auth", authRouter);
app.use("/tasks", taskRouter);

// Health check
app.get("/", (_req, res) => {
  res.json({ message: "Task API is running" });
});

export default app;
