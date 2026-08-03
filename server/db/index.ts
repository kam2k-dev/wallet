/**
 * Database abstraction layer.
 * Selects the implementation based on the DB_MODE environment variable:
 *   - "dummy"    → local JSON file (development)
 *   - "supabase" → Supabase Postgres (production)
 */
import { dummyDb } from "./dummyDb";
import { supabaseDb } from "./supabaseDb";

export type { DbTransaction, DbCategory } from "./dummyDb";

const mode = (process.env.DB_MODE || "dummy").toLowerCase();

export const db = mode === "supabase" ? supabaseDb : dummyDb;

if (mode === "supabase") {
  console.log("[db] Using Supabase (production)");
} else {
  console.log("[db] Using dummy JSON file DB (development)");
}
