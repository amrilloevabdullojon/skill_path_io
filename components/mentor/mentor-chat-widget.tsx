"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, Loader2, MessageCircleQuestion, Send, Trash2, X } from "lucide-react";

import { OPEN_MENTOR_EVENT } from "@/components/tracks/ask-ai-hint-button";

type MentorChatWidgetProps = {
  trackSlug: string;
  moduleId: string;
  trackTitle: string;
  moduleTitle: string;
  lessonText: string;
};

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: number;
};

function createMessageId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function createWelcomeMessage(moduleTitle: string): ChatMessage {
  return {
    id: "mentor-welcome",
    role: "assistant",
    content: `Privet! Ya AI mentor po modulyu "${moduleTitle}". Zadavai vopros i razberem ego po shagham.`,
    createdAt: Date.now(),
  };
}

export function MentorChatWidget({
  trackSlug,
  moduleId,
  trackTitle,
  moduleTitle,
  lessonText,
}: MentorChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([createWelcomeMessage(moduleTitle)]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const storageKey = useMemo(() => `skillpath:mentor:${trackSlug}:${moduleId}`, [moduleId, trackSlug]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) {
        setMessages([createWelcomeMessage(moduleTitle)]);
        return;
      }

      const parsed = JSON.parse(raw) as ChatMessage[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        setMessages(parsed);
      } else {
        setMessages([createWelcomeMessage(moduleTitle)]);
      }
    } catch {
      setMessages([createWelcomeMessage(moduleTitle)]);
    }
  }, [moduleTitle, storageKey]);

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(messages));
  }, [messages, storageKey]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, isOpen]);

  useEffect(() => {
    function handleOpenMentor(event: Event) {
      const customEvent = event as CustomEvent<{ question?: string }>;
      const question = customEvent.detail?.question?.trim();
      setIsOpen(true);
      if (question) {
        setInput(question);
      }
    }

    window.addEventListener(OPEN_MENTOR_EVENT, handleOpenMentor as EventListener);
    return () => {
      window.removeEventListener(OPEN_MENTOR_EVENT, handleOpenMentor as EventListener);
    };
  }, []);

  async function sendMessage(content: string) {
    const trimmed = content.trim();
    if (!trimmed || isLoading) {
      return;
    }

    setErrorText(null);
    const userMessage: ChatMessage = {
      id: createMessageId(),
      role: "user",
      content: trimmed,
      createdAt: Date.now(),
    };

    const outgoingMessages = [...messages, userMessage];
    setMessages(outgoingMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/mentor", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          messages: outgoingMessages.map((message) => ({
            role: message.role,
            content: message.content,
          })),
          context: {
            trackTitle,
            moduleTitle,
            lessonText: lessonText.slice(0, 2000),
          },
        }),
      });

      const data = (await response.json()) as { reply?: string; error?: string; details?: string };
      if (!response.ok) {
        const details = data.details ? ` ${data.details}` : "";
        throw new Error((data.error || "Mentor request failed.") + details);
      }

      const mentorMessage: ChatMessage = {
        id: createMessageId(),
        role: "assistant",
        content: data.reply || "Could not get a response. Please try again.",
        createdAt: Date.now(),
      };

      setMessages((prev) => [...prev, mentorMessage]);
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : "Unknown mentor error.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage(input);
  }

  function clearHistory() {
    const welcome = createWelcomeMessage(moduleTitle);
    setMessages([welcome]);
    setErrorText(null);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="fixed bottom-4 right-4 z-[70] inline-flex items-center gap-2 rounded-full border border-sky-400/45 bg-sky-400 px-3 py-2.5 text-xs font-semibold text-slate-950 shadow-[0_12px_30px_rgba(56,189,248,0.34)] transition hover:-translate-y-0.5 hover:bg-sky-300 sm:bottom-6 sm:right-6 sm:px-4 sm:py-3 sm:text-sm"
      >
        <MessageCircleQuestion className="h-5 w-5" />
        Ask mentor
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.aside
            key="mentor-panel"
            initial={{ opacity: 0, x: 24, y: 12 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 24, y: 12 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed inset-x-3 bottom-20 z-[80] flex h-[min(78vh,620px)] w-auto flex-col overflow-hidden rounded-2xl border border-slate-700/85 bg-slate-950/96 shadow-2xl shadow-slate-950/70 sm:inset-x-auto sm:bottom-24 sm:right-6 sm:w-[min(92vw,420px)]"
          >
            <header className="flex items-start justify-between gap-3 border-b border-slate-800 p-3 sm:p-4">
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">AI Mentor</p>
                <p className="truncate text-sm font-semibold text-slate-100">{trackTitle}</p>
                <p className="truncate text-xs text-slate-400">{moduleTitle}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-md border border-slate-700 p-1.5 text-slate-300 hover:bg-slate-900"
                aria-label="Close mentor panel"
              >
                <X className="h-4 w-4" />
              </button>
            </header>

            <div className="flex-1 space-y-3 overflow-y-auto p-3 sm:p-4">
              {messages.map((message) => {
                const isAssistant = message.role === "assistant";
                return (
                  <div
                    key={message.id}
                    className={`max-w-[94%] rounded-xl px-3 py-2 text-sm leading-6 sm:max-w-[90%] ${
                      isAssistant ? "bg-slate-800 text-slate-100" : "ml-auto bg-sky-500/20 text-sky-100"
                    }`}
                  >
                    <div className="mb-1 inline-flex items-center gap-1 text-[11px] uppercase tracking-wide text-slate-400">
                      {isAssistant ? (
                        <>
                          <Bot className="h-3.5 w-3.5" />
                          Mentor
                        </>
                      ) : (
                        "You"
                      )}
                    </div>
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                );
              })}

              {isLoading && (
                <div className="inline-flex items-center gap-2 rounded-xl bg-slate-800 px-3 py-2 text-sm text-slate-200">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Mentor is typing...
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {errorText && (
              <p className="mx-4 mb-2 rounded-md border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
                {errorText}
              </p>
            )}

            <div className="border-t border-slate-800 p-3 sm:p-4">
              <form onSubmit={handleSubmit} className="space-y-2.5 sm:space-y-3">
                <textarea
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Example: how should I approach this task?"
                  rows={3}
                  className="w-full resize-none rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none ring-0 placeholder:text-slate-500 focus:border-sky-500"
                />
                <div className="flex flex-col-reverse items-stretch gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="button"
                  onClick={clearHistory}
                    className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-700 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-900 sm:justify-start"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Clear
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    className="inline-flex items-center justify-center gap-2 rounded-md bg-sky-400 px-4 py-2 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Send className="h-4 w-4" />
                    Send
                  </button>
                </div>
              </form>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
