"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { api } from "@/lib/api-client";

export function ProfileGuard({ children }: { children: React.ReactNode }) {
	const router = useRouter();
	const [ready, setReady] = useState(false);

	useEffect(() => {
		api.getUserProfile("current").then((profile) => {
			if (!profile) {
				router.replace("/onboarding");
			} else {
				setReady(true);
			}
		});
	}, [router]);

	if (!ready) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-background">
				<div className="pointer-events-none fixed inset-0 bg-dot-pattern opacity-20" />
				<Loader2 className="size-5 animate-spin text-muted-foreground" />
			</div>
		);
	}

	return <>{children}</>;
}
