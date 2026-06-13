import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { db } from "../db/db.ts";
import { users } from "../db/schema.ts";

const JWT_SECRET = process.env.JWT_SECRET!;

export const signup = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400).json({ success: false, error: "Email and password are required" });
            return;
        }

        // Check if user already exists
        const [existing] = await db.select().from(users).where(eq(users.email, email));
        if (existing) {
            res.status(409).json({ success: false, error: "Unable to create account" });
            return;
        }

        // Hash password (10 salt rounds)
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const [newUser] = await db.insert(users).values({
            email,
            password: hashedPassword,
        }).returning();

        // Generate token
        const token = jwt.sign({ userId: newUser.id }, JWT_SECRET, { expiresIn: "7d" });

        res.status(201).json({
            success: true,
            data: { token, user: { id: newUser.id, email: newUser.email } },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: "Internal server error" });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400).json({ success: false, error: "Email and password are required" });
            return;
        }

        // Find user
        const [user] = await db.select().from(users).where(eq(users.email, email));
        if (!user) {
            res.status(401).json({ success: false, error: "Invalid email or password" });
            return;
        }

        // Compare password
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            res.status(401).json({ success: false, error: "Invalid email or password" });
            return;
        }

        // Generate token
        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });

        res.json({
            success: true,
            data: { token, user: { id: user.id, email: user.email } },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: "Internal server error" });
    }
};
