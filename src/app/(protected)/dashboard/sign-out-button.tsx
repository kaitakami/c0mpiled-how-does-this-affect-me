"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/sign-in");
        },
      },
    });
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleSignOut}
      className="gap-2 text-muted-foreground hover:text-foreground"
    >
      <LogOut className="size-4" />
      <span className="hidden sm:inline">Sign Out</span>
    </Button>
  );
}
