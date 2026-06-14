"use client";

import { createTaskAction, type CreateTaskState } from "@/app/dashboard/actions";
import { Button } from "@/components/ui/button";
import { DrawerClose, DrawerFooter, DrawerPanel } from "@/components/ui/drawer";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectItem,
    SelectPopup,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { taskSchema } from "@/lib/schemas";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef, useState } from "react";

const statusItems = [
  { label: "Pending", value: "pending" },
  { label: "In Progress", value: "in-progress" },
  { label: "Completed", value: "completed" },
];

const priorityItems = [
  { label: "Low", value: "low" },
  { label: "Medium", value: "medium" },
  { label: "High", value: "high" },
];

export default function CreateTaskForm({ onSuccess }: { onSuccess?: () => void }) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState<CreateTaskState, FormData>(
    createTaskAction,
    {}
  );
  const formRef = useRef<HTMLFormElement>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
      setErrors({});
      router.refresh();
      onSuccess?.();
    }
  }, [state.success, onSuccess, router]);

  const handleSubmit = (formData: FormData) => {
    const data = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      status: formData.get("status") as string,
      priority: formData.get("priority") as string,
      dueDate: formData.get("dueDate") as string,
    };

    const result = taskSchema.safeParse(data);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as string;
        fieldErrors[field] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    formAction(formData);
  };

  return (
    <>
      <DrawerPanel>
        <form
          id="create-task-form"
          ref={formRef}
          action={handleSubmit}
          className="flex flex-col gap-4"
        >
          <Field>
            <FieldLabel>Title</FieldLabel>
            <Input name="title" placeholder="Task title" type="text" />
            {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
          </Field>

          <Field>
            <FieldLabel>Description</FieldLabel>
            <Textarea
              name="description"
              placeholder="Describe the task (optional)"
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel>Status</FieldLabel>
              <Select items={statusItems} defaultValue="pending" name="status">
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectPopup>
                  {statusItems.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectPopup>
              </Select>
            </Field>

            <Field>
              <FieldLabel>Priority</FieldLabel>
              <Select items={priorityItems} defaultValue="medium" name="priority">
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectPopup>
                  {priorityItems.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectPopup>
              </Select>
            </Field>
          </div>

          <Field>
            <FieldLabel>Due Date</FieldLabel>
            <Input name="dueDate" type="date" />
          </Field>

          {state.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}

          <Button type="submit" className="w-full" loading={isPending}>
            Create Task
          </Button>
        </form>
      </DrawerPanel>
      <DrawerFooter variant="bare">
        <DrawerClose render={<Button variant="ghost" type="button" className="w-full" />}>
          Cancel
        </DrawerClose>
      </DrawerFooter>
    </>
  );
}
