"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "framer-motion";
import {
  Scan, TrendingUp, Sparkles,
  Search, ShieldAlert, Zap, LayoutDashboard, ArrowRight
} from "lucide-react";
import { RoleGuard } from "@/components/auth/role-guard";

// --- ANIMATED COUNTERS ---
function AnimatedNumber({ value, prefix = "", suffix = "", duration = 2 }: { value: number, prefix?: string, suffix?: string, duration?: number }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  
  useEffect(() => {
    const controls = animate(count, value, { duration, ease: "easeOut" });
    return controls.stop;
  }, [value, count, duration]);

  return <motion.span>{prefix}<motion.span>{rounded}</motion.span>{suffix}</motion.span>;
}

const DEFAULT_RESUME = `Александр Иванов
Middle QA Engineer
Опыт работы: 2.5 года
Инструменты: Postman, JMeter, Selenium WebDriver, Jira, SQL, Python

Опыт работы:
- Разработка тест-кейсов и чек-листов (300+ шт).
- Участие во внедрении автотестов (снизил время регресса на 20%).
- Проведение функционального, интеграционного тестирования.
- Составление баг-репортов.

Образование:
Бакалавриат МГТУ, Факультет информатики.

Ключевые навыки: Анализ требований, Жизненный цикл ПО, Ручное тестирование REST API.`;

