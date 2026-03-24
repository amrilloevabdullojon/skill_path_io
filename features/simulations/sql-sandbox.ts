export type SqlRow = Record<string, string | number | null>;

export type SqlTable = {
  name: string;
  columns: string[];
  rows: SqlRow[];
};

export type SqlExecutionResult = {
  ok: boolean;
  message: string;
  columns: string[];
  rows: SqlRow[];
};

export const SQL_SANDBOX_TABLES: SqlTable[] = [
  {
    name: "users",
    columns: ["id", "name", "role", "country"],
    rows: [
      { id: 1, name: "Anna", role: "STUDENT", country: "UZ" },
      { id: 2, name: "Max", role: "STUDENT", country: "US" },
      { id: 3, name: "Ira", role: "ADMIN", country: "UZ" },
      { id: 4, name: "Sam", role: "STUDENT", country: "DE" },
    ],
  },
  {
    name: "progress",
    columns: ["id", "userId", "module", "score", "status"],
    rows: [
      { id: 1, userId: 1, module: "QA Fundamentals", score: 78, status: "COMPLETED" },
      { id: 2, userId: 2, module: "SQL for Analysts", score: 88, status: "COMPLETED" },
      { id: 3, userId: 1, module: "API Testing", score: 64, status: "IN_PROGRESS" },
      { id: 4, userId: 4, module: "Requirements Elicitation", score: 71, status: "COMPLETED" },
    ],
  },
];

function findTableByName(name: string) {
  const tableName = name.toLowerCase();
  return SQL_SANDBOX_TABLES.find((table) => table.name.toLowerCase() === tableName) ?? null;
}

function parseLimit(query: string) {
  const match = query.match(/limit\s+(\d+)/i);
  if (!match) {
    return null;
  }
  return Math.max(0, Number(match[1]));
}

function parseWhereEquals(query: string) {
  const match = query.match(/where\s+([a-zA-Z0-9_]+)\s*=\s*['"]?([^'";]+)['"]?/i);
  if (!match) {
    return null;
  }
  return {
    field: match[1],
    value: match[2],
  };
}

function parseSelectedColumns(selectPart: string, table: SqlTable) {
  const raw = selectPart.trim();
  if (raw === "*") {
    return table.columns;
  }

  const columns = raw.split(",").map((item) => item.trim()).filter(Boolean);
  const validColumns = columns.filter((column) => table.columns.includes(column));
  return validColumns.length > 0 ? validColumns : table.columns;
}

export function executeLocalSql(rawQuery: string): SqlExecutionResult {
  const query = rawQuery.trim();
  if (!query) {
    return {
      ok: false,
      message: "Query is empty.",
      columns: [],
      rows: [],
    };
  }

  const parsed = query.match(/^select\s+(.+)\s+from\s+([a-zA-Z0-9_]+)([\s\S]*)$/i);
  if (!parsed) {
    return {
      ok: false,
      message: "Only SELECT queries are supported in local sandbox.",
      columns: [],
      rows: [],
    };
  }

  const selectPart = parsed[1];
  const tableName = parsed[2];
  const tail = parsed[3] ?? "";

  const table = findTableByName(tableName);
  if (!table) {
    return {
      ok: false,
      message: `Unknown table: ${tableName}. Available: ${SQL_SANDBOX_TABLES.map((item) => item.name).join(", ")}`,
      columns: [],
      rows: [],
    };
  }

  const selectedColumns = parseSelectedColumns(selectPart, table);
  const whereClause = parseWhereEquals(tail);
  const limit = parseLimit(tail);

  let rows = [...table.rows];
  if (whereClause) {
    rows = rows.filter((row) => String(row[whereClause.field] ?? "") === whereClause.value);
  }

  if (typeof limit === "number") {
    rows = rows.slice(0, limit);
  }

  const mappedRows = rows.map((row) =>
    selectedColumns.reduce<SqlRow>((accumulator, column) => {
      accumulator[column] = row[column] ?? null;
      return accumulator;
    }, {}),
  );

  return {
    ok: true,
    message: `Returned ${mappedRows.length} row(s) from ${table.name}.`,
    columns: selectedColumns,
    rows: mappedRows,
  };
}
