"use client";

import { useActionState, useState } from "react";
import { Pencil } from "lucide-react";
import { renameNote } from "@/lib/appwrite/actions/notes";
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

export function NoteRenameDialog({
  bookId,
  chapterId,
  note,
}: {
  bookId: string;
  chapterId: string;
  note: { $id: string; fileName: string };
}) {
  const [open, setOpen] = useState(false);
  const action = renameNote.bind(null, bookId, chapterId, note.$id);
  const [state, formAction, isPending] = useActionState(action, undefined);
  useCloseOnSuccess(isPending, state?.error, () => setOpen(false));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="ghost" size="icon" aria-label="Rename note" />}>
        <Pencil className="size-4" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename note</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="fileName">Name</Label>
            <Input id="fileName" name="fileName" defaultValue={note.fileName} required autoFocus />
          </div>
          {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
