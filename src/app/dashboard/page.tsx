import { getLoggedInUser } from "@/lib/appwrite/server";
import { logout } from "@/lib/appwrite/auth-actions";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const user = await getLoggedInUser();

  return (
    <main className="flex flex-1 flex-col gap-4 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Overview</h1>
        <form action={logout}>
          <Button variant="outline" type="submit">
            Log out
          </Button>
        </form>
      </div>
      <p className="text-muted-foreground">
        Logged in as {user?.email}. Books, chapters, notes, and MCQs come next.
      </p>
    </main>
  );
}
