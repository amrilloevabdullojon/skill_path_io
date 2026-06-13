"use client";

import { useMemo, useState, useTransition } from "react";
import { motion, useMotionValue, useTransform, AnimatePresence, type PanInfo } from "framer-motion";
import Link from "next/link";
import { Check, X, FileCode2, Loader2, Bot, Sparkles } from "lucide-react";
import { savePeerReview, askAiReview } from "@/app/peer-review/actions";
import { useIsClient } from "@/hooks/use-is-client";

type Submission = {
  id: string;
  answer: string;
  submittedAt: Date;
  mission: {
    title: string;
    slug: string;
  };
};

export function SwipeDeck({ initialSubmissions }: { initialSubmissions: Submission[] }) {
  const [submissions, setSubmissions] = useState<Submission[]>(initialSubmissions);
  const [isPending, startTransition] = useTransition();

  // Take the top submission in the array to be the current card
  const activeCard = submissions[0];

  const handleSwipe = (direction: "left" | "right", id: string) => {
    const isApproved = direction === "right";
    
    // We immediately update the UI for the Tinder gamified feel
    setSubmissions((prev) => prev.filter((s) => s.id !== id));

    // Then we transition the server action silently
    startTransition(async () => {
      // If `demo-` id is present, it means the database is empty and we injected mocks to test functionality.
      // Do not attempt to hit Prisma for "demo-" prefixed submissions as they do not exist.
      if (!id.startsWith("demo-")) {
        await savePeerReview(id, isApproved);
      }
    });
  };

  if (!activeCard) {
    return (
      <div className="flex flex-col items-center justify-center p-12 surface-panel text-center rounded-2xl border-dashed border-2 border-border/50 h-[400px] relative overflow-hidden">
        <FramerConfetti />
        
        <div className="h-20 w-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mb-6 z-10 relative">
          <Check className="h-10 w-10" />
        </div>
        <h2 className="section-title text-foreground z-10 relative">Колода пуста!</h2>
        <p className="text-muted-foreground mt-2 max-w-sm mx-auto z-10 relative">
          Вы проверили все доступные работы. Отличная работа, возвращайтесь позже за новыми заданиями.
        </p>
        <Link href="/dashboard" className="btn-primary mt-8 z-10 relative shadow-[0_0_20px_rgba(16,185,129,0.3)]">Вернуться на Дашборд</Link>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-lg mx-auto h-[550px] flex items-center flex-col justify-center perspective-[1000px]">
      
      {/* Background save indicator */}
      {isPending && (
        <div className="absolute top-[-30px] flex items-center justify-center gap-2 text-xs font-mono text-muted-foreground font-semibold uppercase animate-pulse">
          <Loader2 className="h-3 w-3 animate-spin text-indigo-500" />
          Синхронизация с сервером
        </div>
      )}

      <AnimatePresence>
        {submissions.slice(0, 3).reverse().map((submission, index) => {
          const isFront = submission.id === activeCard.id;
          return (
            <Card
              key={submission.id}
              submission={submission}
              isFront={isFront}
              index={index}
              onSwipe={(direction) => handleSwipe(direction, submission.id)}
            />
          );
        })}
      </AnimatePresence>
    </div>
  );
}

function Card({ 
  submission, 
  isFront, 
  index, 
  onSwipe 
}: { 
  submission: Submission; 
  isFront: boolean; 
  index: number; 
  onSwipe: (direction: "left" | "right") => void;
}) {
  const x = useMotionValue(0);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiVerdict, setAiVerdict] = useState<{ isApproved: boolean; comment: string } | null>(null);

  const rotate = useTransform(x, [-200, 200], [-10, 10]);
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);

  // Color & Badge indicators based on drag offset
  const rejectOpacity = useTransform(x, [-100, -50, 0], [1, 0.5, 0]);
  const acceptOpacity = useTransform(x, [0, 50, 100], [0, 0.5, 1]);
  
  const borderColor = useTransform(x, [-100, 0, 100], ["rgba(244,63,94,0.5)", "rgba(100,116,139,0.2)", "rgba(16,185,129,0.5)"]);
  const shadowColor = useTransform(x, [-100, 0, 100], [
    "0 10px 40px -10px rgba(244,63,94,0.3)", 
    "0 10px 30px -10px rgba(0,0,0,0.1)", 
    "0 10px 40px -10px rgba(16,185,129,0.3)"
  ]);

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x > 100) {
      onSwipe("right");
    } else if (info.offset.x < -100) {
      onSwipe("left");
    }
  };

  // Stack calculation. (index 0 is the farthest back, index 2 is front)
  // Reversing logic: we mapped over reverse(), so index 2 is front.
  // Wait, the map provides index 0 for the deepest, index 2 for the top.
  const zIndex = index;
  // Offset to make them look like a falling stack
  const yOffset = isFront ? 0 : (2 - index) * 15;
  const scaleValue = isFront ? 1 : 1 - ((2 - index) * 0.05);

  return (
    <motion.div
      className="absolute w-full h-[500px] cursor-grab active:cursor-grabbing origin-bottom"
      style={{
        zIndex,
        x: isFront ? x : 0,
        rotate: isFront ? rotate : 0,
        y: yOffset,
        scale: scaleValue,
        opacity: isFront ? opacity : 1,
      }}
      drag={isFront ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      whileTap={{ scale: isFront ? 1.02 : scaleValue }}
    >
      <motion.div 
        className="w-full h-full bg-card rounded-2xl border flex flex-col overflow-hidden relative"
        style={{ borderColor, boxShadow: shadowColor }}
      >
        {/* Dynamic Badges */}
        <motion.div 
          style={{ opacity: acceptOpacity }} 
          className="absolute top-8 left-8 border-4 border-emerald-500 text-emerald-500 rounded-xl px-4 py-2 text-3xl font-black uppercase rotate-[-15deg] z-20 shadow-xl"
        >
          Approve
        </motion.div>
        
        <motion.div 
          style={{ opacity: rejectOpacity }} 
          className="absolute top-8 right-8 border-4 border-rose-500 text-rose-500 rounded-xl px-4 py-2 text-3xl font-black uppercase rotate-[15deg] z-20 shadow-xl"
        >
          Reject
        </motion.div>

        {/* Header */}
        <div className="p-5 border-b border-border/50 bg-muted/20 flex flex-col gap-2">
          <div className="flex justify-between items-start">
            <span className="chip-neutral px-2 py-1 text-[10px] font-bold uppercase tracking-wider">Миссия</span>
            <span className="text-xs text-muted-foreground">
              {new Date(submission.submittedAt).toLocaleDateString()}
            </span>
          </div>
          <h2 className="text-xl font-bold text-foreground leading-tight line-clamp-2">
            {submission.mission.title}
          </h2>
        </div>

        {/* Body (Code or Text Answer) */}
        <div className="flex-1 p-5 overflow-auto bg-[#0b1120] text-slate-300 font-mono text-sm relative custom-scrollbar">
          <div className="absolute top-2 right-2 flex flex-col gap-2 items-end z-10">
            <FileCode2 className="h-6 w-6 text-muted-foreground/30" />
            {isFront && !aiVerdict && (
              <button 
                onClick={async () => {
                  setAiLoading(true);
                  // Quick simulated delay if mock
                  if (submission.id.startsWith("demo-")) await new Promise(r => setTimeout(r, 1000));
                  const res = await askAiReview(submission.answer, submission.mission.title);
                  setAiLoading(false);
                  if (res.success) {
                    setAiVerdict({ isApproved: res.isApproved ?? false, comment: res.comment ?? "" });
                  } else {
                    setAiVerdict({ isApproved: false, comment: `AI Error: ${res.error}` });
                  }
                }}
                disabled={aiLoading}
                className="btn-secondary gap-1.5 h-8 px-2 text-xs bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 hover:text-indigo-300 border-indigo-500/30"
              >
                {aiLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                {aiLoading ? "Thinking..." : "Ask AI"}
              </button>
            )}
          </div>
          
          <pre className="whitespace-pre-wrap pt-2 pr-16">{submission.answer || "Нет ответа..."}</pre>
          
          {/* AI Verdict Overlay */}
          {aiVerdict && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-4 p-4 rounded-xl border relative overflow-hidden ${aiVerdict.isApproved ? "bg-emerald-950/40 border-emerald-500/30" : "bg-rose-950/40 border-rose-500/30"}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Bot className={aiVerdict.isApproved ? "text-emerald-400 w-4 h-4" : "text-rose-400 w-4 h-4"} />
                <span className={`text-xs font-bold tracking-widest uppercase ${aiVerdict.isApproved ? "text-emerald-400" : "text-rose-400"}`}>
                  AI Mentor Verdict: {aiVerdict.isApproved ? "Approve" : "Reject"}
                </span>
              </div>
              <p className="text-sm font-sans text-slate-200">{aiVerdict.comment}</p>
              
              <button 
                onClick={() => onSwipe(aiVerdict.isApproved ? "right" : "left")}
                className={`mt-3 w-full py-1.5 rounded-lg text-xs font-semibold ${aiVerdict.isApproved ? "bg-emerald-500 hover:bg-emerald-600 text-primary-foreground" : "bg-rose-500 hover:bg-rose-600 text-primary-foreground"}`}
              >
                Accept AI Decision
              </button>
            </motion.div>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-border flex justify-between items-center bg-card">
          <div className="flex items-center gap-4 text-xs font-semibold text-muted-foreground w-full px-4">
            <div className="flex flex-col items-center gap-1 flex-1">
              <X className="h-6 w-6 text-rose-400 p-1 bg-rose-500/10 rounded-full" />
              <span>Рефакторинг</span>
            </div>
            
            <div className="flex flex-col items-center shrink-0">
               <span className="text-[10px] uppercase tracking-widest opacity-50">&larr; Свайп &rarr;</span>
            </div>

            <div className="flex flex-col items-center gap-1 flex-1">
              <Check className="h-6 w-6 text-emerald-400 p-1 bg-emerald-500/10 rounded-full" />
              <span>Супер</span>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Gamified No-Dependency Confetti Effect built on Framer Motion
type ConfettiPiece = {
  i: number;
  xStartPos: number;
  xEndOffset: number;
  color: string;
  width: number;
  height: number;
  borderRadius: string;
  yEnd: number;
  rotate: number;
  duration: number;
  delay: number;
};

const CONFETTI_COLORS = ["#f43f5e", "#10b981", "#0ea5e9", "#f59e0b", "#8b5cf6", "#ec4899"];

function buildConfettiPieces(count: number): ConfettiPiece[] {
  return Array.from({ length: count }, (_, i) => ({
    i,
    xStartPos: Math.random() * 100,
    xEndOffset: (Math.random() - 0.5) * 400,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    width: Math.random() > 0.5 ? 8 : 12,
    height: Math.random() > 0.5 ? 8 : 16,
    borderRadius: Math.random() > 0.5 ? "2px" : "50%",
    yEnd: -500 - Math.random() * 200,
    rotate: Math.random() * 720,
    duration: Math.random() * 1.5 + 1.2,
    delay: Math.random() * 0.2,
  }));
}

function FramerConfetti() {
  const mounted = useIsClient();

  // Compute random values only once on the client to avoid hydration
  // mismatch and unnecessary re-randomisation on parent re-renders.
  const pieces = useMemo(() => (mounted ? buildConfettiPieces(40) : []), [mounted]);

  if (!mounted) return null;

  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
      {pieces.map((piece) => (
        <motion.div
          key={piece.i}
          className="absolute shadow-sm"
          style={{
            backgroundColor: piece.color,
            left: `${piece.xStartPos}%`,
            top: "110%",
            width: piece.width,
            height: piece.height,
            borderRadius: piece.borderRadius,
          }}
          initial={{ opacity: 1, rotate: 0 }}
          animate={{
            x: piece.xEndOffset,
            y: piece.yEnd,
            rotate: piece.rotate,
            opacity: [1, 1, 0],
          }}
          transition={{
            duration: piece.duration,
            ease: "easeOut",
            delay: piece.delay,
          }}
        />
      ))}
    </div>
  );
}
