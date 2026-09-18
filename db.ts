import Database from 'better-sqlite3';

const db = new Database('calmflow.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS cases (
    id TEXT PRIMARY KEY,
    data TEXT NOT NULL,
    createdAt TEXT NOT NULL
  )
`);

export function saveCase(id: string, caseData: object) {
  const stmt = db.prepare('INSERT OR REPLACE INTO cases (id, data, createdAt) VALUES (?, ?, ?)');
  stmt.run(id, JSON.stringify(caseData), new Date().toISOString());
}

export function getAllCases() {
  const rows = db.prepare('SELECT data FROM cases ORDER BY createdAt DESC').all() as { data: string }[];
  return rows.map(row => JSON.parse(row.data));
}

export default db;