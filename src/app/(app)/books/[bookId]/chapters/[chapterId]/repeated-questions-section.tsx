import { listRepeatedQuestions, deleteRepeatedQuestion } from "@/lib/appwrite/actions/repeated-questions";
import { ConfirmDeleteButton } from "@/components/confirm-delete-button";
import { Badge } from "@/components/ui/badge";
import { RepeatedQuestionDialog } from "./repeated-question-dialog";

export async function RepeatedQuestionsSection({ bookId, chapterId }: { bookId: string; chapterId: string }) {
  const questions = await listRepeatedQuestions(chapterId);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <RepeatedQuestionDialog bookId={bookId} chapterId={chapterId} />
      </div>
      {questions.length === 0 ? (
        <p className="text-muted-foreground">No repeated questions yet.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {questions.map((q, index) => (
            <div key={q.$id} className="flex items-start justify-between gap-2 rounded-lg border p-3">
              <div>
                <p>
                  {index + 1}. {q.question}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  {q.year && <Badge variant="secondary">{q.year}</Badge>}
                  {q.notes && <span className="text-sm text-muted-foreground">{q.notes}</span>}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <RepeatedQuestionDialog
                  bookId={bookId}
                  chapterId={chapterId}
                  question={{ $id: q.$id, question: q.question, year: q.year, notes: q.notes }}
                />
                <ConfirmDeleteButton
                  action={deleteRepeatedQuestion.bind(null, bookId, chapterId, q.$id)}
                  title="Delete this question?"
                  description="This cannot be undone."
                  label="Delete question"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
