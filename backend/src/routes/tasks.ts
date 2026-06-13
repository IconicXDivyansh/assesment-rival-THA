import { Router } from "express";
import { createNewTask, deleteTaskById, getAllTasks, getTaskById, updateTaskById } from "../controllers/taskController.ts";
import { authenticate } from "../middlewares/auth.ts";

const router: Router = Router();

// All task routes require authentication
router.use(authenticate);

router.get("/", getAllTasks);

router.get("/:id", getTaskById);

router.post("/", createNewTask);

router.patch("/:id", updateTaskById);

router.delete("/:id", deleteTaskById);


export default router;