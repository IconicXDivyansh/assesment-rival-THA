import { and, asc, count, desc, eq, ilike } from "drizzle-orm";
import type { Request, Response } from "express";
import z from "zod";
import { db } from "../db/db.ts";
import { tasks } from "../db/schema.ts";
import { createTaskSchema, updateTaskSchema } from "../types/taskSchemaType.ts";

const isValidUUID = (id: string) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

export const getAllTasks = async (req: Request, res: Response) => {
    try {
        const { status, page = "1", limit = "10", search, sort = "createdAt", order = "desc" } = req.query;

        const pageNum = Math.max(1, parseInt(page as string) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 10));
        const offset = (pageNum - 1) * limitNum;

        const userId = (req as any).userId;

        const conditions = [eq(tasks.userId, userId)];

        // Filter by status
        if (status && typeof status === "string") {
            conditions.push(eq(tasks.status, status as any));
        }

        // Search by title
        if (search && typeof search === "string") {
            conditions.push(ilike(tasks.title, `%${search}%`));
        }

        const whereClause = and(...conditions);

        const query = db.select().from(tasks).$dynamic();
        const countQuery = db.select({ count: count() }).from(tasks).$dynamic();

        query.where(whereClause);
        countQuery.where(whereClause);

        // Sort
        const sortColumn = sort === "dueDate" ? tasks.dueDate
            : sort === "priority" ? tasks.priority
            : sort === "createdAt" ? tasks.createdAt
            : tasks.createdAt;

        if (order === "asc") {
            query.orderBy(asc(sortColumn));
        } else {
            query.orderBy(desc(sortColumn));
        }

        const allTasks = await query.limit(limitNum).offset(offset);
        const [{ count: total }] = await countQuery;

        res.status(200).json({
            success: true,
            data: allTasks,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum),
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: "Internal server error" });
    }
};

export const getTaskById = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;

        if (!isValidUUID(id)) {
            res.status(400).json({ success: false, error: "Invalid task ID format" });
            return;
        }

        const [task] = await db.select().from(tasks).where(
            and(eq(tasks.id, id), eq(tasks.userId, (req as any).userId))
        );

        if (!task) {
            res.status(404).json({ success: false, error: "Task not found" });
            return;
        }
        res.json({ success: true, data: task });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: "Internal server error" });
    }
};

export const createNewTask = async (req: Request, res: Response) => {
    try {
        const result = createTaskSchema.safeParse(req.body);

        if (!result.success) {
            res.status(400).json({ success: false, error: z.treeifyError(result.error) });
            return;
        }

        const { title, description, status, priority, dueDate } = result.data;

        const [newTask] = await db.insert(tasks).values({
            userId: (req as any).userId,
            title,
            description: description || "",
            status: status || "pending",
            priority: priority || "medium",
            dueDate: dueDate ? new Date(dueDate) : null,
        }).returning();

        res.status(201).json({ success: true, data: newTask });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: "Internal server error" });
    }
};

export const updateTaskById = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;

        if (!isValidUUID(id)) {
            res.status(400).json({ success: false, error: "Invalid task ID format" });
            return;
        }

        const result = updateTaskSchema.safeParse(req.body);

        if (!result.success) {
            res.status(400).json({ success: false, error: z.treeifyError(result.error) });
            return;
        }

        const { dueDate, ...rest } = result.data;

        const [updated] = await db.update(tasks)
            .set({
                ...rest,
                ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
                updatedAt: new Date(),
            })
            .where(and(eq(tasks.id, id), eq(tasks.userId, (req as any).userId)))
            .returning();

        if (!updated) {
            res.status(404).json({ success: false, error: "Task not found" });
            return;
        }

        res.json({ success: true, data: updated });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: "Internal server error" });
    }
};

export const deleteTaskById = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;

        if (!isValidUUID(id)) {
            res.status(400).json({ success: false, error: "Invalid task ID format" });
            return;
        }

        const [deleted] = await db.delete(tasks).where(
            and(eq(tasks.id, id), eq(tasks.userId, (req as any).userId))
        ).returning();

        if (!deleted) {
            res.status(404).json({ success: false, error: "Task not found" });
            return;
        }

        res.json({ success: true, message: "Task deleted", data: deleted });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: "Internal server error" });
    }
};
