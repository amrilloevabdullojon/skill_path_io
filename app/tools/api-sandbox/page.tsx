"use client";

import { useState } from "react";
import { Play, Activity, Clock, Database, Globe, Network } from "lucide-react";
import { Button } from "@/components/ui/button";

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

const MOCK_ENDPOINTS: Record<string, { status: number, body: JsonValue }> = {
  "GET https://api.skillpath.io/v1/users": {
    status: 200,
    body: [
      { id: 1, name: "Ivan Ivanov", email: "ivan@example.com", role: "QA Engineer" },
      { id: 2, name: "Anna Smirnova", email: "anna@example.com", role: "Business Analyst" }
    ]
  },
  "GET https://api.skillpath.io/v1/users/1": {
    status: 200,
    body: { id: 1, name: "Ivan Ivanov", email: "ivan@example.com", role: "QA Engineer" }
  },
  "POST https://api.skillpath.io/v1/login": {
    status: 200,
    body: { token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", expires_in: 3600 }
  },
};

export default function ApiSandboxPage() {
  const [method, setMethod] = useState("GET");
  const [url, setUrl] = useState("https://api.skillpath.io/v1/users");
  const [activeTab, setActiveTab] = useState<"params" | "headers" | "body">("headers");
  
  const [headers, setHeaders] = useState([{ key: "Content-Type", value: "application/json" }]);
  const [body, setBody] = useState("{\n  \n}");

  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<{ status: number, time: number, size: number, data: string } | null>(null);

  const handleAddHeader = () => setHeaders([...headers, { key: "", value: "" }]);
  const handleUpdateHeader = (index: number, key: string, value: string) => {
    const newH = [...headers];
    newH[index] = { key, value };
    setHeaders(newH);
  };
  const handleRemoveHeader = (index: number) => setHeaders(headers.filter((_, i) => i !== index));

  const handleSend = () => {
    setIsLoading(true);
    setResponse(null);
    
    // Simulate network delay
    const start = performance.now();
    setTimeout(() => {
      const mockKey = `${method} ${url}`;
      const res = MOCK_ENDPOINTS[mockKey];
      
      const timeMs = Math.round(performance.now() - start);
      
      if (res) {
        setResponse({
          status: res.status,
          time: timeMs,
          size: JSON.stringify(res.body).length,
          data: JSON.stringify(res.body, null, 2),
        });
      } else {
        setResponse({
          status: 404,
          time: timeMs,
          size: 45,
          data: JSON.stringify({ error: "Endpoint not found in mock server" }, null, 2),
        });
      }
      setIsLoading(false);
    }, 600 + Math.random() * 400); // 600-1000ms fake delay
  };

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    if (status >= 400 && status < 500) return "text-amber-400 bg-amber-500/10 border-amber-500/20";
    return "text-rose-400 bg-rose-500/10 border-rose-500/20";
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pt-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground inline-flex items-center gap-2">
            <span className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 shadow-[0_0_15px_rgba(56,189,248,0.1)]">
              <Network className="h-5 w-5" />
            </span>
            API Sandbox
          </h1>
          <p className="text-sm text-foreground/60 mt-1">
            Моделируйте REST запросы для отработки навыков тестирования API. Используйте `https://api.skillpath.io/v1/users`.
          </p>
        </div>
        <div className="flex gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
            <Activity className="h-3.5 w-3.5" />
            Live Mock Server
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* REQUEST SECTION */}
        <div className="space-y-4">
          <div className="surface-elevated border border-border/50 bg-card/40 backdrop-blur-md rounded-2xl overflow-hidden shadow-sm">
            <div className="flex border-b border-border/50 bg-background/30 px-3 py-3 gap-2">
              <select 
                className="bg-transparent text-sm font-bold w-[90px] outline-none text-sky-400"
                value={method}
                onChange={(e) => setMethod(e.target.value)}
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </select>
              <div className="h-6 w-px bg-border/50 my-auto" />
              <input 
                type="text" 
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://api.example.com/v1/resource"
                className="flex-1 bg-transparent text-sm outline-none text-foreground"
              />
              <Button onClick={handleSend} disabled={isLoading} className="bg-sky-500 hover:bg-sky-400 text-white rounded-lg h-8 px-4 font-bold tracking-wide shadow-[0_0_15px_rgba(56,189,248,0.3)]">
                {isLoading ? <Activity className="h-4 w-4 animate-spin" /> : <><Play className="h-3.5 w-3.5 mr-1.5" /> SEND</>}
              </Button>
            </div>

            <div className="flex border-b border-border/50 text-xs font-semibold uppercase tracking-wider text-foreground/50">
              <button 
                className={`flex-1 py-3 border-b-2 transition-colors ${activeTab === "params" ? "border-sky-400 text-sky-400" : "border-transparent hover:text-foreground/80"}`}
                onClick={() => setActiveTab("params")}
              >
                Params
              </button>
              <button 
                className={`flex-1 py-3 border-b-2 transition-colors ${activeTab === "headers" ? "border-sky-400 text-sky-400" : "border-transparent hover:text-foreground/80"}`}
                onClick={() => setActiveTab("headers")}
              >
                Headers
              </button>
              <button 
                className={`flex-1 py-3 border-b-2 transition-colors ${activeTab === "body" ? "border-sky-400 text-sky-400" : "border-transparent hover:text-foreground/80"}`}
                onClick={() => setActiveTab("body")}
              >
                Body
              </button>
            </div>

            <div className="p-4 bg-background/20 min-h-[300px]">
              {activeTab === "headers" && (
                <div className="space-y-2">
                  {headers.map((h, i) => (
                    <div key={i} className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="Key" 
                        value={h.key}
                        onChange={(e) => handleUpdateHeader(i, e.target.value, h.value)}
                        className="flex-1 bg-background/40 border border-border/50 rounded-md px-3 py-1.5 text-sm outline-none focus:border-sky-500/50"
                      />
                      <input 
                        type="text" 
                        placeholder="Value" 
                        value={h.value}
                        onChange={(e) => handleUpdateHeader(i, h.key, e.target.value)}
                        className="flex-1 bg-background/40 border border-border/50 rounded-md px-3 py-1.5 text-sm outline-none focus:border-sky-500/50"
                      />
                      <button onClick={() => handleRemoveHeader(i)} className="text-foreground/40 hover:text-rose-400 p-2">✕</button>
                    </div>
                  ))}
                  <button onClick={handleAddHeader} className="text-xs font-semibold text-sky-400 mt-2 hover:text-sky-300 px-1">+ Add Header</button>
                </div>
              )}
              {activeTab === "body" && (
                <textarea 
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="w-full h-[250px] bg-background/40 border border-border/50 rounded-lg p-4 font-mono text-sm text-foreground outline-none resize-none focus:border-sky-500/50 transition-colors"
                  spellCheck={false}
                />
              )}
              {activeTab === "params" && (
                <div className="text-sm text-foreground/50 py-4 text-center">
                  Query parameters go here. (For demo purposes, append to URL).
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RESPONSE SECTION */}
        <div className="space-y-4">
          <div className="surface-elevated border border-border/50 bg-card/40 backdrop-blur-md rounded-2xl overflow-hidden shadow-sm h-full flex flex-col">
            <div className="flex border-b border-border/50 bg-background/40 px-4 py-3 gap-4 items-center min-h-[57px]">
              <p className="text-xs font-bold text-foreground/50 uppercase tracking-widest mr-auto">Response</p>
              
              {response && (
                <>
                  <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-bold border ${getStatusColor(response.status)}`}>
                    Status: {response.status}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-bold border border-slate-500/20 bg-slate-500/10 text-slate-400">
                    <Clock className="h-3 w-3" />
                    {response.time} ms
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-bold border border-slate-500/20 bg-slate-500/10 text-slate-400">
                    <Database className="h-3 w-3" />
                    {response.size} B
                  </span>
                </>
              )}
            </div>

            <div className="flex-1 bg-[#1e1e2e] p-4 font-mono text-sm overflow-auto text-sky-200">
              {isLoading ? (
                <div className="flex items-center justify-center h-full text-sky-400/50">
                  <Activity className="h-6 w-6 animate-spin" />
                </div>
              ) : response ? (
                <pre className="whitespace-pre-wrap">{response.data}</pre>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-foreground/20 gap-3">
                  <Globe className="h-12 w-12 opacity-20" />
                  <p className="text-sm font-semibold tracking-wide">Ready to send request</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
