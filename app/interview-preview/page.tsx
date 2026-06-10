"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "framer-motion";
import { Mic, ArrowRight, Sparkles, Loader2, StopCircle, RefreshCw, AlertTriangle, ShieldCheck, Volume2, Info } from "lucide-react";
import { RoleGuard } from "@/components/auth/role-guard";

type Track = "QA" | "BA" | "DA";

type SpeechRecognitionResultEventLike = {
  resultIndex: number;
  results: ArrayLike<{ 0: { transcript: string } }>;
};

type SpeechRecognitionErrorEventLike = {
  error: string;
};

type SpeechRecognitionController = {
  stop: () => void;
};

type SpeechRecognitionInstance = SpeechRecognitionController & {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionResultEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
  start: () => void;
};

type SpeechRecognitionWindow = Window & {
  SpeechRecognition?: new () => SpeechRecognitionInstance;
  webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
};

const QUESTIONS: Record<Track, string> = {
  QA: "Что такое регрессионное тестирование и когда его необходимо проводить?",
  BA: "В чем разница между функциональными и нефункциональными требованиями?",
  DA: "Что такое нормализация баз данных и зачем она нужна?",
};

function AnimatedScore({ score }: { score: number }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => (Math.round(latest * 10) / 10).toFixed(1));
  
  useEffect(() => {
    const controls = animate(count, score, { duration: 1.5, ease: "easeOut" });
    return controls.stop;
  }, [score, count]);

  return <motion.span>{rounded}</motion.span>;
}