export default function ResumeScannerPage() {
  const [resumeText, setResumeText] = useState(DEFAULT_RESUME);
  const [scanProgress, setScanProgress] = useState(0); // 0 to 100
  const [scanStep, setScanStep] = useState<"IDLE" | "SCANNING" | "ANALYZING" | "DONE">("IDLE");

  type ScanResult = {
    atsScore: number;
    marketValue: number;
    potentialValue: number;
    missingSkills: string[];
    roast: string;
    keywords: string[];
  };
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);

  // Fake logs during scan
  const [logs, setLogs] = useState<string[]>([]);
  
  const startScan = async () => {
    if (!resumeText.trim()) return;
    setScanStep("SCANNING");
    setLogs([]);
    setScanProgress(0);

    // Simulate scanning progress visually while waiting for API
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 5 + 2;
      
      if (progress > 30 && progress < 40) {
        setLogs(prev => [...prev, "Извлечение ключевых навыков (NER)..."]);
      } else if (progress > 50 && progress < 60) {
        setLogs(prev => [...prev, "Отправка запроса в Gemini AI..."]);
        setScanStep("ANALYZING");
      } else if (progress > 80 && progress < 90) {
        setLogs(prev => [...prev, "Сверка с текущим рынком труда 2026 года..."]);
      }

      if (progress < 95) {
        setScanProgress(progress);
      }
    }, 150);

    try {
      const res = await fetch("/api/public/resume-scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText }),
      });
      const data = await res.json();
      
      clearInterval(interval);
      
      if (res.ok) {
        setScanResult(data);
      } else {
        setLogs(prev => [...prev, "Ошибка: " + data.error]);
        // Fallback fake data if rate limited or something fails
        setScanResult({
          atsScore: 42,
          marketValue: 130,
          potentialValue: 210,
          missingSkills: ["ОШИБКА СЕРВЕРА", "API Limit"],
          roast: "Системная ошибка. Демо-заглушка.",
          keywords: ["QA", "SQL", "Python"]
        });
      }
      
      setScanProgress(100);
      setTimeout(() => setScanStep("DONE"), 600);

    } catch (e) {
      clearInterval(interval);
      console.error(e);
      setScanProgress(100);
      setTimeout(() => setScanStep("DONE"), 600);
    }
  };

  const getHighlightWords = (text: string) => {
    // Randomly highlight keywords differently if scanning
    const highlights = scanResult?.keywords || ["Postman", "JMeter", "Selenium", "SQL", "Python", "API", "автотест", "регресс", "Middle"];
    
    // We split words to wrap them in spans
    const words = text.split(/(\s+)/);
    return words.map((word, i) => {
      const isKeyword = highlights.some(hw => word.toLowerCase().includes(hw.toLowerCase()));
      if (isKeyword) {
        return (
          <motion.span 
            key={i} 
            className="text-emerald-500 dark:text-emerald-400 font-bold bg-emerald-500/10 px-1 rounded inline-block"
            initial={scanStep !== "IDLE" ? { opacity: 0.5, y: 5 } : {}}
            animate={scanStep !== "IDLE" ? { 
              opacity: [0.5, 1, 0.8], 
              y: 0,
              boxShadow: ["0 0 0px rgba(16, 185, 129, 0)", "0 0 10px rgba(16, 185, 129, 0.8)", "0 0 0px rgba(16, 185, 129, 0)"]
            } : {}}
            transition={{ duration: 1.5, repeat: scanStep === "SCANNING" ? Infinity : 0, delay: Math.random() * 2 }}
          >
            {word}
          </motion.span>
        );
      }
      return <span key={i}>{word}</span>;
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-sky-500/30 overflow-x-hidden relative font-sans">
      
      {/* Background Orbs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-indigo-600/10 blur-[150px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-emerald-600/5 blur-[150px]" />
        <div className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[50vw] h-[20vw] rounded-full bg-sky-500/5 blur-[100px]" />
      </div>

      <header className="relative z-10 border-b border-border bg-background/80 backdrop-blur-md p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-foreground text-lg group">
            <span className="h-8 w-8 rounded-lg bg-sky-500/10 border border-sky-400/30 flex items-center justify-center text-sky-500 dark:text-sky-400 group-hover:bg-sky-500/20 transition-colors">
              <Scan className="h-4 w-4" />
            </span>
            Levio AI <span className="text-muted-foreground font-normal">| X-Ray</span>
          </Link>
          <Link href="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
            <LayoutDashboard className="h-4 w-4" /> Дашборд
          </Link>
        </div>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto p-4 py-8 sm:py-16">
        
        {/* Header Titles */}
        <div className="text-center mb-12 space-y-4">
          <motion.div 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2"
          >
            <Sparkles className="h-3.5 w-3.5" /> Экспериментальный ИИ
          </motion.div>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-foreground drop-shadow-sm">
            Рентген <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-emerald-500">Резюме</span>
          </h1>
          <p className="max-w-2xl mx-auto text-muted-foreground text-lg">
            Вставьте ваше CV и посмотрите на него глазами безжалостных корпоративных ATS-систем. Узнайте свою реальную рыночную стоимость за 5 секунд.
          </p>
        </div>

        <RoleGuard 
          allowedRoles={["PRO_STUDENT", "MENTOR", "RECRUITER", "ADMIN"]} 
          fallbackMessage="Рентген Резюме (AI генерация) потребляет значительные вычислительные ресурсы."
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT: Input / Scanning Area */}
          <div className="lg:col-span-7 space-y-4 relative">
            <div className={`relative bg-card rounded-2xl border ${scanStep !== "IDLE" ? "border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.1)]" : "border-border"} overflow-hidden transition-all duration-700`}>
              
              {/* LASER SCANNER EFFECT */}
              {scanStep !== "IDLE" && scanStep !== "DONE" && (
                <motion.div 
                  className="absolute left-0 right-0 h-48 bg-gradient-to-b from-transparent via-emerald-500/10 to-emerald-500/30 z-10 pointer-events-none border-b-2 border-emerald-500"
                  initial={{ top: "-200px" }}
                  animate={{ top: "100%" }}
                  transition={{ 
                    duration: 2.5, 
                    ease: "linear", 
                    repeat: Infinity 
                  }}
                />
              )}

              {/* OVERLAY TINT COMPLETED */}
              {scanStep === "DONE" && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 bg-gradient-to-b from-sky-500/5 to-emerald-500/5 z-0 pointer-events-none"
                />
              )}

              {scanStep !== "IDLE" ? (
                <div className="p-6 sm:p-8 font-mono text-sm leading-relaxed text-foreground relative z-10 whitespace-pre-wrap min-h-[400px]">
                  {getHighlightWords(resumeText)}
                </div>
              ) : (
                <textarea
                  id="resume-input"
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  className="w-full min-h-[400px] bg-transparent p-6 sm:p-8 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none resize-none font-mono"
                  placeholder="Paste your CV here..."
                />
              )}
              
            </div>

            {scanStep === "IDLE" && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-end pt-2">
                <button 
                  onClick={startScan}
                  className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 text-white font-bold shadow-[0_0_20px_rgba(14,165,233,0.4)] hover:scale-105 transition-transform flex items-center gap-2"
                >
                  <Scan className="h-5 w-5" />
                  Запустить AI Сканирование
                </button>
              </motion.div>
            )}

            {/* Scanning Progress Bar */}
            <AnimatePresence>
              {(scanStep === "SCANNING" || scanStep === "ANALYZING") && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-card border border-border rounded-xl p-4 flex flex-col gap-3"
                >
                  <div className="flex justify-between text-xs font-mono text-emerald-600 dark:text-emerald-400">
                    <span>{scanStep === "SCANNING" ? "ИЗВЛЕЧЕНИЕ СУЩНОСТЕЙ" : "КОРРЕЛЯЦИЯ С РЫНКОМ"}</span>
                    <span>{Math.round(scanProgress)}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-emerald-500"
                      initial={{ width: "0%" }}
                      animate={{ width: `${scanProgress}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-muted-foreground font-mono h-4 overflow-hidden">
                    <AnimatePresence mode="popLayout">
                      {logs.map((log, idx) => (
                        <motion.div 
                          key={log + idx} 
                          initial={{ opacity: 0, x: -10 }} 
                          animate={{ opacity: 1, x: 0 }} 
                          exit={{ opacity: 0 }}
                          className="truncate"
                        >
                          {">"} {log}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* RIGHT: Results / Analysis Dashboard */}
          <div className="lg:col-span-5 h-full">
            <AnimatePresence mode="wait">
              {scanStep !== "DONE" ? (
                <motion.div 
                  key="placeholder"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="h-full min-h-[500px] rounded-2xl border border-border/50 bg-card/50 flex flex-col items-center justify-center p-8 text-center"
                >
                  <Search className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-foreground font-medium pb-2 text-sm">Панель Аналитики</p>
                  <p className="text-muted-foreground text-xs">Запустите сканирование, чтобы увидеть полный разбор вашего профиля матрицей ИИ.</p>
                </motion.div>
              ) : (
                <motion.div 
                  key="results"
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  {/* Score Card */}
                  <div className="rounded-2xl border border-sky-500/20 bg-gradient-to-br from-sky-500/10 to-indigo-500/5 p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 blur-[50px] rounded-full" />
                    
                    <p className="text-sky-600 dark:text-sky-400 text-xs font-bold uppercase tracking-widest mb-1 flex items-center gap-1.5">
                      <Zap className="h-3 w-3" /> ATS Score
                    </p>
                    <div className="flex items-end gap-3 mt-2">
                      <span className="text-6xl font-black text-foreground leading-none tracking-tight">
                        <AnimatedNumber value={scanResult?.atsScore || 42} />
                      </span>
                      <span className="text-muted-foreground text-sm pb-1.5">/ 100</span>
                    </div>
                    
                    <div className="mt-6 flex bg-muted rounded-lg p-1 relative border border-border">
                      <motion.div 
                        initial={{ width: 0 }} animate={{ width: `${scanResult?.atsScore || 42}%` }} transition={{ delay: 0.5, duration: 1, ease: "easeOut" }}
                        className="h-1.5 rounded-full bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-500"
                      />
                    </div>
                    <p className="mt-3 text-sm text-foreground leading-snug">Ваше резюме отбросят <span className="text-rose-500 font-bold">{100 - (scanResult?.atsScore || 42)}%</span> автоматизированных систем найма из-за нехватки ключевых маркеров.</p>
                  </div>

                  {/* Salary Projection */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-2xl border border-border bg-card p-5">
                      <p className="text-muted-foreground text-[11px] font-bold uppercase tracking-wider mb-2">Оценка Рынка</p>
                      <p className="text-2xl font-bold text-foreground"><AnimatedNumber value={scanResult?.marketValue || 130} suffix="k" duration={1.5} /> <span className="text-base font-normal text-muted-foreground">₽</span></p>
                      <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">Ниже медианы QA на 15%</p>
                    </div>
                    <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 relative overflow-hidden">
                      <div className="absolute top-[-10px] right-[-10px] h-16 w-16 bg-emerald-500/20 blur-xl rounded-full" />
                      <p className="text-emerald-600 dark:text-emerald-400 text-[11px] font-bold uppercase tracking-wider mb-2">Потенциал с нами</p>
                      <p className="text-2xl font-bold text-foreground"><AnimatedNumber value={scanResult?.potentialValue || 210} suffix="k" duration={2} /> <span className="text-base font-normal text-muted-foreground">₽</span></p>
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1"><TrendingUp className="h-3 w-3" /> Уверенно до +{(scanResult?.potentialValue || 210) - (scanResult?.marketValue || 130)}k</p>
                    </div>
                  </div>

                  {/* Roast / Missing Skills */}
                  <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-6">
                    <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 mb-4">
                      <ShieldAlert className="h-5 w-5" />
                      <h3 className="font-bold">Критические пробелы</h3>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {(scanResult?.missingSkills || ["CI/CD (GitLab, Jenkins)", "Docker / Linux", "Мобилки (Appium)"]).map((skill, index) => (
                        <span key={index} className="px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">{skill}</span>
                      ))}
                    </div>
                    <p className="text-sm text-foreground mb-5 leading-relaxed">
                      {scanResult?.roast || "Указан старый стек, нет связки с CI/CD пайплайнами."}
                    </p>
                    <Link 
                      href="/tracks" 
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-foreground text-background px-4 py-3 text-sm font-bold shadow-md hover:opacity-90 transition-opacity"
                    >
                      Закрыть пробелы на Треке QA <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
        </RoleGuard>
      </main>
    </div>
  );
}
