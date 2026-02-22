import { Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";

import { authClient, type User } from "@/lib/auth-client";
import { Button } from "./ui/button";
import UserMenu from "./user-menu";

export default function Header() {
  const { data: session } = authClient.useSession();
  const user = session?.user as User | undefined;

  return (
    <header className="border-b">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <Link to="/" className="text-xl font-bold">
          Auroville Events
        </Link>
        <div className="flex items-center gap-3">
          {user?.canCreateEvents && (
            <Link to="/events/create">
              <Button size="sm">
                <Plus className="mr-1 h-4 w-4" />
                Create Event
              </Button>
            </Link>
          )}
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
