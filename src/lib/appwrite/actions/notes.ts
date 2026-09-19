"use server";

import { ID, Query } from "node-appwrite";
import { InputFile } from "node-appwrite/file";
import { revalidatePath } from "next/cache";
import { createSessionClient } from "@/lib/appwrite/server";
import { appwriteConfig } from "@/lib/appwrite/config";
import type { Note } from "@/lib/appwrite/types";

export async function listNotes(chapterId: string): Promise<Note[]> {
  const { databases } = await createSessionClient();
  const res = await databases.listDocuments<Note>({
    databaseId: appwriteConfig.databaseId,
    collectionId: appwriteConfig.notesCollectionId,
    queries: [Query.equal("chapterId", chapterId), Query.orderDesc("uploadedAt"), Query.limit(200)],
  });
  return res.documents;
}

export async function uploadNote(
  bookId: string,
  chapterId: string,
  _prevState: { error?: string } | undefined,
  formData: FormData
) {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Choose a PDF file to upload." };
  }
  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
    return { error: "Only PDF files are supported." };
  }

  const { databases, storage } = await createSessionClient();
  const buffer = Buffer.from(await file.arrayBuffer());
  const fileId = ID.unique();

  await storage.createFile({
    bucketId: appwriteConfig.notesBucketId,
    fileId,
    file: InputFile.fromBuffer(buffer, file.name),
  });

  await databases.createDocument({
    databaseId: appwriteConfig.databaseId,
    collectionId: appwriteConfig.notesCollectionId,
    documentId: ID.unique(),
    data: {
      chapterId,
      fileName: file.name.replace(/\.pdf$/i, ""),
      fileId,
      uploadedAt: new Date().toISOString(),
    },
  });

  revalidatePath(`/books/${bookId}/chapters/${chapterId}`);
  return { error: undefined };
}

export async function renameNote(
  bookId: string,
  chapterId: string,
  noteId: string,
  _prevState: { error?: string } | undefined,
  formData: FormData
) {
  const fileName = String(formData.get("fileName") ?? "").trim();
  if (!fileName) return { error: "File name is required." };

  const { databases } = await createSessionClient();
  await databases.updateDocument({
    databaseId: appwriteConfig.databaseId,
    collectionId: appwriteConfig.notesCollectionId,
    documentId: noteId,
    data: { fileName },
  });

  revalidatePath(`/books/${bookId}/chapters/${chapterId}`);
  return { error: undefined };
}

export async function deleteNote(bookId: string, chapterId: string, noteId: string, fileId: string) {
  const { databases, storage } = await createSessionClient();
  await storage.deleteFile({ bucketId: appwriteConfig.notesBucketId, fileId });
  await databases.deleteDocument({
    databaseId: appwriteConfig.databaseId,
    collectionId: appwriteConfig.notesCollectionId,
    documentId: noteId,
  });

  revalidatePath(`/books/${bookId}/chapters/${chapterId}`);
}
