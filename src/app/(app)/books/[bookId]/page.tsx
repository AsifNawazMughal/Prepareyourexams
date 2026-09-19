import Link from "next/link";
import { notFound } from "next/navigation";
import { AppwriteException } from "node-appwrite";
import { getBook, deleteBook } from "@/lib/appwrite/actions/books";
import { listChapters, deleteChapter } from "@/lib/appwrite/actions/chapters";
import { BookDialog } from "../book-dialog";
import { ChapterDialog } from "./chapter-dialog";
import { ConfirmDeleteButton } from "@/components/confirm-delete-button";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardAction } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

export default async function BookPage({ params }: { params: Promise<{ bookId: string }> }) {
  const { bookId } = await params;

  const book = await getBook(bookId).catch((error) => {
    if (error instanceof AppwriteException && error.code === 404) notFound();
    throw error;
  });
  const chapters = await listChapters(bookId);

  return (
    <main className="flex flex-1 flex-col gap-6 p-8">
      <div>
        <Button variant="ghost" size="sm" render={<Link href="/books" />}>
          <ArrowLeft className="size-4" /> Back to books
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{book.title}</h1>
          {book.description && <p className="text-muted-foreground">{book.description}</p>}
        </div>
        <div className="flex items-center gap-1">
          <BookDialog book={{ $id: book.$id, title: book.title, description: book.description }} />
          <ConfirmDeleteButton
            action={deleteBook.bind(null, bookId)}
            title={`Delete "${book.title}"?`}
            description="This also deletes all of its chapters, notes, MCQs, and repeated questions. This cannot be undone."
            label="Delete book"
          />
          <ChapterDialog bookId={bookId} />
        </div>
      </div>

      {chapters.length === 0 ? (
        <p className="text-muted-foreground">No chapters yet. Add the first one.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {chapters.map((chapter) => (
            <Card key={chapter.$id}>
              <CardHeader>
                <CardTitle>
                  <Link href={`/books/${bookId}/chapters/${chapter.$id}`} className="hover:underline">
                    {chapter.title}
                  </Link>
                </CardTitle>
                <CardAction className="flex gap-1">
                  <ChapterDialog bookId={bookId} chapter={{ $id: chapter.$id, title: chapter.title }} />
                  <ConfirmDeleteButton
                    action={deleteChapter.bind(null, bookId, chapter.$id)}
                    title={`Delete "${chapter.title}"?`}
                    description="This also deletes its notes, MCQs, and repeated questions. This cannot be undone."
                    label="Delete chapter"
                  />
                </CardAction>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
