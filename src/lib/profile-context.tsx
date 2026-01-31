"use client";

import { createContext, useContext } from "react";
import type { UserProfile } from "@/types";

const ProfileContext = createContext<UserProfile | null>(null);

export function ProfileProvider({
	profile,
	children,
}: {
	profile: UserProfile;
	children: React.ReactNode;
}) {
	return (
		<ProfileContext.Provider value={profile}>
			{children}
		</ProfileContext.Provider>
	);
}

export function useProfile(): UserProfile {
	const ctx = useContext(ProfileContext);
	if (!ctx) {
		throw new Error("useProfile must be used inside <ProfileProvider>");
	}
	return ctx;
}
