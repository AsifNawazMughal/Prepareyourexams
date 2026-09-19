import type { ReactNode } from "react";
import Link from "next/link";
import { logout } from "@/lib/appwrite/auth-actions";
import { getLoggedInUser } from "@/lib/appwrite/server";
import { Button } from "@/components/ui/button";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await getLoggedInUser();

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b px-6 py-3">
        <nav className="flex items-center gap-4">
          <Link href="/dashboard" className="font-semibold">
            Prepare Your Exams
          </Link>
          <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
            Overview
          </Link>
          <Link href="/books" className="text-sm text-muted-foreground hover:text-foreground">
            Books
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          {user?.email && <span className="text-sm text-muted-foreground">{user.email}</span>}
          <form action={logout}>
            <Button variant="outline" size="sm" type="submit">
              Log out
            </Button>
          </form>
        </div>
      </header>
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}
