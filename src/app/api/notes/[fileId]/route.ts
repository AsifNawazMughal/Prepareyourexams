import { NextResponse } from "next/server";
import { Query } from "node-appwrite";
import { createSessionClient } from "@/lib/appwrite/server";
import { appwriteConfig } from "@/lib/appwrite/config";
import type { Note } from "@/lib/appwrite/types";

export async function GET(_request: Request, { params }: { params: Promise<{ fileId: string }> }) {
  const { fileId } = await params;

  const { databases, storage } = await createSessionClient();

  const notes = await databases.listDocuments<Note>({
    databaseId: appwriteConfig.databaseId,
    collectionId: appwriteConfig.notesCollectionId,
    queries: [Query.equal("fileId", fileId), Query.limit(1)],
  });
  const note = notes.documents[0];
  if (!note) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const bytes = await storage.getFileDownload({ bucketId: appwriteConfig.notesBucketId, fileId });

  return new NextResponse(bytes, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${note.fileName}.pdf"`,
    },
  });
}
