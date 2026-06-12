import { pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const statusEnum = pgEnum("task_status", ["pending", "in-progress", "completed"]);
export const priorityEnum = pgEnum("task_priority", ["low", "medium", "high"]);

export const tasks = pgTable("tasks", {
    id: uuid("id").defaultRandom().primaryKey(),
    title: text("title").notNull(),
    description: text("description").default(""),
    status: statusEnum("status").default("pending").notNull(),
    priority: priorityEnum("priority").default("medium").notNull(),
    dueDate: timestamp("due_date"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
})
