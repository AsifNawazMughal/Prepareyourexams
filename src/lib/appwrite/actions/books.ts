"use server";

import { ID, Query } from "node-appwrite";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSessionClient } from "@/lib/appwrite/server";
import { appwriteConfig } from "@/lib/appwrite/config";
import { deleteBookContents } from "@/lib/appwrite/cascade";
import type { Book } from "@/lib/appwrite/types";

export async function listBooks(): Promise<Book[]> {
  const { databases } = await createSessionClient();
  const res = await databases.listDocuments<Book>({
    databaseId: appwriteConfig.databaseId,
    collectionId: appwriteConfig.booksCollectionId,
    queries: [Query.orderAsc("title"), Query.limit(200)],
  });
  return res.documents;
}

export async function getBook(bookId: string): Promise<Book> {
  const { databases } = await createSessionClient();
  return databases.getDocument<Book>({
    databaseId: appwriteConfig.databaseId,
    collectionId: appwriteConfig.booksCollectionId,
    documentId: bookId,
  });
}

export async function createBook(_prevState: { error?: string } | undefined, formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  if (!title) return { error: "Book title is required." };

  const { databases } = await createSessionClient();
  await databases.createDocument({
    databaseId: appwriteConfig.databaseId,
    collectionId: appwriteConfig.booksCollectionId,
    documentId: ID.unique(),
    data: { title, description: description || null },
  });

  revalidatePath("/books");
  return { error: undefined };
}

export async function renameBook(
  bookId: string,
  _prevState: { error?: string } | undefined,
  formData: FormData
) {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  if (!title) return { error: "Book title is required." };

  const { databases } = await createSessionClient();
  await databases.updateDocument({
    databaseId: appwriteConfig.databaseId,
    collectionId: appwriteConfig.booksCollectionId,
    documentId: bookId,
    data: { title, description: description || null },
  });

  revalidatePath("/books");
  revalidatePath(`/books/${bookId}`);
  return { error: undefined };
}

export async function deleteBook(bookId: string) {
  await deleteBookContents(bookId);

  const { databases } = await createSessionClient();
  await databases.deleteDocument({
    databaseId: appwriteConfig.databaseId,
    collectionId: appwriteConfig.booksCollectionId,
    documentId: bookId,
  });

  revalidatePath("/books");
  redirect("/books");
}
