"use server";

import { cookies } from "next/headers";

const API_URL = process.env.API_URL || "http://localhost:8000";

export type Task = {
  id: string;
  userId: string;
  title: string;
  description: string;
  status: "pending" | "in-progress" | "completed";
  priority: "low" | "medium" | "high";
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
};

type TasksResponse = {
  success: boolean;
  data: Task[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

async function getToken() {
  const cookieStore = await cookies();
  return cookieStore.get("token")?.value;
}

export async function getTasks(
  params?: { status?: string; page?: number; limit?: number; search?: string; sort?: string; order?: string }
): Promise<TasksResponse> {
  const token = await getToken();
  const { status, page = 1, limit = 20, search, sort, order } = params || {};
  const urlParams = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (status) urlParams.set("status", status);
  if (search) urlParams.set("search", search);
  if (sort) urlParams.set("sort", sort);
  if (order) urlParams.set("order", order);

  const res = await fetch(`${API_URL}/tasks?${urlParams}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!res.ok) {
    return { success: false, data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } };
  }

  return res.json();
}

export type CreateTaskState = {
  error?: string;
  success?: boolean;
};

export async function createTaskAction(
  _prevState: CreateTaskState,
  formData: FormData
): Promise<CreateTaskState> {
  const token = await getToken();

  const body = {
    title: formData.get("title") as string,
    description: formData.get("description") as string || "",
    status: formData.get("status") as string || "pending",
    priority: formData.get("priority") as string || "medium",
    dueDate: formData.get("dueDate") ? new Date(formData.get("dueDate") as string).toISOString() : undefined,
  };

  if (!body.title) {
    return { error: "Title is required" };
  }

  const res = await fetch(`${API_URL}/tasks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  console.log("[createTaskAction] status:", res.status, "body:", JSON.stringify(body), "response:", JSON.stringify(data));

  if (!res.ok) {
    const errorMsg = typeof data.error === "string" ? data.error : "Failed to create task";
    return { error: errorMsg };
  }

  return { success: true };
}

export type UpdateTaskState = {
  error?: string;
  success?: boolean;
};

export async function updateTaskAction(
  _prevState: UpdateTaskState,
  formData: FormData
): Promise<UpdateTaskState> {
  const token = await getToken();
  const id = formData.get("id") as string;

  const body: Record<string, unknown> = {};
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const status = formData.get("status") as string;
  const priority = formData.get("priority") as string;
  const dueDate = formData.get("dueDate") as string;

  if (title) body.title = title;
  if (description !== null) body.description = description;
  if (status) body.status = status;
  if (priority) body.priority = priority;
  if (dueDate) body.dueDate = new Date(dueDate).toISOString();

  const res = await fetch(`${API_URL}/tasks/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (!res.ok) {
    const errorMsg = typeof data.error === "string" ? data.error : "Failed to update task";
    return { error: errorMsg };
  }

  return { success: true };
}

export async function deleteTaskAction(id: string): Promise<{ error?: string; success?: boolean }> {
  const token = await getToken();

  const res = await fetch(`${API_URL}/tasks/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await res.json();

  if (!res.ok) {
    const errorMsg = typeof data.error === "string" ? data.error : "Failed to delete task";
    return { error: errorMsg };
  }

  return { success: true };
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("token");
  const { redirect } = await import("next/navigation");
  redirect("/login");
}
