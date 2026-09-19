import type { Models } from "node-appwrite";

export type ClassLevel = "9" | "10";

export type Book = Models.Document & {
  title: string;
  description?: string | null;
  classLevel: ClassLevel;
  paperScheme?: string | null;
};

export type Chapter = Models.Document & {
  bookId: string;
  title: string;
  order?: number | null;
};

export type Note = Models.Document & {
  chapterId: string;
  fileName: string;
  fileId: string;
  uploadedAt: string;
};

export type Mcq = Models.Document & {
  chapterId: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
};

export type RepeatedQuestion = Models.Document & {
  chapterId: string;
  question: string;
  year?: string | null;
  notes?: string | null;
};
