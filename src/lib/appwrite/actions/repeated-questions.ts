"use server";

import { ID, Query } from "node-appwrite";
import { revalidatePath } from "next/cache";
import { createSessionClient } from "@/lib/appwrite/server";
import { appwriteConfig } from "@/lib/appwrite/config";
import type { RepeatedQuestion } from "@/lib/appwrite/types";

export async function listRepeatedQuestions(chapterId: string): Promise<RepeatedQuestion[]> {
  const { databases } = await createSessionClient();
  const res = await databases.listDocuments<RepeatedQuestion>({
    databaseId: appwriteConfig.databaseId,
    collectionId: appwriteConfig.repeatedQuestionsCollectionId,
    queries: [Query.equal("chapterId", chapterId), Query.limit(500)],
  });
  return res.documents;
}

export async function createRepeatedQuestion(
  bookId: string,
  chapterId: string,
  _prevState: { error?: string } | undefined,
  formData: FormData
) {
  const question = String(formData.get("question") ?? "").trim();
  const year = String(formData.get("year") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();
  if (!question) return { error: "Question is required." };

  const { databases } = await createSessionClient();
  await databases.createDocument({
    databaseId: appwriteConfig.databaseId,
    collectionId: appwriteConfig.repeatedQuestionsCollectionId,
    documentId: ID.unique(),
    data: { chapterId, question, year: year || null, notes: notes || null },
  });

  revalidatePath(`/books/${bookId}/chapters/${chapterId}`);
  return { error: undefined };
}

export async function updateRepeatedQuestion(
  bookId: string,
  chapterId: string,
  id: string,
  _prevState: { error?: string } | undefined,
  formData: FormData
) {
  const question = String(formData.get("question") ?? "").trim();
  const year = String(formData.get("year") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();
  if (!question) return { error: "Question is required." };

  const { databases } = await createSessionClient();
  await databases.updateDocument({
    databaseId: appwriteConfig.databaseId,
    collectionId: appwriteConfig.repeatedQuestionsCollectionId,
    documentId: id,
    data: { question, year: year || null, notes: notes || null },
  });

  revalidatePath(`/books/${bookId}/chapters/${chapterId}`);
  return { error: undefined };
}

export async function deleteRepeatedQuestion(bookId: string, chapterId: string, id: string) {
  const { databases } = await createSessionClient();
  await databases.deleteDocument({
    databaseId: appwriteConfig.databaseId,
    collectionId: appwriteConfig.repeatedQuestionsCollectionId,
    documentId: id,
  });

  revalidatePath(`/books/${bookId}/chapters/${chapterId}`);
}
