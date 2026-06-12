import { eq } from "drizzle-orm";
import type { Request, Response } from "express";
import { db } from "../db/db.ts";
import { tasks } from "../db/schema.ts";


export const getAllTasks = async (req: Request, res: Response) => {
    const allTasks = await db.select().from(tasks);
    res.status(200).json(allTasks);
}

export const getTaskById = async (req: Request, res: Response) => {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, req.params.id as string))

    if(!task){
        res.status(404).json({error: "task not found"});
        return;
    }
    res.json(task);
}

export const createNewTask = async (req: Request, res: Response) => {
    const {title, description, status, priority, dueDate} = req.body;

        const [newTask] = await db.insert(tasks).values({
            title,
            description: description || "",
            status: status || "pending",
            priority: priority || "medium",
            dueDate: dueDate ? new Date(dueDate) : null
        }).returning();

    res.status(201).json(newTask);
}

export const updateTaskById = async(req: Request, res: Response) => {
   const [updated] = await db.update(tasks).set({...req.body, updatedAt: new Date()}).where(eq(tasks.id, req.params.id as string)).returning();

   if(!updated){
    res.status(404).json({error: "Task not found"});
    return;
    }

    res.json(updated);
}

export const deleteTaskById = async (req: Request, res: Response) => {
    const [deleted] = await db.delete(tasks).where(eq(tasks.id, req.params.id as string)).returning()

    if(!deleted){
        res.status(404).json({error: "Task not found"});
        return;
    }

    res.json({message: "Task deleted", task: deleted})
}
