"use client";

import { useActionState, useState } from "react";
import { Plus, Pencil } from "lucide-react";
import { createChapter, renameChapter } from "@/lib/appwrite/actions/chapters";
import { useCloseOnSuccess } from "@/hooks/use-close-on-success";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

export function ChapterDialog({
  bookId,
  chapter,
}: {
  bookId: string;
  chapter?: { $id: string; title: string };
}) {
  const [open, setOpen] = useState(false);
  const action = chapter ? renameChapter.bind(null, bookId, chapter.$id) : createChapter.bind(null, bookId);
  const [state, formAction, isPending] = useActionState(action, undefined);
  useCloseOnSuccess(isPending, state?.error, () => setOpen(false));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          chapter ? (
            <Button variant="ghost" size="icon" aria-label="Rename chapter">
              <Pencil className="size-4" />
            </Button>
          ) : (
            <Button>
              <Plus className="size-4" /> Add Chapter
            </Button>
          )
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{chapter ? "Rename chapter" : "Add a chapter"}</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" defaultValue={chapter?.title} required autoFocus />
          </div>
          {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {chapter ? "Save" : "Add"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
