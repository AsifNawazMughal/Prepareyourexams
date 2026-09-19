"use server";

import { ID, Query } from "node-appwrite";
import { revalidatePath } from "next/cache";
import { createSessionClient } from "@/lib/appwrite/server";
import { appwriteConfig } from "@/lib/appwrite/config";
import type { Mcq } from "@/lib/appwrite/types";

export async function listMcqs(chapterId: string): Promise<Mcq[]> {
  const { databases } = await createSessionClient();
  const res = await databases.listDocuments<Mcq>({
    databaseId: appwriteConfig.databaseId,
    collectionId: appwriteConfig.mcqsCollectionId,
    queries: [Query.equal("chapterId", chapterId), Query.limit(500)],
  });
  return res.documents;
}

type McqFields = { question: string; options: string[]; correctAnswerIndex: number };

function readMcqForm(formData: FormData): { error?: string; data?: McqFields } {
  const question = String(formData.get("question") ?? "").trim();
  const options = [0, 1, 2, 3].map((i) => String(formData.get(`option${i}`) ?? "").trim());
  const correctAnswerIndex = Number(formData.get("correctAnswerIndex"));

  if (!question) return { error: "Question is required." };
  if (options.some((o) => !o)) return { error: "All 4 options are required." };
  if (![0, 1, 2, 3].includes(correctAnswerIndex)) return { error: "Choose the correct answer." };

  return { data: { question, options, correctAnswerIndex } };
}

export async function createMcq(
  bookId: string,
  chapterId: string,
  _prevState: { error?: string } | undefined,
  formData: FormData
) {
  const { error, data } = readMcqForm(formData);
  if (error) return { error };

  const { databases } = await createSessionClient();
  await databases.createDocument({
    databaseId: appwriteConfig.databaseId,
    collectionId: appwriteConfig.mcqsCollectionId,
    documentId: ID.unique(),
    data: { chapterId, ...data },
  });

  revalidatePath(`/books/${bookId}/chapters/${chapterId}`);
  return { error: undefined };
}

export async function updateMcq(
  bookId: string,
  chapterId: string,
  mcqId: string,
  _prevState: { error?: string } | undefined,
  formData: FormData
) {
  const { error, data } = readMcqForm(formData);
  if (error) return { error };

  const { databases } = await createSessionClient();
  await databases.updateDocument({
    databaseId: appwriteConfig.databaseId,
    collectionId: appwriteConfig.mcqsCollectionId,
    documentId: mcqId,
    data,
  });

  revalidatePath(`/books/${bookId}/chapters/${chapterId}`);
  return { error: undefined };
}

export async function deleteMcq(bookId: string, chapterId: string, mcqId: string) {
  const { databases } = await createSessionClient();
  await databases.deleteDocument({
    databaseId: appwriteConfig.databaseId,
    collectionId: appwriteConfig.mcqsCollectionId,
    documentId: mcqId,
  });

  revalidatePath(`/books/${bookId}/chapters/${chapterId}`);
}
