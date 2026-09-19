import Link from "next/link";
import { notFound } from "next/navigation";
import { AppwriteException } from "node-appwrite";
import { ArrowLeft } from "lucide-react";
import { getChapter } from "@/lib/appwrite/actions/chapters";
import { getBook } from "@/lib/appwrite/actions/books";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ChapterDialog } from "../../chapter-dialog";
import { NotesSection } from "./notes-section";
import { McqSection } from "./mcq-section";
import { RepeatedQuestionsSection } from "./repeated-questions-section";

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ bookId: string; chapterId: string }>;
}) {
  const { bookId, chapterId } = await params;

  const notFoundIfMissing = (error: unknown) => {
    if (error instanceof AppwriteException && error.code === 404) notFound();
    throw error;
  };

  const [book, chapter] = await Promise.all([
    getBook(bookId).catch(notFoundIfMissing),
    getChapter(chapterId).catch(notFoundIfMissing),
  ]);

  return (
    <main className="flex flex-1 flex-col gap-6 p-8">
      <div>
        <Button variant="ghost" size="sm" render={<Link href={`/books/${bookId}`} />}>
          <ArrowLeft className="size-4" /> Back to {book.title}
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{chapter.title}</h1>
        <ChapterDialog bookId={bookId} chapter={{ $id: chapter.$id, title: chapter.title }} />
      </div>

      <Tabs defaultValue="notes">
        <TabsList>
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="mcqs">MCQs</TabsTrigger>
          <TabsTrigger value="repeated">Repeated Questions</TabsTrigger>
        </TabsList>
        <TabsContent value="notes">
          <NotesSection bookId={bookId} chapterId={chapterId} />
        </TabsContent>
        <TabsContent value="mcqs">
          <McqSection bookId={bookId} chapterId={chapterId} />
        </TabsContent>
        <TabsContent value="repeated">
          <RepeatedQuestionsSection bookId={bookId} chapterId={chapterId} />
        </TabsContent>
      </Tabs>
    </main>
  );
}
