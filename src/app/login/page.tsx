import { redirect } from "next/navigation";
import { getLoggedInUser } from "@/lib/appwrite/server";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const user = await getLoggedInUser();
  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <LoginForm />
    </main>
  );
}
