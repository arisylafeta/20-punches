import { Button } from "@/components/ui/button";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { signOut } from "@/app/login/actions";

export default async function Header() {
    const supabase = await createClient();

    const { 
        data: { user }
    } = await supabase.auth.getUser();
  return (
    <header className="z-10 sticky top-0 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <nav className="flex items-center space-x-4 lg:space-x-6">
          <a className="mr-6 flex items-center space-x-2" href="/">
            <span className="font-bold">20Punches</span>
          </a>
          <Link href="/">20Punches</Link>
        </nav>
        <div className="flex flex-1 items-center justify-end space-x-2">
            {user !== null ? (
                <form action={signOut} className="flex items-center gap-2">
                    <p>{user.email}</p>
                    <Button type="submit">
                        Sign Out
                    </Button>
                </form>
            ) : (
                <Button asChild>
                    <Link href="/login">Sign In</Link>
                </Button>
            )}
        </div>
      </div>
    </header>
  );
}