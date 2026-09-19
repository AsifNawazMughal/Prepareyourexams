import { Query } from "node-appwrite";
import { createSessionClient } from "@/lib/appwrite/server";
import { appwriteConfig } from "@/lib/appwrite/config";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

async function countDocuments(collectionId: string) {
  const { databases } = await createSessionClient();
  const res = await databases.listDocuments({
    databaseId: appwriteConfig.databaseId,
    collectionId,
    queries: [Query.limit(1)],
    total: true,
  });
  return res.total;
}

export default async function DashboardPage() {
  const [books, chapters, notes, mcqs, repeatedQuestions] = await Promise.all([
    countDocuments(appwriteConfig.booksCollectionId),
    countDocuments(appwriteConfig.chaptersCollectionId),
    countDocuments(appwriteConfig.notesCollectionId),
    countDocuments(appwriteConfig.mcqsCollectionId),
    countDocuments(appwriteConfig.repeatedQuestionsCollectionId),
  ]);

  const stats = [
    { label: "Books", value: books },
    { label: "Chapters", value: chapters },
    { label: "Notes", value: notes },
    { label: "MCQs", value: mcqs },
    { label: "Repeated Questions", value: repeatedQuestions },
  ];

  return (
    <main className="flex flex-1 flex-col gap-6 p-8">
      <h1 className="text-2xl font-semibold">Overview</h1>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader>
              <CardTitle className="text-sm font-normal text-muted-foreground">{stat.label}</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-semibold">{stat.value}</CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
