"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, Send, Trash2, X } from "lucide-react";
import ReactMarkdown from "react-markdown";

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
    content: `Привет! 👋 Я AI-ментор по модулю «${moduleTitle}». Задавай любой вопрос — разберём по шагам.`,
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
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

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

  function handleSend() {
    void sendMessage(input);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendMessage(input);
    }
  }

  function clearHistory() {
    const welcome = createWelcomeMessage(moduleTitle);
    setMessages([welcome]);
    setErrorText(null);
  }

  const quickChips = [
    "Объясни проще 🧠",
    "Дай пример из практики 💼",
    "В чём главная ошибка новичков? ⚠️",
    "Как это применить на работе? 🚀",
  ];

  return (
    <>
      {/* Floating trigger button */}
      <motion.button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-[70] group flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-sky-500 to-violet-600 px-4 py-3 text-white shadow-xl shadow-sky-500/25 hover:shadow-sky-500/40 transition-shadow sm:bottom-6 sm:right-6"
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
      >
        <Bot className="h-5 w-5" />
        <span className="text-[13px] font-semibold">AI Ментор</span>
        <span className="flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_6px_theme(colors.emerald.400)]" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="mentor-panel"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="fixed bottom-20 right-4 z-[60] flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-950/95 shadow-2xl backdrop-blur-xl sm:bottom-24 sm:right-6"
            style={{ width: "min(92vw, 400px)", height: "min(78vh, 580px)" }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
              {/* Animated gradient avatar */}
              <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-violet-600 shadow-lg shadow-sky-500/20">
                <Bot className="h-5 w-5 text-white" />
                {/* Pulse ring when loading */}
                {isLoading && (
                  <span className="absolute inset-0 animate-ping rounded-xl bg-sky-400/40" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold text-foreground">AI Ментор</p>
                <p className="truncate text-[11px] text-muted-foreground">{moduleTitle}</p>
              </div>
              {/* Status dot */}
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_6px_theme(colors.emerald.400)]" />
                <span className="text-[11px] text-emerald-400">Online</span>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="ml-1 rounded-lg p-1.5 text-muted-foreground hover:bg-white/10 hover:text-foreground transition-colors"
                aria-label="Close mentor panel"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto py-3 space-y-3">
              {messages.map((message) => {
                const isAssistant = message.role === "assistant";
                if (!isAssistant) {
                  return (
                    <div key={message.id} className="flex justify-end px-4">
                      <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-sky-600/30 border border-sky-500/40 px-3.5 py-2.5 shadow-sm">
                        <p className="text-[11px] font-medium uppercase tracking-wide text-sky-400 mb-1">ВЫ</p>
                        <p className="text-[13px] text-slate-100 leading-[1.5]">{message.content}</p>
                      </div>
                    </div>
                  );
                }
                return (
                  <div key={message.id} className="flex items-start gap-2 px-4">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-violet-600 mt-0.5">
                      <Bot className="h-3.5 w-3.5 text-white" />
                    </div>
                    <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-slate-800 border border-white/[0.06] px-3.5 py-2.5 shadow-sm">
                      <p className="text-[11px] font-medium uppercase tracking-wide text-violet-400 mb-1">МЕНТОР</p>
                      <div className="max-w-none text-[13px] leading-[1.55] text-slate-200 [&_p]:mb-1.5 [&_p:last-child]:mb-0 [&_ul]:mt-1 [&_ul]:pl-4 [&_ul]:list-disc [&_ol]:mt-1 [&_ol]:pl-4 [&_ol]:list-decimal [&_li]:mb-0.5 [&_strong]:font-semibold [&_strong]:text-white [&_em]:italic [&_blockquote]:border-l-2 [&_blockquote]:border-violet-500/50 [&_blockquote]:pl-2.5 [&_blockquote]:text-slate-400 [&_blockquote]:italic [&_code]:rounded [&_code]:bg-white/10 [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-[11px] [&_code]:font-mono [&_h3]:font-semibold [&_h3]:text-white [&_h3]:mt-2 [&_h3]:mb-1">
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Typing indicator */}
              {isLoading && (
                <div className="flex items-start gap-2 px-4 py-2">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-violet-600">
                    <Bot className="h-3.5 w-3.5 text-white" />
                  </div>
                  <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm bg-slate-800/80 px-3 py-2.5">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-sky-400 [animation-delay:0ms]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-sky-400 [animation-delay:150ms]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-sky-400 [animation-delay:300ms]" />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick suggestion chips — show only when only the welcome message is present */}
            {messages.length === 1 && (
              <div className="px-4 pb-3">
                <p className="mb-2 text-[11px] text-muted-foreground">Попробуй спросить:</p>
                <div className="flex flex-wrap gap-1.5">
                  {quickChips.map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => {
                        setInput(chip);
                        textareaRef.current?.focus();
                      }}
                      className="rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-[12px] text-sky-400 transition-colors hover:bg-sky-500/20"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Error display */}
            {errorText && (
              <p className="mx-4 mb-2 rounded-md border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
                {errorText}
              </p>
            )}

            {/* Input area */}
            <div className="border-t border-white/10 p-3">
              <form onSubmit={handleSubmit}>
                <div className="flex items-end gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 focus-within:border-sky-500/50 focus-within:bg-sky-500/5 transition-colors">
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Задай вопрос ментору..."
                    rows={1}
                    className="flex-1 resize-none bg-transparent text-[14px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
                    style={{ maxHeight: "120px" }}
                  />
                  <button
                    type="button"
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                    className="shrink-0 flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500 text-white transition-all hover:bg-sky-400 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-1.5 flex items-center justify-between">
                  <p className="text-[10px] text-muted-foreground/50">Enter — отправить • Shift+Enter — новая строка</p>
                  <button
                    type="button"
                    onClick={clearHistory}
                    className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-muted-foreground hover:bg-white/10 hover:text-foreground transition-colors"
                  >
                    <Trash2 className="h-3 w-3" />
                    Очистить
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
