"use client";

import { useActionState, useState } from "react";
import { Plus, Pencil } from "lucide-react";
import { createRepeatedQuestion, updateRepeatedQuestion } from "@/lib/appwrite/actions/repeated-questions";
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

type RQData = { $id: string; question: string; year?: string | null; notes?: string | null };

export function RepeatedQuestionDialog({
  bookId,
  chapterId,
  question,
}: {
  bookId: string;
  chapterId: string;
  question?: RQData;
}) {
  const [open, setOpen] = useState(false);
  const action = question
    ? updateRepeatedQuestion.bind(null, bookId, chapterId, question.$id)
    : createRepeatedQuestion.bind(null, bookId, chapterId);
  const [state, formAction, isPending] = useActionState(action, undefined);
  useCloseOnSuccess(isPending, state?.error, () => setOpen(false));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          question ? (
            <Button variant="ghost" size="icon" aria-label="Edit repeated question">
              <Pencil className="size-4" />
            </Button>
          ) : (
            <Button>
              <Plus className="size-4" /> Add Repeated Question
            </Button>
          )
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{question ? "Edit repeated question" : "Add a repeated question"}</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="question">Question</Label>
            <Input id="question" name="question" defaultValue={question?.question} required autoFocus />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="year">Year (optional)</Label>
            <Input id="year" name="year" defaultValue={question?.year ?? ""} placeholder="e.g. 2023" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Input id="notes" name="notes" defaultValue={question?.notes ?? ""} />
          </div>
          {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {question ? "Save" : "Add"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
