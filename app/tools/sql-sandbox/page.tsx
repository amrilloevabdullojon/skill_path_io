"use client";

import { useState } from "react";
import { Play, Database, TableIcon, DatabaseZap, Clock, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";

type SqlCell = string | number | boolean | null;

const MOCK_SCHEMAS = {
  users: [
    { name: "id", type: "integer", pk: true },
    { name: "name", type: "varchar" },
    { name: "email", type: "varchar" },
    { name: "role", type: "varchar" },
  ],
  orders: [
    { name: "id", type: "integer", pk: true },
    { name: "user_id", type: "integer" },
    { name: "total", type: "decimal" },
    { name: "status", type: "varchar" },
  ],
};

const MOCK_DATA = {
  users: [
    { id: 1, name: "Ivan Ivanov", email: "ivan@example.com", role: "QA Engineer" },
    { id: 2, name: "Anna Smirnova", email: "anna@example.com", role: "Business Analyst" },
    { id: 3, name: "Petr Petrovskiy", email: "petr@example.com", role: "Developer" },
  ],
  orders: [
    { id: 101, user_id: 1, total: 154.50, status: "completed" },
    { id: 102, user_id: 2, total: 99.00, status: "pending" },
    { id: 103, user_id: 1, total: 25.00, status: "completed" },
  ]
};

export default function SqlSandboxPage() {
  const [query, setQuery] = useState("SELECT * FROM users;\n-- Try writing a query here\n");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ columns: string[]; rows: SqlCell[][]; time: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRun = () => {
    setIsLoading(true);
    setResult(null);
    setError(null);
    
    setTimeout(() => {
      const q = query.toLowerCase();
      const timeMs = Math.round(50 + Math.random() * 150);

      if (q.includes("drop") || q.includes("delete") || q.includes("update") || q.includes("insert")) {
        setError("Read-only mode. Only SELECT queries are allowed.");
      } else if (q.includes("users") && q.includes("select")) {
        setResult({
          columns: ["id", "name", "email", "role"],
          rows: MOCK_DATA.users.map(u => [u.id, u.name, u.email, u.role]),
          time: timeMs
        });
      } else if (q.includes("orders") && q.includes("select")) {
        setResult({
          columns: ["id", "user_id", "total", "status"],
          rows: MOCK_DATA.orders.map(o => [o.id, o.user_id, o.total, o.status]),
          time: timeMs
        });
      } else {
        setError('Syntax error or table not found. Try "SELECT * FROM users"');
      }
      setIsLoading(false);
    }, 400 + Math.random() * 300);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pt-6 h-[calc(100vh-100px)] flex flex-col">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="page-title text-foreground inline-flex items-center gap-2">
            <span className="p-2 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20 shadow-[0_0_15px_rgba(139,92,246,0.1)]">
              <DatabaseZap className="h-5 w-5" />
            </span>
            SQL Sandbox
          </h1>
          <p className="text-sm text-foreground/60 mt-1">
            Практикуйтесь в написании SQL запросов. База данных содержит таблицы: `users` и `orders`.
          </p>
        </div>
      </div>

      <div className="flex gap-6 flex-1 min-h-0">
        {/* SIDEBAR: SCHEMAS */}
        <div className="w-64 shrink-0 overflow-y-auto space-y-4 pr-2">
          <div className="surface-elevated border border-border/50 bg-card rounded-2xl p-4 shadow-sm">
            <h3 className="text-[10px] font-bold text-foreground/50 uppercase tracking-widest flex items-center gap-1.5 mb-4">
              <Database className="h-3.5 w-3.5 text-violet-400" />
              Схема БД (Mock)
            </h3>
            
            <div className="space-y-4">
              {Object.entries(MOCK_SCHEMAS).map(([tableName, columns]) => (
                <div key={tableName}>
                  <div className="flex items-center gap-2 px-2 py-1.5 bg-background/50 border border-border/50 rounded-lg mb-2">
                    <TableIcon className="h-4 w-4 text-sky-400" />
                    <span className="text-sm font-semibold text-foreground/90">{tableName}</span>
                  </div>
                  <div className="space-y-1 pl-4">
                    {columns.map(c => (
                      <div key={c.name} className="flex justify-between items-center text-xs">
                        <span className={`font-mono ${c.pk ? "text-amber-400 font-bold" : "text-foreground/70"}`}>
                          {c.name} {c.pk && "*"}
                        </span>
                        <span className="text-foreground/40 text-[10px] uppercase font-bold">{c.type}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* EDITOR AND RESULTS */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          {/* EDITOR */}
          <div className="surface-elevated border border-border/50 bg-card rounded-2xl overflow-hidden shadow-sm flex flex-col h-[250px] shrink-0">
            <div className="flex items-center justify-between border-b border-border/50 bg-background/30 px-4 py-3">
              <div className="flex items-center gap-2 text-xs font-bold text-foreground/50 uppercase tracking-widest">
                <Layers className="h-3.5 w-3.5 text-violet-400" />
                Query Editor
              </div>
              <Button onClick={handleRun} disabled={isLoading} className="bg-violet-500 hover:bg-violet-400 text-primary-foreground rounded-lg h-8 px-4 font-bold tracking-wide shadow-[0_0_15px_rgba(139,92,246,0.3)]">
                {isLoading ? <Clock className="h-4 w-4 animate-spin" /> : <><Play className="h-3.5 w-3.5 mr-1.5" /> RUN</>}
              </Button>
            </div>
            <textarea 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 w-full bg-[#1e1e2e]/90 p-4 font-mono text-sm text-emerald-300 outline-none resize-none selection:bg-violet-500/30"
              spellCheck={false}
            />
          </div>

          {/* RESULTS */}
          <div className="surface-elevated border border-border/50 bg-card rounded-2xl overflow-hidden shadow-sm flex flex-col flex-1 min-h-0">
             <div className="flex border-b border-border/50 bg-background/40 px-4 py-3 items-center min-h-[57px]">
                <p className="text-xs font-bold text-foreground/50 uppercase tracking-widest mr-auto">Результаты</p>
                {result && (
                  <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-bold border border-violet-500/20 bg-violet-500/10 text-violet-400">
                    <Clock className="h-3 w-3" />
                    {result.time} ms
                  </span>
                )}
             </div>

             <div className="flex-1 overflow-auto bg-background/20">
               {isLoading ? (
                  <div className="flex items-center justify-center h-full text-violet-400/50">
                    <Clock className="h-6 w-6 animate-spin" />
                  </div>
               ) : error ? (
                 <div className="p-4 text-sm text-rose-400 font-mono">
                   {error}
                 </div>
               ) : result ? (
                 <table className="w-full text-sm text-left">
                   <thead className="bg-[#1e1e2e]/50 text-xs uppercase font-bold text-foreground/50 sticky top-0 border-b border-border/50">
                     <tr>
                       {result.columns.map(c => (
                         <th key={c} className="px-4 py-3 font-mono">{c}</th>
                       ))}
                     </tr>
                   </thead>
                   <tbody>
                     {result.rows.map((row, i) => (
                       <tr key={i} className="border-b border-border/20 hover:bg-background/40 transition-colors">
                         {row.map((cell, j) => (
                           <td key={j} className="px-4 py-2 font-mono text-foreground/80">{String(cell)}</td>
                         ))}
                       </tr>
                     ))}
                     {result.rows.length === 0 && (
                       <tr>
                         <td colSpan={result.columns.length} className="px-4 py-8 text-center text-foreground/40 font-mono">
                           0 rows returned
                         </td>
                       </tr>
                     )}
                   </tbody>
                 </table>
               ) : (
                 <div className="flex flex-col items-center justify-center h-full text-foreground/20 gap-3">
                    <TableIcon className="h-12 w-12 opacity-20" />
                    <p className="text-sm font-semibold tracking-wide">Запустите запрос, чтобы увидеть результаты</p>
                 </div>
               )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
