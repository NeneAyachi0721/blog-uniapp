import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { Database } from "bun:sqlite";

export const DB_PATH = join(process.cwd(), "data", "sqlite.db");
export const POST_UPLOADS_DIR = join(process.cwd(), "data", "uploads", "posts");
export const now = Math.floor(Date.now() / 1000);
export const hour = 60 * 60;
export const day = 24 * hour;

export type SeedDatabase = Database;
export type SqlValue = string | number | null;

export function createSeedDb() {
  mkdirSync(POST_UPLOADS_DIR, { recursive: true });
  const db = new Database(DB_PATH);
  db.exec("PRAGMA journal_mode = WAL;");
  db.exec("PRAGMA foreign_keys = ON;");
  return db;
}

export function closeSeedDb(db: SeedDatabase) {
  db.exec("PRAGMA wal_checkpoint(TRUNCATE);");
  db.close();
}

export function run(db: SeedDatabase, sql: string, params: SqlValue[] = []) {
  db.run(sql, params);
}

export function json(value: unknown) {
  return JSON.stringify(value);
}

export function postContent(title: string, sections: string[]) {
  return {
    type: "doc",
    content: [
      {
        type: "heading",
        attrs: { level: 2 },
        content: [{ type: "text", text: title }],
      },
      ...sections.map((text) => ({
        type: "paragraph",
        content: [{ type: "text", text }],
      })),
      {
        type: "blockquote",
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "把喜欢的事情认真记下来，明天再读也会觉得可爱。",
              },
            ],
          },
        ],
      },
    ],
  };
}
