"use client";

import { useCallback, useMemo, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { TrackCategory } from "@prisma/client";
import {
  ArrowRight,
  BookOpenCheck,
  BriefcaseBusiness,
  ClipboardCheck,
  Loader2,
  RefreshCw,
  Mic,
  StopCircle,
  Sparkles,
  AlertTriangle,
  ShieldCheck,
  Target,
  Timer,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { interviewNextSteps, interviewTrackLabel } from "@/features/interview/trainer";

type InterviewQuestion = {
  id: string;
  text: string;
  expectedFocus: string;
};

type InterviewEvaluation = {
  score: number;
  level: "Junior" | "Junior+" | "Middle";
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  summary: string;
};

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

const TIMER_SECONDS = 120; // 2 minutes per question

export function MockInterviewPanel() {
  const [track, setTrack] = useState<TrackCategory>(TrackCategory.QA);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [evaluation, setEvaluation] = useState<InterviewEvaluation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  // New Voice & Timer State
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognitionController | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(TIMER_SECONDS);
  const [isSimulating, setIsSimulating] = useState(false);

  const currentQuestion = questions[currentIndex] ?? null;
  const answerForCurrent = currentQuestion ? answers[currentQuestion.id] ?? "" : "";
  const canGoNext = answerForCurrent.trim().length >= 10;
  const isLast = currentIndex === questions.length - 1 && questions.length > 0;

  const payloadAnswers = useMemo(
    () =>
      questions.map((question) => ({
        questionId: question.id,
        answer: answers[question.id] ?? "",
      })),
    [answers, questions],
  );

  // Stop recording if the component unmounts or question changes
  useEffect(() => {
    return () => {
      recognition?.stop?.();
      setIsRecording(false);
    };
  }, [currentIndex, recognition]);

  // Read aloud the current question.
  useEffect(() => {
    if (currentQuestion && !evaluation && !isLoading) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel(); // Stop any pending speech
        const msg = new SpeechSynthesisUtterance(currentQuestion.text);

        // Try to pick a natural google/apple voice if available
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(v => v.lang.includes('ru') && (v.name.includes('Google') || v.name.includes('Apple')));
        if (preferredVoice) msg.voice = preferredVoice;

        msg.rate = 1.05; // Slightly faster natural pacing
        msg.pitch = 0.95;
        window.speechSynthesis.speak(msg);
      }
    }
  }, [currentQuestion, evaluation, isLoading]);

  const handleTimeOutRef = useRef<() => void>(() => {});

  // Timer Tick
  useEffect(() => {
    if (questions.length > 0 && !evaluation && !isLoading) {
      const interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            handleTimeOutRef.current();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [questions.length, currentIndex, evaluation, isLoading]);

  const startRecording = async () => {
    setErrorText(null);
    const speechWindow = window as SpeechRecognitionWindow;
    const SpeechRecognition = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;

    const startSimulation = () => {
      setIsRecording(true);
      setIsSimulating(true);

      const fallbackText = " В реальном интервью я бы ответил на этот вопрос так... Я думаю, главный фокус здесь заключается в правильном анализе требований и подготовке. ";
      let i = 0;

      const interval = setInterval(() => {
        if (i < fallbackText.length) {
          setAnswers(prev => ({...prev, [currentQuestion.id]: (prev[currentQuestion.id] || "") + fallbackText.charAt(i) }));
          i++;
        } else {
          clearInterval(interval);
          setIsRecording(false);
          setIsSimulating(false);
        }
      }, 30);

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
      // Fallback
      startSimulation();
      return;
    }

    try {
      const rec = new SpeechRecognition();
      rec.lang = 'ru-RU';
      rec.interimResults = true;
      rec.continuous = true;

      rec.onstart = () => setIsRecording(true);

      let initialAnswer = answerForCurrent;
      if (initialAnswer.length > 0 && !initialAnswer.endsWith(" ")) {
        initialAnswer += " ";
      }

      rec.onresult = (event) => {
        let currentTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setAnswers((prev) => ({
            ...prev,
            [currentQuestion.id]: initialAnswer + currentTranscript,
        }));
      };

      rec.onerror = (event) => {
        setIsRecording(false);
        if (event.error === 'not-allowed') {
          startSimulation();
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

  const stopRecording = useCallback(() => {
    if (recognition) {
      recognition.stop();
    }
    setIsRecording(false);
  }, [recognition]);

  async function startInterview(selectedTrack: TrackCategory) {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setTrack(selectedTrack);
    setIsLoading(true);
    setErrorText(null);
    setEvaluation(null);

    try {
      const response = await fetch("/api/ai/interview", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          action: "start",
          track: selectedTrack,
        }),
      });
      const data = (await response.json()) as { questions?: InterviewQuestion[]; error?: string };
      if (!response.ok || !Array.isArray(data.questions)) {
        throw new Error(data.error || "Could not start interview");
      }

      setQuestions(data.questions);
      setAnswers({});
      setCurrentIndex(0);
      setTimeLeft(TIMER_SECONDS);
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : "Unknown interview error.");
    } finally {
      setIsLoading(false);
    }
  }

  const finishInterview = useCallback(async () => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    stopRecording();
    setIsLoading(true);
    setErrorText(null);

    try {
      const response = await fetch("/api/ai/interview", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          action: "evaluate",
          track,
          answers: payloadAnswers,
        }),
      });
      const data = (await response.json()) as { evaluation?: InterviewEvaluation; error?: string };
      if (!response.ok || !data.evaluation) {
        throw new Error(data.error || "Could not finish interview");
      }

      setEvaluation(data.evaluation);
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : "Interview evaluation failed.");
    } finally {
      setIsLoading(false);
    }
  }, [payloadAnswers, stopRecording, track]);

  useEffect(() => {
    handleTimeOutRef.current = () => {
      stopRecording();
      if (isLast) {
        finishInterview();
      } else {
        setTimeLeft(TIMER_SECONDS);
        setCurrentIndex((prev) => Math.min(prev + 1, questions.length - 1));
      }
    };
  }, [finishInterview, isLast, questions.length, stopRecording]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <section className="space-y-6">
      <header className="surface-elevated space-y-5 p-5 sm:p-7">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-end">
          <div className="space-y-3">
            <p className="kicker flex items-center gap-2 text-indigo-400"><Sparkles className="h-4 w-4" /> Карьерная тренировка</p>
            <h1 className="page-title text-foreground">Симулятор собеседования</h1>
            <p className="text-sm text-muted-foreground max-w-2xl">
              Проверьте, как звучат ваши ответы перед реальным рынком: структура, конкретика, уверенность и связь с портфолио.
            </p>
          </div>
          <Link href="/career" className="btn-secondary inline-flex items-center justify-center gap-2 rounded-lg">
            <BriefcaseBusiness className="h-4 w-4" />
            Вернуться к готовности
          </Link>
        </div>
        <div className="grid gap-3 md:grid-cols-4">
          <Link href="/review" className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-3 transition-colors hover:bg-indigo-500/15">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-indigo-300">Перед интервью</p>
            <p className="mt-1 inline-flex items-center gap-2 text-sm font-semibold text-foreground">
              Повторить слабое
              <Target className="h-4 w-4" />
            </p>
          </Link>
          <Link href="/portfolio" className="rounded-xl border border-border bg-background/60 p-3 transition-colors hover:bg-background/80">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Аргументы</p>
            <p className="mt-1 inline-flex items-center gap-2 text-sm font-semibold text-foreground">
              Портфолио
              <ClipboardCheck className="h-4 w-4" />
            </p>
          </Link>
          <Link href="/notes" className="rounded-xl border border-border bg-background/60 p-3 transition-colors hover:bg-background/80">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Шпаргалки</p>
            <p className="mt-1 inline-flex items-center gap-2 text-sm font-semibold text-foreground">
              Заметки
              <BookOpenCheck className="h-4 w-4" />
            </p>
          </Link>
          <Link href="/jobs" className="rounded-xl border border-border bg-background/60 p-3 transition-colors hover:bg-background/80">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">После</p>
            <p className="mt-1 inline-flex items-center gap-2 text-sm font-semibold text-foreground">
              Вакансии
              <BriefcaseBusiness className="h-4 w-4" />
            </p>
          </Link>
        </div>
      </header>

      {questions.length === 0 && (
        <div className="surface-elevated mx-auto max-w-4xl p-8 text-center space-y-6">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-indigo-500/10 text-indigo-400 mb-2">
            <Mic className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Выберите профессию для старта</h2>
            <p className="mx-auto max-w-xl text-sm text-muted-foreground">
              Начните с роли из карьерного трека. После оценки вернитесь в review, портфолио или job matching по результату.
            </p>
          </div>
          <div className="flex flex-wrap gap-4 justify-center">
            {[TrackCategory.QA, TrackCategory.BA, TrackCategory.DA].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => startInterview(item)}
                disabled={isLoading}
                className={`rounded-xl border-2 px-6 py-4 text-base font-semibold hover:-translate-y-1 transition-all ${
                  track === item
                    ? "border-indigo-500 bg-indigo-500/10 text-indigo-400 shadow-[0_10px_30px_rgba(99,102,241,0.15)]"
                    : "border-border bg-card hover:border-border/70 hover:bg-muted/50 text-foreground"
                } disabled:opacity-50`}
              >
                {interviewTrackLabel(item)}
              </button>
            ))}
          </div>
        </div>
      )}

      {loadingView(isLoading && questions.length === 0)}

      <AnimatePresence mode="wait">
        {questions.length > 0 && !evaluation && currentQuestion && (
          <motion.div
            key="interview-active"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="surface-elevated mx-auto max-w-4xl overflow-hidden"
          >
            {/* Top Bar with Timer */}
            <div className="flex items-center justify-between border-b border-border/50 bg-muted/20 px-6 py-4">
               <div>
                 <p className="text-xs font-bold uppercase tracking-widest text-indigo-400">
                    Вопрос {currentIndex + 1} из {questions.length}
                 </p>
               </div>
               <div className={`flex items-center gap-2 font-mono text-sm px-3 py-1.5 rounded-md border ${
                 timeLeft <= 30 ? "bg-rose-500/15 border-rose-500/30 text-rose-400 animate-pulse" : "bg-card border-border text-foreground"
               }`}>
                 <Timer className="h-4 w-4" />
                 {formatTimer(timeLeft)}
               </div>
            </div>

            <div className="p-6 sm:p-10 space-y-8">
              <div className="grid gap-3 text-sm md:grid-cols-3">
                <div className="rounded-xl border border-border bg-background/60 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Формат</p>
                  <p className="mt-1 font-semibold text-foreground">Короткий STAR-ответ</p>
                </div>
                <div className="rounded-xl border border-border bg-background/60 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Фокус</p>
                  <p className="mt-1 font-semibold text-foreground">{currentQuestion.expectedFocus}</p>
                </div>
                <div className="rounded-xl border border-border bg-background/60 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Цель</p>
                  <p className="mt-1 font-semibold text-foreground">Конкретика вместо общих слов</p>
                </div>
              </div>

              {/* AI Avatar & Question */}
              <div className="flex flex-col items-center text-center space-y-5">
                <div className="relative">
                  <div className={`absolute inset-0 rounded-full blur-xl transition-all duration-700 ${
                    timeLeft <= 30 ? "bg-rose-500/20" : 'bg-indigo-500/20'
                  }`} />
                  <div className="h-24 w-24 relative bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center ring-4 ring-slate-900 shadow-2xl overflow-hidden">
                    {/* Visual voice waves */}
                    <div className="absolute bottom-0 w-full flex items-end justify-center gap-1 h-8 px-4 opacity-50">
                       <motion.div animate={{ height: ['20%', '80%', '40%'] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-1.5 bg-white rounded-t-full" />
                       <motion.div animate={{ height: ['40%', '100%', '30%'] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-1.5 bg-white rounded-t-full" />
                       <motion.div animate={{ height: ['30%', '70%', '50%'] }} transition={{ repeat: Infinity, duration: 0.9 }} className="w-1.5 bg-white rounded-t-full" />
                       <motion.div animate={{ height: ['60%', '40%', '90%'] }} transition={{ repeat: Infinity, duration: 0.7 }} className="w-1.5 bg-white rounded-t-full" />
                    </div>
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-semibold text-foreground leading-relaxed text-balance">
                    &laquo;{currentQuestion.text}&raquo;
                  </h2>
                </div>
              </div>

              {/* Input Area */}
              <div className="relative">
                <textarea
                  value={answerForCurrent}
                  onChange={(event) =>
                    setAnswers((prev) => ({
                      ...prev,
                      [currentQuestion.id]: event.target.value,
                    }))
                  }
                  className={`textarea-base min-h-[160px] p-5 text-base border-2 ${
                    isRecording ? "border-rose-500 bg-rose-500/5 shadow-[0_0_15px_rgba(244,63,94,0.1)]" : "focus:border-indigo-500/50"
                  }`}
                  placeholder="Напишите ответ или нажмите на микрофон для записи..."
                />

                {/* Fake Mic UI */}
                <div className="absolute bottom-5 right-5 flex items-center gap-3">
                  {isRecording && (
                    <span className="text-xs text-rose-400 font-medium animate-pulse flex items-center gap-1.5 bg-background px-3 py-1.5 rounded-full border border-rose-500/20">
                      <span className="h-2 w-2 rounded-full bg-rose-500" /> Запись...
                    </span>
                  )}
                  <button
                    onClick={isRecording ? stopRecording : startRecording}
                    disabled={isSimulating && isRecording}
                    className={`p-3 rounded-full transition-all shadow-lg ${
                      isRecording
                        ? "bg-rose-500 text-primary-foreground hover:bg-rose-600 scale-110"
                        : "bg-surface text-muted-foreground border border-border hover:text-foreground hover:bg-muted"
                    } disabled:opacity-50`}
                  >
                    {isRecording ? <StopCircle className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex sm:items-center sm:justify-between pt-4">
                <div className="text-xs text-muted-foreground opacity-70 max-w-[50%] hidden sm:block">
                  Ваш ответ должен включать: {currentQuestion.expectedFocus}
                </div>

                <div className="flex gap-3 justify-end w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => {
                        stopRecording();
                        setTimeLeft(TIMER_SECONDS);
                        setCurrentIndex((prev) => Math.max(prev - 1, 0));
                      }}
                      disabled={currentIndex === 0 || isLoading}
                      className="btn-secondary disabled:opacity-50"
                    >
                      Назад
                    </button>

                    {!isLast ? (
                      <button
                        type="button"
                        onClick={() => {
                          stopRecording();
                          setTimeLeft(TIMER_SECONDS);
                          setCurrentIndex((prev) => Math.min(prev + 1, questions.length - 1));
                        }}
                        disabled={!canGoNext || isLoading}
                        className="btn-primary inline-flex items-center justify-center gap-2 disabled:opacity-50 min-w-[120px]"
                      >
                        Далее
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={finishInterview}
                        disabled={!canGoNext || isLoading}
                        className="btn-success-base focus-ring inline-flex min-w-[140px] items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold disabled:opacity-50"
                      >
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                        Завершить
                      </button>
                    )}
                </div>
              </div>

            </div>
          </motion.div>
        )}

        {evaluation && (
          <motion.div
            key="interview-evaluation"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mx-auto max-w-5xl space-y-6"
          >
            <div className="surface-elevated border-indigo-500/30 bg-indigo-500/5 p-8 sm:p-12 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-400 to-purple-400" />

              <div className="text-center mb-10">
                 <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-indigo-500/10 text-indigo-400 mb-6 border-4 border-indigo-500/20">
                    <span className="metric-value text-indigo-500 dark:text-indigo-300">{evaluation.score}</span><span className="text-sm mt-2">/10</span>
                 </div>
                 <h2 className="page-title text-foreground">Результаты Собеседования</h2>
                 <p className="chip-neutral inline-flex items-center gap-2 px-4 py-1.5 mt-4 text-sm font-semibold">
                    Ваш оцененный уровень: {evaluation.level}
                 </p>
                 <p className="text-base text-muted-foreground max-w-2xl mx-auto mt-6 leading-relaxed">
                   {evaluation.summary}
                 </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 shadow-sm">
                  <p className="text-xs uppercase font-bold tracking-widest text-emerald-400 mb-4 flex items-center gap-2">
                    <Sparkles className="h-4 w-4" /> Сильные стороны
                  </p>
                  <ul className="list-disc space-y-2 pl-4 text-sm text-foreground">
                    {evaluation.strengths.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-5 shadow-sm">
                  <p className="text-xs uppercase font-bold tracking-widest text-rose-400 mb-4 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" /> Зоны роста
                  </p>
                  <ul className="list-disc space-y-2 pl-4 text-sm text-foreground">
                    {evaluation.weaknesses.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-2xl border border-indigo-500/30 bg-indigo-500/10 p-5 shadow-sm lg:col-span-1 md:col-span-2">
                  <p className="text-xs uppercase font-bold tracking-widest text-indigo-400 mb-4 flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4" /> Что подтянуть
                  </p>
                  <ul className="list-disc space-y-2 pl-4 text-sm text-foreground">
                    {evaluation.recommendations.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Bonus Gamification Block */}
              <div className="surface-elevated p-6 bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20 text-center mb-8 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                 <div className="text-left">
                    <h3 className="text-lg font-bold text-amber-500">Симуляция завершена!</h3>
                    <p className="text-sm text-amber-500/80">Вы отлично потренировались. Заработанные +150 XP добавлены в профиль.</p>
                 </div>
                 <button
                    type="button"
                    onClick={() => startInterview(track)}
                    disabled={isLoading}
                    className="btn-primary w-full sm:w-auto shadow-md"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" /> Пройти еще раз
                 </button>
              </div>

              <div className="pt-6 border-t border-border/50">
                 <p className="text-sm font-semibold text-foreground mb-4">Рекомендуемый план действий:</p>
                 <div className="flex flex-wrap gap-2">
                    {interviewNextSteps(evaluation.score, track).map((item) => (
                      <span key={item} className="px-3 py-1.5 rounded-lg border border-border bg-card text-xs text-muted-foreground">{item}</span>
                    ))}
                 </div>
              </div>

              <div className="mt-6 grid gap-3 border-t border-border/50 pt-6 md:grid-cols-3">
                <Link href="/review" className="btn-secondary inline-flex items-center justify-center gap-2 rounded-lg">
                  <Target className="h-4 w-4" />
                  Повторить слабые темы
                </Link>
                <Link href="/portfolio" className="btn-secondary inline-flex items-center justify-center gap-2 rounded-lg">
                  <ClipboardCheck className="h-4 w-4" />
                  Обновить аргументы
                </Link>
                <Link href="/jobs" className="btn-primary inline-flex items-center justify-center gap-2 rounded-lg">
                  Перейти к вакансиям
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {errorText && (
        <div className="p-4 rounded-xl border border-rose-500/35 bg-rose-500/10 text-rose-600 dark:text-rose-400 text-sm flex items-center gap-2 max-w-2xl mx-auto">
          <AlertTriangle className="h-4 w-4" /> {errorText}
        </div>
      )}
    </section>
  );

  function loadingView(show: boolean) {
    if (!show) return null;
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
        <p className="text-sm text-muted-foreground">Подключение к ИИ-ментору...</p>
      </div>
    );
  }
}
