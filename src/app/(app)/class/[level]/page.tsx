import Link from "next/link";
import { notFound } from "next/navigation";
import { listBooks, deleteBook } from "@/lib/appwrite/actions/books";
import { BookDialog } from "../../books/book-dialog";
import { ConfirmDeleteButton } from "@/components/confirm-delete-button";
import { Card, CardHeader, CardTitle, CardDescription, CardAction } from "@/components/ui/card";
import type { ClassLevel } from "@/lib/appwrite/types";

function parseLevel(level: string): ClassLevel {
  if (level === "9" || level === "10") return level;
  notFound();
}

export default async function ClassPage({ params }: { params: Promise<{ level: string }> }) {
  const { level } = await params;
  const classLevel = parseLevel(level);
  const books = await listBooks(classLevel);

  return (
    <main className="flex flex-1 flex-col gap-6 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Class {classLevel} — Books</h1>
        <BookDialog classLevel={classLevel} />
      </div>

      {books.length === 0 ? (
        <p className="text-muted-foreground">No books yet for Class {classLevel}. Add your first one.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {books.map((book) => (
            <Card key={book.$id}>
              <CardHeader>
                <CardTitle>
                  <Link href={`/books/${book.$id}`} className="hover:underline">
                    {book.title}
                  </Link>
                </CardTitle>
                {book.description && <CardDescription>{book.description}</CardDescription>}
                <CardAction className="flex gap-1">
                  <BookDialog book={{ $id: book.$id, title: book.title, description: book.description }} />
                  <ConfirmDeleteButton
                    action={deleteBook.bind(null, book.$id, classLevel)}
                    title={`Delete "${book.title}"?`}
                    description="This also deletes all of its chapters, notes, MCQs, and repeated questions. This cannot be undone."
                    label="Delete book"
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
