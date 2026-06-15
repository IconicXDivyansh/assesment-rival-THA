"use client";

import CreateTaskForm from "@/components/create-task-form";
import DeleteTaskDialog from "@/components/delete-task-dialog";
import EditTaskForm from "@/components/edit-task-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Drawer,
    DrawerDescription,
    DrawerHeader,
    DrawerPopup,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer";
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import {
    Select,
    SelectItem,
    SelectPopup,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipPopup, TooltipTrigger } from "@/components/ui/tooltip";
import {
    CalendarIcon,
    CheckCircleIcon,
    ClipboardListIcon,
    EllipsisVerticalIcon,
    PencilIcon,
    PlusIcon,
    SearchIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useOptimistic, useState } from "react";
import type { Task } from "./actions";
import { updateTaskAction } from "./actions";

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

function TaskCard({
  task,
  onEdit,
  onOptimistic,
}: {
  task: Task;
  onEdit: (task: Task) => void;
  onOptimistic: (action: { type: "complete" | "delete"; id: string }) => void;
}) {
  const router = useRouter();

  const statusVariant = {
    pending: "warning" as const,
    "in-progress": "info" as const,
    completed: "success" as const,
  };

  const priorityVariant = {
    low: "outline" as const,
    medium: "warning" as const,
    high: "error" as const,
  };

  const handleMarkComplete = async () => {
    onOptimistic({ type: "complete", id: task.id });
    const formData = new FormData();
    formData.set("id", task.id);
    formData.set("status", "completed");
    await updateTaskAction({}, formData);
    router.refresh();
  };

  return (
    <div className="flex w-full flex-col gap-3 rounded-lg border p-4">
      <div className="flex items-center gap-2">
        <h3 className="min-w-0 truncate font-medium">{task.title}</h3>
        <Badge variant={statusVariant[task.status]} size="sm">
          {task.status.replace("-", " ")}
        </Badge>
        <Badge variant={priorityVariant[task.priority]} size="sm">
          {task.priority}
        </Badge>
        <div className="group/actions ml-auto flex shrink-0 items-center gap-1">
          <div className="hidden items-center gap-1 group-hover/actions:flex">
            {task.status !== "completed" && (
              <Tooltip>
                <TooltipTrigger render={<Button size="icon-xs" variant="ghost" onClick={handleMarkComplete} />}>
                  <CheckCircleIcon aria-hidden="true" />
                </TooltipTrigger>
                <TooltipPopup>Mark as completed</TooltipPopup>
              </Tooltip>
            )}
            <Tooltip>
              <TooltipTrigger render={<Button size="icon-xs" variant="ghost" onClick={() => onEdit(task)} />}>
                <PencilIcon aria-hidden="true" />
              </TooltipTrigger>
              <TooltipPopup>Edit task</TooltipPopup>
            </Tooltip>
            <DeleteTaskDialog taskId={task.id} taskTitle={task.title} />
          </div>
          <Button size="icon-xs" variant="ghost" className="group-hover/actions:hidden">
            <EllipsisVerticalIcon aria-hidden="true" />
          </Button>
        </div>
      </div>
      {task.description && (
        <p className="text-sm text-muted-foreground line-clamp-2">
          {task.description}
        </p>
      )}
      {task.dueDate && (
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <CalendarIcon className="size-3" aria-hidden="true" />
          {new Date(task.dueDate).toLocaleDateString()}
        </span>
      )}
    </div>
  );
}

