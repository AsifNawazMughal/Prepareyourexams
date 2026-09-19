"use client";

import { useActionState, useState } from "react";
import { Plus, Pencil } from "lucide-react";
import { createMcq, updateMcq } from "@/lib/appwrite/actions/mcqs";
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

type McqData = {
  $id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
};

export function McqDialog({
  bookId,
  chapterId,
  mcq,
}: {
  bookId: string;
  chapterId: string;
  mcq?: McqData;
}) {
  const [open, setOpen] = useState(false);
  const action = mcq
    ? updateMcq.bind(null, bookId, chapterId, mcq.$id)
    : createMcq.bind(null, bookId, chapterId);
  const [state, formAction, isPending] = useActionState(action, undefined);
  useCloseOnSuccess(isPending, state?.error, () => setOpen(false));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          mcq ? (
            <Button variant="ghost" size="icon" aria-label="Edit MCQ">
              <Pencil className="size-4" />
            </Button>
          ) : (
            <Button>
              <Plus className="size-4" /> Add MCQ
            </Button>
          )
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mcq ? "Edit MCQ" : "Add an MCQ"}</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="question">Question</Label>
            <Input id="question" name="question" defaultValue={mcq?.question} required autoFocus />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Options (select the correct one)</Label>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="correctAnswerIndex"
                  value={i}
                  defaultChecked={mcq ? mcq.correctAnswerIndex === i : i === 0}
                  aria-label={`Option ${i + 1} is correct`}
                  className="size-4"
                />
                <Input name={`option${i}`} defaultValue={mcq?.options[i]} required placeholder={`Option ${i + 1}`} />
              </div>
            ))}
          </div>
          {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {mcq ? "Save" : "Add"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
