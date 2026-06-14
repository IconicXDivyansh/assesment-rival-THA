"use client";

import { deleteTaskAction } from "@/app/dashboard/actions";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogPopup,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Tooltip, TooltipPopup, TooltipTrigger } from "@/components/ui/tooltip";
import { Trash2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteTaskDialog({ taskId, taskTitle }: { taskId: string; taskTitle: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    const result = await deleteTaskAction(taskId);
    setLoading(false);

    if (result.success) {
      setOpen(false);
      router.refresh();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger render={<DialogTrigger render={<Button size="icon-xs" variant="ghost" />} />}>
          <Trash2Icon aria-hidden="true" />
        </TooltipTrigger>
        <TooltipPopup>Delete task</TooltipPopup>
      </Tooltip>
      <DialogPopup>
        <DialogHeader>
          <DialogTitle>Delete task</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete &ldquo;{taskTitle}&rdquo;? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="destructive"
            type="button"
            onClick={handleDelete}
            loading={loading}
          >
            Delete
          </Button>
          <DialogClose render={<Button variant="ghost" type="button" />}>
            Cancel
          </DialogClose>
        </DialogFooter>
      </DialogPopup>
    </Dialog>
  );
}
