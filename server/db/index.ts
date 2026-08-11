/**
 * Database abstraction layer.
 * Selects the implementation based on the DB_MODE environment variable:
 *   - "dummy"    → local JSON file (development)
 *   - "postgres" → PostgreSQL (production)
 */
import { dummyDb } from "./dummyDb";
import { postgresDb } from "./postgresDb";

export type { DbTransaction, DbCategory } from "./dummyDb";

const mode = (process.env.DB_MODE || "dummy").toLowerCase();

export const db = mode === "postgres" ? postgresDb : dummyDb;

if (mode === "postgres") {
  console.log("[db] Using PostgreSQL (production)");
} else {
  console.log("[db] Using dummy JSON file DB (development)");
}