export default function DashboardClient({
  initialTasks,
}: {
  initialTasks: TasksResponse;
}) {
  const [createDrawerOpen, setCreateDrawerOpen] = useState(false);
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Optimistic UI
  const [optimisticTasks, updateOptimistic] = useOptimistic(
    initialTasks.data,
    (currentTasks: Task[], action: { type: "complete" | "delete"; id: string }) => {
      if (action.type === "complete") {
        return currentTasks.map((t) =>
          t.id === action.id ? { ...t, status: "completed" as const } : t
        );
      }
      if (action.type === "delete") {
        return currentTasks.filter((t) => t.id !== action.id);
      }
      return currentTasks;
    }
  );

  // Client-side filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setEditDrawerOpen(true);
  };

  // Client-side filtering, sorting, and searching
  const filteredTasks = useMemo(() => {
    let tasks = [...optimisticTasks];

    // Search
    if (search) {
      tasks = tasks.filter((t) =>
        t.title.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      tasks = tasks.filter((t) => t.status === statusFilter);
    }

    // Sort
    tasks.sort((a, b) => {
      let comparison = 0;
      if (sortBy === "dueDate") {
        const aDate = a.dueDate ? new Date(a.dueDate).getTime() : 0;
        const bDate = b.dueDate ? new Date(b.dueDate).getTime() : 0;
        comparison = aDate - bDate;
      } else if (sortBy === "priority") {
        const order = { high: 3, medium: 2, low: 1 };
        comparison = order[a.priority] - order[b.priority];
      } else {
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return tasks;
  }, [optimisticTasks, search, statusFilter, sortBy, sortOrder]);

  const totalPages = Math.ceil(filteredTasks.length / perPage);
  const paginatedTasks = filteredTasks.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  );

  // Reset page when filters change
  const handleFilterChange = (setter: (v: string) => void, value: string) => {
    setter(value);
    setCurrentPage(1);
  };

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-[clamp(1.5rem,4vw,2rem)] font-bold">
          My Tasks
        </h1>
        <Drawer open={createDrawerOpen} onOpenChange={setCreateDrawerOpen}>
          <DrawerTrigger render={<Button />}>
            <PlusIcon aria-hidden="true" />
            New Task
          </DrawerTrigger>
          <DrawerPopup showBar className="sm:mx-auto sm:max-w-lg">
            <DrawerHeader>
              <DrawerTitle>Create a new task</DrawerTitle>
              <DrawerDescription>
                Fill in the details below to add a task.
              </DrawerDescription>
            </DrawerHeader>
            <CreateTaskForm onSuccess={() => setCreateDrawerOpen(false)} />
          </DrawerPopup>
        </Drawer>
      </div>

      {/* Toolbar: Search + Filter + Sort */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1">
          <InputGroup>
            <InputGroupAddon>
              <SearchIcon aria-hidden="true" />
            </InputGroupAddon>
            <InputGroupInput
              aria-label="Search tasks"
              placeholder="Search tasks..."
              type="search"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            />
          </InputGroup>
        </div>
        <div className="flex gap-2">
          <Select
            items={[
              { label: "All Status", value: "all" },
              { label: "Pending", value: "pending" },
              { label: "In Progress", value: "in-progress" },
              { label: "Completed", value: "completed" },
            ]}
            value={statusFilter}
            onValueChange={(val) => handleFilterChange(setStatusFilter, val as string)}
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectPopup>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectPopup>
          </Select>
          <Select
            items={[
              { label: "Newest first", value: "createdAt-desc" },
              { label: "Oldest first", value: "createdAt-asc" },
              { label: "Due date (earliest)", value: "dueDate-asc" },
              { label: "Due date (latest)", value: "dueDate-desc" },
              { label: "Priority (high first)", value: "priority-desc" },
              { label: "Priority (low first)", value: "priority-asc" },
            ]}
            value={`${sortBy}-${sortOrder}`}
            onValueChange={(val) => {
              const [field, order] = (val as string).split("-");
              setSortBy(field);
              setSortOrder(order as "asc" | "desc");
            }}
          >
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectPopup>
              <SelectItem value="createdAt-desc">Newest first</SelectItem>
              <SelectItem value="createdAt-asc">Oldest first</SelectItem>
              <SelectItem value="dueDate-asc">Due date (earliest)</SelectItem>
              <SelectItem value="dueDate-desc">Due date (latest)</SelectItem>
              <SelectItem value="priority-desc">Priority (high first)</SelectItem>
              <SelectItem value="priority-asc">Priority (low first)</SelectItem>
            </SelectPopup>
          </Select>
        </div>
      </div>

      {/* Task list */}
      {filteredTasks.length === 0 ? (
        optimisticTasks.length === 0 ? (
          <Empty>
            <EmptyMedia variant="icon">
              <ClipboardListIcon aria-hidden="true" />
            </EmptyMedia>
            <EmptyHeader>
              <EmptyTitle>No tasks yet</EmptyTitle>
              <EmptyDescription>
                Create your first task to get started organizing your work.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>No matching tasks</EmptyTitle>
              <EmptyDescription>
                Try changing your search or filter criteria.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )
      ) : (
        <div className="flex flex-col gap-3">
          {paginatedTasks.map((task) => (
            <TaskCard key={task.id} task={task} onEdit={handleEdit} onOptimistic={updateOptimistic} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                render={<button type="button" disabled={currentPage === 1} />}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  render={<button type="button" />}
                  isActive={page === currentPage}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                render={<button type="button" disabled={currentPage === totalPages} />}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {/* Edit drawer */}
      <Drawer open={editDrawerOpen} onOpenChange={setEditDrawerOpen}>
        <DrawerPopup showBar className="sm:mx-auto sm:max-w-lg">
          <DrawerHeader>
            <DrawerTitle>Edit task</DrawerTitle>
            <DrawerDescription>
              Update the details below.
            </DrawerDescription>
          </DrawerHeader>
          {editingTask && (
            <EditTaskForm
              key={editingTask.id}
              task={editingTask}
              onSuccess={() => setEditDrawerOpen(false)}
            />
          )}
        </DrawerPopup>
      </Drawer>
    </main>
  );
}
