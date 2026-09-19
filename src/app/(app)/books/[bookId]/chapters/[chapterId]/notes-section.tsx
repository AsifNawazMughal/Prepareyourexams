import { FileText } from "lucide-react";
import { listNotes, deleteNote } from "@/lib/appwrite/actions/notes";
import { ConfirmDeleteButton } from "@/components/confirm-delete-button";
import { Button } from "@/components/ui/button";
import { NoteUploadDialog } from "./note-upload-dialog";
import { NoteRenameDialog } from "./note-rename-dialog";

export async function NotesSection({ bookId, chapterId }: { bookId: string; chapterId: string }) {
  const notes = await listNotes(chapterId);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <NoteUploadDialog bookId={bookId} chapterId={chapterId} />
      </div>
      {notes.length === 0 ? (
        <p className="text-muted-foreground">No notes uploaded yet.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {notes.map((note) => (
            <div key={note.$id} className="flex items-center justify-between rounded-lg border p-3">
              <a
                href={`/api/notes/${note.fileId}`}
                className="flex items-center gap-2 hover:underline"
              >
                <FileText className="size-4" />
                {note.fileName}.pdf
              </a>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" render={<a href={`/api/notes/${note.fileId}`} />}>
                  Download
                </Button>
                <NoteRenameDialog
                  bookId={bookId}
                  chapterId={chapterId}
                  note={{ $id: note.$id, fileName: note.fileName }}
                />
                <ConfirmDeleteButton
                  action={deleteNote.bind(null, bookId, chapterId, note.$id, note.fileId)}
                  title={`Delete "${note.fileName}.pdf"?`}
                  description="This permanently deletes the uploaded file. This cannot be undone."
                  label="Delete note"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
