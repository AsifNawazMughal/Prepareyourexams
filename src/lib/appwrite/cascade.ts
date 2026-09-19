import "server-only";
import { Query } from "node-appwrite";
import { createSessionClient } from "@/lib/appwrite/server";
import { appwriteConfig } from "@/lib/appwrite/config";
import type { Note } from "@/lib/appwrite/types";

// Deletes everything that belongs to a chapter: its notes (metadata + the
// uploaded PDF file), its MCQs, and its repeated questions.
export async function deleteChapterContents(chapterId: string) {
  const { databases, storage } = await createSessionClient();

  const notes = await databases.listDocuments<Note>({
    databaseId: appwriteConfig.databaseId,
    collectionId: appwriteConfig.notesCollectionId,
    queries: [Query.equal("chapterId", chapterId), Query.limit(500)],
  });
  for (const note of notes.documents) {
    await storage.deleteFile({ bucketId: appwriteConfig.notesBucketId, fileId: note.fileId });
    await databases.deleteDocument({
      databaseId: appwriteConfig.databaseId,
      collectionId: appwriteConfig.notesCollectionId,
      documentId: note.$id,
    });
  }

  for (const collectionId of [appwriteConfig.mcqsCollectionId, appwriteConfig.repeatedQuestionsCollectionId]) {
    const docs = await databases.listDocuments({
      databaseId: appwriteConfig.databaseId,
      collectionId,
      queries: [Query.equal("chapterId", chapterId), Query.limit(500)],
    });
    for (const doc of docs.documents) {
      await databases.deleteDocument({ databaseId: appwriteConfig.databaseId, collectionId, documentId: doc.$id });
    }
  }
}

// Deletes a book's chapters (and everything under them), leaving the book
// document itself for the caller to delete.
export async function deleteBookContents(bookId: string) {
  const { databases } = await createSessionClient();

  const chapters = await databases.listDocuments({
    databaseId: appwriteConfig.databaseId,
    collectionId: appwriteConfig.chaptersCollectionId,
    queries: [Query.equal("bookId", bookId), Query.limit(500)],
  });

  for (const chapter of chapters.documents) {
    await deleteChapterContents(chapter.$id);
    await databases.deleteDocument({
      databaseId: appwriteConfig.databaseId,
      collectionId: appwriteConfig.chaptersCollectionId,
      documentId: chapter.$id,
    });
  }
}
