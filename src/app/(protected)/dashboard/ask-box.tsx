"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { ArrowUp, Loader, Sparkles, User } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useProfile } from "@/lib/profile-context";

const SUGGESTED_PROMPTS = [
	"How does this ballot affect my rent?",
	"What's the total cost to my household?",
	"Which measures help renters?",
	"Explain the climate bond to me",
];

export function AskBox() {
	const profile = useProfile();
	const [input, setInput] = useState("");
	const inputRef = useRef<HTMLTextAreaElement>(null);

	const transport = useMemo(
		() =>
			new DefaultChatTransport({
				api: "/api/chat",
				body: {
					profile: {
						zipCode: profile.zipCode,
						housingStatus: profile.housingStatus,
						homeValue: profile.homeValue,
						monthlyRent: profile.monthlyRent,
						incomeRange: profile.incomeRange,
						jobSector: profile.jobSector,
						householdSize: profile.householdSize,
					},
				},
			}),
		[
			profile.zipCode,
			profile.housingStatus,
			profile.homeValue,
			profile.monthlyRent,
			profile.incomeRange,
			profile.jobSector,
			profile.householdSize,
		],
	);

	const { messages, sendMessage, status } = useChat({ transport });

	const isStreaming = status === "streaming" || status === "submitted";

	const submit = (text: string) => {
		if (!text.trim() || isStreaming) return;
		sendMessage({ text });
		setInput("");
	};

	const visibleMessages = messages.filter((m) => m.role !== "system");

	const getMessageText = (m: (typeof messages)[0]) => {
		return m.parts
			.filter((p) => p.type === "text")
			.map((p) => p.text)
			.join("");
	};

	return (
		<div className="mb-8">
			{/* Chat messages */}
			{visibleMessages.length > 0 && (
				<div className="mb-4 max-h-96 space-y-3 overflow-y-auto rounded-xl border border-white/[0.08] bg-white/[0.01] p-4">
					{visibleMessages.map((m) => (
						<div key={m.id} className="flex gap-3">
							<div
								className={`flex size-6 shrink-0 items-center justify-center rounded-md ${
									m.role === "user" ? "bg-white/[0.08]" : "bg-violet-500/15"
								}`}
							>
								{m.role === "user" ? (
									<User className="size-3.5 text-white/50" />
								) : (
									<Sparkles className="size-3.5 text-violet-400" />
								)}
							</div>
							<div className="min-w-0 flex-1">
								<p className="text-xs font-medium text-white/40">
									{m.role === "user" ? "You" : "AI"}
								</p>
								<p className="mt-0.5 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
									{getMessageText(m)}
								</p>
							</div>
						</div>
					))}
					{isStreaming &&
						visibleMessages[visibleMessages.length - 1]?.role === "user" && (
							<div className="flex gap-3">
								<div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-violet-500/15">
									<Sparkles className="size-3.5 animate-pulse text-violet-400" />
								</div>
								<div className="flex items-center gap-2">
									<Loader className="size-3 animate-spin text-white/30" />
									<span className="text-xs text-white/30">Thinking...</span>
								</div>
							</div>
						)}
				</div>
			)}

			{/* Input area */}
			<div className="relative rounded-xl border border-white/[0.08] bg-white/[0.02] transition-colors focus-within:border-white/[0.16]">
				<textarea
					ref={inputRef}
					value={input}
					onChange={(e) => setInput(e.target.value)}
					placeholder="Ask anything about your ballot..."
					rows={2}
					onKeyDown={(e) => {
						if (e.key === "Enter" && !e.shiftKey) {
							e.preventDefault();
							submit(input);
						}
					}}
					className="w-full resize-none bg-transparent px-4 pt-4 pb-12 text-sm text-foreground placeholder:text-white/20 focus:outline-none"
				/>
				<div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
					<div className="flex flex-wrap gap-1.5">
						{visibleMessages.length === 0 &&
							SUGGESTED_PROMPTS.map((prompt) => (
								<button
									key={prompt}
									type="button"
									onClick={() => submit(prompt)}
									className="rounded-full border border-white/[0.06] bg-white/[0.03] px-2.5 py-1 text-[11px] text-white/40 transition-colors hover:border-white/[0.12] hover:text-white/60"
								>
									{prompt}
								</button>
							))}
					</div>
					<Button
						type="button"
						size="icon"
						disabled={!input.trim() || isStreaming}
						onClick={() => submit(input)}
						className="size-7 shrink-0 rounded-lg"
					>
						{isStreaming ? (
							<Loader className="size-3.5 animate-spin" />
						) : (
							<ArrowUp className="size-3.5" />
						)}
					</Button>
				</div>
			</div>
		</div>
	);
}
