import { listMcqs, deleteMcq } from "@/lib/appwrite/actions/mcqs";
import { ConfirmDeleteButton } from "@/components/confirm-delete-button";
import { McqDialog } from "./mcq-dialog";

export async function McqSection({ bookId, chapterId }: { bookId: string; chapterId: string }) {
  const mcqs = await listMcqs(chapterId);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <McqDialog bookId={bookId} chapterId={chapterId} />
      </div>
      {mcqs.length === 0 ? (
        <p className="text-muted-foreground">No MCQs yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {mcqs.map((mcq, index) => (
            <div key={mcq.$id} className="rounded-lg border p-3">
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium">
                  {index + 1}. {mcq.question}
                </p>
                <div className="flex shrink-0 items-center gap-1">
                  <McqDialog
                    bookId={bookId}
                    chapterId={chapterId}
                    mcq={{
                      $id: mcq.$id,
                      question: mcq.question,
                      options: [...mcq.options],
                      correctAnswerIndex: mcq.correctAnswerIndex,
                    }}
                  />
                  <ConfirmDeleteButton
                    action={deleteMcq.bind(null, bookId, chapterId, mcq.$id)}
                    title="Delete this MCQ?"
                    description="This cannot be undone."
                    label="Delete MCQ"
                  />
                </div>
              </div>
              <ul className="mt-2 flex flex-col gap-1 text-sm">
                {mcq.options.map((option, i) => (
                  <li
                    key={i}
                    className={
                      i === mcq.correctAnswerIndex
                        ? "font-medium text-green-600 dark:text-green-400"
                        : "text-muted-foreground"
                    }
                  >
                    {i === mcq.correctAnswerIndex ? "✓ " : "· "}
                    {option}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
