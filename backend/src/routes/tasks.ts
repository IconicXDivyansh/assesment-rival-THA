import { Router } from "express";
import { createNewTask, deleteTaskById, getAllTasks, getTaskById, updateTaskById } from "../controllers/taskController.ts";

const router: Router = Router();

router.get("/", getAllTasks);

router.get("/:id", getTaskById);

router.post("/", createNewTask);

router.patch("/:id", updateTaskById);

router.delete("/:id", deleteTaskById);


export default router;