export default function InterviewPreviewPage() {
  const [track, setTrack] = useState<Track>("QA");
  const [answer, setAnswer] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ score: number; feedback: string; missing: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [recognition, setRecognition] = useState<SpeechRecognitionController | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Stop audio on unmount or track change
  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
    };
  }, [track]);

  const playQuestionAudio = () => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(QUESTIONS[track]);
    utterance.lang = "ru-RU";
    utterance.rate = 1.0;
    utterance.pitch = 1.1; // Make it sound slightly more engaging
    
    utterance.onstart = () => setIsPlayingAudio(true);
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    window.speechSynthesis.speak(utterance);
  };

  const startRecording = async () => {
    setError(null);
    const speechWindow = window as SpeechRecognitionWindow;
    const SpeechRecognition = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;

    const startSimulation = () => {
      setIsRecording(true);
      setIsSimulating(true);
      
      const demoAnswers: Record<Track, string> = {
        QA: "Регрессионное тестирование — это проверка уже протестированного ПО после внесения изменений в код. Оно нужно, чтобы убедиться, что новые фичи или исправления багов не сломали существующий функционал игры или приложения. Обычно мы запускаем его перед релизом.",
        BA: "Функциональные требования описывают то, что система ДОЛЖНА делать (например, пользователь может добавить товар в корзину). Нефункциональные описывают то, КАК система должна работать (например, сайт должен загружаться не более 2 секунд).",
        DA: "Нормализация базы данных — это процесс организации таблиц для уменьшения избыточности и устранения аномалий при обновлении данных. Это нужно, чтобы данные хранились логично и занимали меньше места, обычно применяя правила до третьей нормальной формы."
      };
      
      const textToType = demoAnswers[track];
      let currentText = "";
      let i = 0;
      
      setAnswer("");
      
      const interval = setInterval(() => {
        if (i < textToType.length) {
          currentText += textToType.charAt(i);
          setAnswer(currentText);
          i++;
        } else {
          clearInterval(interval);
          setIsRecording(false);
          setIsSimulating(false);
        }
      }, 50); // Speed of typing simulation

      setRecognition({ stop: () => { clearInterval(interval); setIsRecording(false); setIsSimulating(false); } });
    };

    if (!SpeechRecognition) {
      startSimulation();
      return;
    }

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        await navigator.mediaDevices.getUserMedia({ audio: true });
      }
    } catch {
      // Fallback to simulation if OS/Browser blocks mic
      startSimulation();
      return;
    }

    try {
      const rec = new SpeechRecognition();
      rec.lang = 'ru-RU'; // Keeping it tailored for the Russian mock interview questions
      rec.interimResults = true;
      rec.continuous = true;

      rec.onstart = () => setIsRecording(true);
      
      let initialAnswer = answer; 
      if (initialAnswer.length > 0 && !initialAnswer.endsWith(" ")) {
        initialAnswer += " "; 
      }

      rec.onresult = (event) => {
        let currentTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setAnswer(initialAnswer + currentTranscript);
      };

      rec.onerror = (event) => {
        setIsRecording(false);
        if (event.error === 'not-allowed') {
          startSimulation();
        } else {
          setError(`Microphone error: ${event.error}`);
        }
      };

      rec.onend = () => {
        setIsRecording(false);
      };

      rec.start();
      setRecognition(rec);
    } catch {
      startSimulation();
    }
  };

  const stopRecording = () => {
    if (recognition) {
      recognition.stop();
    }
    setIsRecording(false);
  };

  const handleSubmit = async () => {
    if (answer.trim().length < 10) {
      setError("Ответ слишком короткий. Попробуйте раскрыть тему подробнее!");
      return;
    }
    
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/public/ai-interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answer, track }),
      });

      const data = (await res.json()) as { error?: string; message?: string; score?: number; feedback?: string; missing?: string };
      if (!res.ok) throw new Error(data.message || data.error || "Request failed");

      setResult({
        score: typeof data.score === "number" ? data.score : 0,
        feedback: typeof data.feedback === "string" ? data.feedback : "",
        missing: typeof data.missing === "string" ? data.missing : "",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка при проверке ответа.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px]" />
        <div className="absolute top-[60%] -right-[10%] w-[40%] h-[50%] rounded-full bg-emerald-500/10 blur-[120px]" />
      </div>

      <Link href="/" className="absolute top-6 flex items-center justify-center font-semibold text-foreground z-10 w-full ml-6 left-0">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-indigo-400/30 bg-indigo-500/15 text-indigo-200 mr-2">
          <Sparkles className="h-4 w-4" />
        </span>
        Levio AI
      </Link>

      <div className="w-full max-w-3xl relative z-10 mt-12">
        <div className="text-center mb-10 space-y-3">
          <h1 className="hero-title text-foreground">
            Живой тест ИИ-ментора
          </h1>
          <p className="text-muted-foreground text-base max-w-xl mx-auto">
            Испытайте нашего ИИ-интервьюера в деле. Ответьте на реальный вопрос с собеседования и получите моментальный фидбек.
          </p>
        </div>

        <RoleGuard 
          allowedRoles={["PRO_STUDENT", "MENTOR", "RECRUITER", "ADMIN"]} 
          fallbackMessage="Обработка голосового ввода и ИИ-аналитика требуют подписки уровня PRO."
        >
        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div 
              key="interview-panel"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="surface-elevated overflow-hidden"
            >
              {/* Track Selector */}
              <div className="p-4 border-b border-border/50 flex flex-wrap gap-2 justify-center bg-muted/20">
                {(["QA", "BA", "DA"] as Track[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTrack(t)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                      track === t
                        ? "bg-indigo-500 text-primary-foreground shadow-[0_0_15px_rgba(99,102,241,0.3)]"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {t} Трек
                  </button>
                ))}
              </div>

              <div className="p-6 sm:p-10 space-y-8">
                {/* AI Avatar & Question */}
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="relative cursor-pointer group" onClick={playQuestionAudio}>
                    <div className={`absolute inset-0 rounded-full bg-indigo-500/20 blur-xl transition-all duration-500 ${isPlayingAudio ? "animate-pulse scale-150 bg-indigo-400/40" : ""}`} />
                    <div className="h-20 w-20 relative bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center ring-4 ring-slate-900 shadow-2xl group-hover:scale-105 transition-transform">
                      {isPlayingAudio ? (
                        <div className="flex gap-1 items-center justify-center">
                          <motion.div animate={{ height: [12, 24, 12] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-1.5 bg-white rounded-full" />
                          <motion.div animate={{ height: [12, 32, 12] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.2 }} className="w-1.5 bg-white rounded-full" />
                          <motion.div animate={{ height: [12, 20, 12] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.4 }} className="w-1.5 bg-white rounded-full" />
                        </div>
                      ) : (
                        <Volume2 className="h-8 w-8 text-primary-foreground group-hover:text-indigo-200 transition-colors" />
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-indigo-500 dark:text-indigo-400 font-bold uppercase tracking-widest mb-2 flex items-center justify-center gap-2">
                       ИИ-Интервьюер
                    </p>
                    <h2 className="text-xl sm:text-2xl font-medium text-foreground leading-relaxed cursor-pointer hover:text-indigo-400 transition-colors" onClick={playQuestionAudio}>
                      &laquo;{QUESTIONS[track]}&raquo;
                    </h2>
                  </div>
                </div>

                {/* Input Area */}
                <div className="relative">
                  <AnimatePresence>
                    {isSimulating && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute -top-10 left-0 right-0 flex justify-center z-10"
                      >
                        <span className="bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-[11px] px-3 py-1 rounded-full flex items-center gap-1.5 font-medium backdrop-blur-sm">
                          <Info className="h-3.5 w-3.5" /> Демо-режим: доступ к микрофону заблокирован
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <textarea
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Напишите ваш ответ здесь или нажмите на микрофон..."
                    className={`textarea-base min-h-[160px] p-5 text-base border-2 relative z-0 ${
                      isRecording ? "border-rose-500 bg-rose-500/5 shadow-[0_0_15px_rgba(244,63,94,0.1)]" : ""
                    }`}
                  />
                  
                  {/* Fake Mic UI */}
                  <div className="absolute bottom-4 right-4 flex items-center gap-3">
                    {isRecording && !isSimulating && (
                      <span className="text-xs text-rose-400 font-medium flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" /> Слушаю...
                      </span>
                    )}
                    
                    <div className="relative">
                      {isRecording && (
                        <>
                          <motion.div 
                            className="absolute inset-0 rounded-full border-2 border-rose-500/50"
                            animate={{ scale: [1, 2], opacity: [0.8, 0] }}
                            transition={{ repeat: Infinity, duration: 1.5, ease: "easeOut" }}
                          />
                          <motion.div 
                            className="absolute inset-0 rounded-full border-2 border-rose-500/30"
                            animate={{ scale: [1, 2.5], opacity: [0.5, 0] }}
                            transition={{ repeat: Infinity, duration: 1.5, delay: 0.5, ease: "easeOut" }}
                          />
                        </>
                      )}
                      <button
                        onClick={isRecording ? stopRecording : startRecording}
                        disabled={isSimulating && isRecording}
                        className={`p-3 rounded-full transition-all relative z-10 ${
                          isRecording 
                            ? "bg-rose-500 text-primary-foreground shadow-lg" 
                            : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
                        } disabled:opacity-50`}
                      >
                        {isRecording ? <StopCircle className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="p-4 rounded-xl border border-rose-500/35 bg-rose-500/10 text-rose-600 dark:text-rose-400 text-sm flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" /> {error}
                  </div>
                )}

                {/* Submit */}
                <div className="flex justify-center">
                  <button
                    onClick={handleSubmit}
                    disabled={loading || answer.length === 0}
                    className="btn-primary px-8 py-4 text-base font-bold transition-all hover:scale-105 active:scale-95 flex items-center gap-3"
                  >
                    {loading ? (
                      <><Loader2 className="h-5 w-5 animate-spin" /> Оценка...</>
                    ) : (
                      <>Получить фидбек <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" /></>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="results-panel"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              <div className="surface-elevated border-emerald-500/30 bg-emerald-500/5 p-8 sm:p-12 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-400" />
                
                <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-6 border-4 border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                  <span className="metric-value text-emerald-500 dark:text-emerald-300"><AnimatedScore score={result.score} /></span><span className="text-sm mt-2">/10</span>
                </div>
                
                <h2 className="text-2xl sm:page-title text-foreground mb-6">Оценка Завершена</h2>
                
                <div className="text-left space-y-5 max-w-2xl mx-auto">
                  <div className="p-5 rounded-2xl border border-border bg-card shadow-sm">
                    <p className="text-emerald-600 dark:text-emerald-400 text-sm font-semibold uppercase tracking-wider mb-2 flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4" /> Разбор ответа
                    </p>
                    <p className="text-foreground leading-relaxed text-sm">{result.feedback}</p>
                  </div>
                  
                  {result.missing && (
                    <div className="p-5 rounded-2xl border border-amber-500/30 bg-amber-500/10">
                      <p className="text-amber-600 dark:text-amber-500 text-sm font-semibold uppercase tracking-wider mb-2 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" /> Упущенная возможность
                      </p>
                      <p className="text-amber-800 dark:text-amber-200 leading-relaxed text-sm">{result.missing}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Upsell hook */}
              <div className="surface-elevated p-8 bg-indigo-500/5 border-indigo-500/20 text-center">
                <h3 className="text-xl font-bold text-foreground mb-3">Готовы к полному 45-минутному собеседованию?</h3>
                <p className="text-muted-foreground text-sm max-w-lg mx-auto mb-8">
                  Получайте офферы быстрее, тренируясь на полноформатных ИИ-интервью под вашу профессию. Откройте полную версию с бесплатным аккаунтом.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link href="/login" className="btn-primary px-8 py-3.5 shadow-md">
                    Создать аккаунт
                  </Link>
                  <button onClick={() => setResult(null)} className="btn-secondary px-8 py-3.5 flex items-center justify-center gap-2">
                    <RefreshCw className="h-4 w-4" /> Другой вопрос
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        </RoleGuard>
      </div>
    </div>
  );
}
