"use server";

import { ID, Query } from "node-appwrite";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSessionClient } from "@/lib/appwrite/server";
import { appwriteConfig } from "@/lib/appwrite/config";
import { deleteChapterContents } from "@/lib/appwrite/cascade";
import type { Chapter } from "@/lib/appwrite/types";

export async function listChapters(bookId: string): Promise<Chapter[]> {
  const { databases } = await createSessionClient();
  const res = await databases.listDocuments<Chapter>({
    databaseId: appwriteConfig.databaseId,
    collectionId: appwriteConfig.chaptersCollectionId,
    queries: [Query.equal("bookId", bookId), Query.orderAsc("order"), Query.limit(500)],
  });
  return res.documents;
}

export async function getChapter(chapterId: string): Promise<Chapter> {
  const { databases } = await createSessionClient();
  return databases.getDocument<Chapter>({
    databaseId: appwriteConfig.databaseId,
    collectionId: appwriteConfig.chaptersCollectionId,
    documentId: chapterId,
  });
}

export async function createChapter(
  bookId: string,
  _prevState: { error?: string } | undefined,
  formData: FormData
) {
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return { error: "Chapter title is required." };

  const { databases } = await createSessionClient();
  const existing = await listChapters(bookId);

  await databases.createDocument({
    databaseId: appwriteConfig.databaseId,
    collectionId: appwriteConfig.chaptersCollectionId,
    documentId: ID.unique(),
    data: { bookId, title, order: existing.length },
  });

  revalidatePath(`/books/${bookId}`);
  return { error: undefined };
}

export async function renameChapter(
  bookId: string,
  chapterId: string,
  _prevState: { error?: string } | undefined,
  formData: FormData
) {
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return { error: "Chapter title is required." };

  const { databases } = await createSessionClient();
  await databases.updateDocument({
    databaseId: appwriteConfig.databaseId,
    collectionId: appwriteConfig.chaptersCollectionId,
    documentId: chapterId,
    data: { title },
  });

  revalidatePath(`/books/${bookId}`);
  revalidatePath(`/books/${bookId}/chapters/${chapterId}`);
  return { error: undefined };
}

export async function deleteChapter(bookId: string, chapterId: string) {
  await deleteChapterContents(chapterId);

  const { databases } = await createSessionClient();
  await databases.deleteDocument({
    databaseId: appwriteConfig.databaseId,
    collectionId: appwriteConfig.chaptersCollectionId,
    documentId: chapterId,
  });

  revalidatePath(`/books/${bookId}`);
  redirect(`/books/${bookId}`);
}
