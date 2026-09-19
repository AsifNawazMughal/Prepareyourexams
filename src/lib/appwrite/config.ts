export const appwriteConfig = {
  endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT ?? "",
  projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID ?? "",
  apiKey: process.env.APPWRITE_API_KEY ?? "",
  databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID ?? "main",
  booksCollectionId: "books",
  chaptersCollectionId: "chapters",
  notesCollectionId: "notes",
  mcqsCollectionId: "mcqs",
  repeatedQuestionsCollectionId: "repeated_questions",
  notesBucketId: "notes",
} as const;

export const SESSION_COOKIE = "ac_session";
