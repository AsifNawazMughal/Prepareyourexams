"use client";

import { useActionState, useRef, useState } from "react";
import { Upload } from "lucide-react";
import { uploadNote } from "@/lib/appwrite/actions/notes";
import { useCloseOnSuccess } from "@/hooks/use-close-on-success";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

export function NoteUploadDialog({ bookId, chapterId }: { bookId: string; chapterId: string }) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const action = uploadNote.bind(null, bookId, chapterId);
  const [state, formAction, isPending] = useActionState(action, undefined);
  useCloseOnSuccess(isPending, state?.error, () => {
    setOpen(false);
    formRef.current?.reset();
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button>
            <Upload className="size-4" /> Upload PDF
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload chapter notes</DialogTitle>
        </DialogHeader>
        <form ref={formRef} action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="file">PDF file</Label>
            <input
              id="file"
              name="file"
              type="file"
              accept="application/pdf"
              required
              className="rounded-lg border border-input bg-background px-2.5 py-1.5 text-sm file:mr-2 file:rounded-md file:border-0 file:bg-muted file:px-2 file:py-1"
            />
          </div>
          {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Uploading..." : "Upload"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
