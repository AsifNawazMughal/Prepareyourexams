"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AppwriteException } from "node-appwrite";
import { createAdminClient, createSessionClient } from "./server";
import { SESSION_COOKIE } from "./config";

export async function login(_prevState: { error?: string } | undefined, formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Enter your email and password." };
  }

  try {
    const { account } = createAdminClient();
    const session = await account.createEmailPasswordSession({ email, password });

    (await cookies()).set(SESSION_COOKIE, session.secret, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: new Date(session.expire),
      path: "/",
    });
  } catch (error) {
    if (error instanceof AppwriteException) {
      return { error: "Incorrect email or password." };
    }
    throw error;
  }

  redirect("/dashboard");
}

export async function logout() {
  try {
    const { account } = await createSessionClient();
    await account.deleteSession({ sessionId: "current" });
  } catch {
    // Session already gone — nothing to clean up server-side.
  }
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/login");
}
