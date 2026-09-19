"use client";

import { useActionState, useState } from "react";
import { Plus, Pencil } from "lucide-react";
import { createBook, renameBook } from "@/lib/appwrite/actions/books";
import { useCloseOnSuccess } from "@/hooks/use-close-on-success";
import type { ClassLevel } from "@/lib/appwrite/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

export function BookDialog({
  classLevel,
  book,
}: {
  classLevel?: ClassLevel;
  book?: { $id: string; title: string; description?: string | null; paperScheme?: string | null };
}) {
  const [open, setOpen] = useState(false);
  const action = book ? renameBook.bind(null, book.$id) : createBook.bind(null, classLevel!);
  const [state, formAction, isPending] = useActionState(action, undefined);
  useCloseOnSuccess(isPending, state?.error, () => setOpen(false));

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
      }}
    >
      <DialogTrigger
        render={
          book ? (
            <Button variant="ghost" size="icon" aria-label="Rename book">
              <Pencil className="size-4" />
            </Button>
          ) : (
            <Button>
              <Plus className="size-4" /> Add Book
            </Button>
          )
        }
      />
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{book ? "Rename book" : "Add a book"}</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" defaultValue={book?.title} required autoFocus />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Input id="description" name="description" defaultValue={book?.description ?? ""} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="paperScheme">Paper scheme (optional)</Label>
            <Textarea
              id="paperScheme"
              name="paperScheme"
              rows={8}
              placeholder="e.g. Q.1 MCQs — 10 marks&#10;Q.2 Short questions (Ch 1,2,4) — attempt 4 of 6 — 8 marks&#10;..."
              defaultValue={book?.paperScheme ?? ""}
              className="font-mono text-xs"
            />
          </div>
          {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {book ? "Save" : "Add"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
