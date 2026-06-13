import cors from "cors";
import "dotenv/config";
import express from "express";
import taskRouter from "./routes/tasks.ts";

const app = express();
const PORT = process.env.PORT || 8000;


// middlewares
app.use(helmet());
app.use(cors());
app.use(express.json({limit: '10kb'}));

// Routes
app.use("/tasks", taskRouter);

// Health check
app.get("/", (_req, res) => {
  res.json({ message: "Task API is running" });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
