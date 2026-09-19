// One-time setup script: creates the Appwrite database, collections,
// attributes, indexes, storage bucket, and the single admin account.
//
// Run with:  npm run setup:appwrite
// Requires NEXT_PUBLIC_APPWRITE_ENDPOINT, NEXT_PUBLIC_APPWRITE_PROJECT_ID,
// and APPWRITE_API_KEY to already be set in .env.local.

import readline from "node:readline/promises";
import { Client, Databases, Storage, Users, ID, Permission, Role } from "node-appwrite";

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const apiKey = process.env.APPWRITE_API_KEY;
const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "main";

if (!endpoint || !projectId || !apiKey) {
  console.error(
    "Missing NEXT_PUBLIC_APPWRITE_ENDPOINT, NEXT_PUBLIC_APPWRITE_PROJECT_ID, or APPWRITE_API_KEY in .env.local"
  );
  process.exit(1);
}

const client = new Client().setEndpoint(endpoint).setProject(projectId).setKey(apiKey);
const databases = new Databases(client);
const storage = new Storage(client);
const users = new Users(client);

const fullAccess = [
  Permission.read(Role.users()),
  Permission.create(Role.users()),
  Permission.update(Role.users()),
  Permission.delete(Role.users()),
];

async function ignoreExists(promise, label) {
  try {
    await promise;
    console.log(`  created: ${label}`);
  } catch (error) {
    if (error?.code === 409) {
      console.log(`  already exists, skipping: ${label}`);
    } else {
      throw error;
    }
  }
}

async function waitForAttribute(collectionId, key) {
  for (let i = 0; i < 20; i++) {
    const attr = await databases.getAttribute({ databaseId, collectionId, key });
    if (attr.status === "available") return;
    if (attr.status === "failed" || attr.status === "stuck") {
      throw new Error(`Attribute ${collectionId}.${key} failed to become available`);
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`Timed out waiting for attribute ${collectionId}.${key}`);
}

async function createCollection(collectionId, name) {
  console.log(`Collection: ${name}`);
  await ignoreExists(
    databases.createCollection({
      databaseId,
      collectionId,
      name,
      permissions: fullAccess,
      documentSecurity: false,
    }),
    name
  );
}

async function createStringAttr(collectionId, key, size, required, opts = {}) {
  await ignoreExists(
    databases.createStringAttribute({ databaseId, collectionId, key, size, required, ...opts }),
    `${collectionId}.${key}`
  );
  await waitForAttribute(collectionId, key);
}

async function createIntegerAttr(collectionId, key, required, opts = {}) {
  await ignoreExists(
    databases.createIntegerAttribute({ databaseId, collectionId, key, required, ...opts }),
    `${collectionId}.${key}`
  );
  await waitForAttribute(collectionId, key);
}

async function createDatetimeAttr(collectionId, key, required, opts = {}) {
  await ignoreExists(
    databases.createDatetimeAttribute({ databaseId, collectionId, key, required, ...opts }),
    `${collectionId}.${key}`
  );
  await waitForAttribute(collectionId, key);
}

async function createIndex(collectionId, key, type, attributes) {
  await ignoreExists(
    databases.createIndex({ databaseId, collectionId, key, type, attributes }),
    `${collectionId} index ${key}`
  );
}

async function main() {
  console.log(`\nUsing Appwrite endpoint ${endpoint}, project ${projectId}\n`);

  console.log(`Database: ${databaseId}`);
  await ignoreExists(databases.create({ databaseId, name: "main" }), databaseId);

  // books
  await createCollection("books", "Books");
  await createStringAttr("books", "title", 200, true);
  await createStringAttr("books", "description", 2000, false);

  // chapters
  await createCollection("chapters", "Chapters");
  await createStringAttr("chapters", "bookId", 36, true);
  await createStringAttr("chapters", "title", 200, true);
  await createIntegerAttr("chapters", "order", false, { min: 0 });
  await createIndex("chapters", "by_book", "key", ["bookId"]);

  // notes (metadata; actual PDF files live in Storage)
  await createCollection("notes", "Notes");
  await createStringAttr("notes", "chapterId", 36, true);
  await createStringAttr("notes", "fileName", 200, true);
  await createStringAttr("notes", "fileId", 36, true);
  await createDatetimeAttr("notes", "uploadedAt", true);
  await createIndex("notes", "by_chapter", "key", ["chapterId"]);

  // mcqs
  await createCollection("mcqs", "MCQs");
  await createStringAttr("mcqs", "chapterId", 36, true);
  await createStringAttr("mcqs", "question", 2000, true);
  await createStringAttr("mcqs", "options", 500, true, { array: true });
  await createIntegerAttr("mcqs", "correctAnswerIndex", true, { min: 0, max: 3 });
  await createIndex("mcqs", "by_chapter", "key", ["chapterId"]);

  // repeated_questions
  await createCollection("repeated_questions", "Repeated Questions");
  await createStringAttr("repeated_questions", "chapterId", 36, true);
  await createStringAttr("repeated_questions", "question", 2000, true);
  await createStringAttr("repeated_questions", "year", 20, false);
  await createStringAttr("repeated_questions", "notes", 1000, false);
  await createIndex("repeated_questions", "by_chapter", "key", ["chapterId"]);

  // storage bucket for PDF notes
  console.log("Storage bucket: notes");
  await ignoreExists(
    storage.createBucket({
      bucketId: "notes",
      name: "Notes",
      permissions: fullAccess,
      fileSecurity: false,
      allowedFileExtensions: ["pdf"],
      maximumFileSize: 25 * 1024 * 1024,
    }),
    "notes bucket"
  );

  // one admin account
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  console.log("\nCreate your admin login:");
  const email = await rl.question("Admin email: ");
  const password = await rl.question("Admin password (min 8 chars): ");
  rl.close();

  await ignoreExists(
    users.create({ userId: ID.unique(), email, password, name: "Admin" }),
    `admin user ${email}`
  );

  console.log("\nDone. You can now log in at /login with the admin email and password above.\n");
}

main().catch((error) => {
  console.error("\nSetup failed:", error.message || error);
  process.exit(1);
});
