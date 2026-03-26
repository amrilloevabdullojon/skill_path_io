"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { Play, RotateCcw } from "lucide-react";

import { SQL_SANDBOX_TABLES, executeLocalSql } from "@/features/simulations/sql-sandbox";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="content-card h-[260px] p-4 text-sm text-muted-foreground">
      Loading editor...
    </div>
  ),
});

const STARTER_QUERY = "SELECT id, name, role FROM users LIMIT 3;";

export function SqlSandboxPanel() {
  const [query, setQuery] = useState(STARTER_QUERY);
  const [resultMessage, setResultMessage] = useState<string>("Run query to view results.");
  const [columns, setColumns] = useState<string[]>([]);
  const [rows, setRows] = useState<Array<Record<string, string | number | null>>>([]);

  const sampleTables = useMemo(() => SQL_SANDBOX_TABLES, []);

  function runQuery() {
    const output = executeLocalSql(query);
    setResultMessage(output.message);
    setColumns(output.columns);
    setRows(output.rows);
  }

  function resetQuery() {
    setQuery(STARTER_QUERY);
    setResultMessage("Query reset.");
    setColumns([]);
    setRows([]);
  }

  return (
    <section className="surface-elevated space-y-5 p-5 sm:p-6">
      <header className="space-y-2">
        <p className="kicker">SQL Sandbox</p>
        <h1 className="text-2xl font-semibold text-foreground">Interactive SQL editor</h1>
        <p className="text-sm text-muted-foreground">
          Local parser supports basic `SELECT ... FROM ... WHERE ... LIMIT ...` for practice.
        </p>
      </header>

      <div className="surface-subtle p-3">
        <MonacoEditor
          height="260px"
          defaultLanguage="sql"
          theme="vs-dark"
          value={query}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            roundedSelection: true,
            scrollBeyondLastLine: false,
            wordWrap: "on",
          }}
          onChange={(value) => setQuery(value ?? "")}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={runQuery}
          className="btn-primary inline-flex items-center gap-2"
        >
          <Play className="h-4 w-4" />
          Run query
        </button>
        <button
          type="button"
          onClick={resetQuery}
          className="btn-secondary inline-flex items-center gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Reset
        </button>
        <p className="text-xs text-muted-foreground">{resultMessage}</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="surface-subtle p-4">
          <h2 className="text-sm font-semibold text-foreground">Sample tables</h2>
          <div className="mt-2 space-y-2 text-xs text-muted-foreground">
            {sampleTables.map((table) => (
              <div key={table.name} className="content-card p-2">
                <p className="font-medium text-foreground">{table.name}</p>
                <p>{table.columns.join(", ")}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="surface-subtle p-4">
          <h2 className="text-sm font-semibold text-foreground">Result table</h2>
          <div className="mt-2 overflow-x-auto rounded-xl border border-border">
            <table className="min-w-full text-xs">
              <thead className="bg-card text-muted-foreground">
                <tr>
                  {columns.map((column) => (
                    <th key={column} className="px-2 py-2 text-left font-medium">
                      {column}
                    </th>
                  ))}
                  {columns.length === 0 && (
                    <th className="px-2 py-2 text-left font-medium text-muted-foreground">No columns yet</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, rowIndex) => (
                  <tr key={`${rowIndex}-${columns.join("-")}`} className="border-t border-border">
                    {columns.map((column) => (
                      <td key={`${rowIndex}-${column}`} className="px-2 py-2 text-muted-foreground">
                        {String(row[column] ?? "null")}
                      </td>
                    ))}
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td className="px-2 py-6 text-center text-muted-foreground" colSpan={Math.max(columns.length, 1)}>
                      Run a query to see rows.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </section>
  );
}
