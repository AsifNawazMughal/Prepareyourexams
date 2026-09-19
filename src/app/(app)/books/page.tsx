import Link from "next/link";
import { listBooks, deleteBook } from "@/lib/appwrite/actions/books";
import { BookDialog } from "./book-dialog";
import { ConfirmDeleteButton } from "@/components/confirm-delete-button";
import { Card, CardHeader, CardTitle, CardDescription, CardAction } from "@/components/ui/card";

export default async function BooksPage() {
  const books = await listBooks();

  return (
    <main className="flex flex-1 flex-col gap-6 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Books</h1>
        <BookDialog />
      </div>

      {books.length === 0 ? (
        <p className="text-muted-foreground">No books yet. Add your first one.</p>
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
                    action={deleteBook.bind(null, book.$id)}
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
