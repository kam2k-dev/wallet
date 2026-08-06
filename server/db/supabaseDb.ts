/**
 * Supabase database client for production.
 * Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars.
 *
 * Expected tables (see schema.sql):
 *   categories  (id text pk, name text, amount numeric, color text, bg_hex text, icon text)
 *   transactions (id text pk, title text, category_id text fk, category_name text,
 *                 date text, raw_date date, amount numeric, payment_method text,
 *                 icon_url text, notes text)
 */
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { DbTransaction, DbCategory } from "./dummyDb";

let client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (client) return client;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set when DB_MODE=supabase"
    );
  }
  client = createClient(url, key);
  return client;
}

// Map DB row (snake_case) → DbTransaction (camelCase)
function rowToTransaction(row: any): DbTransaction {
  return {
    id: row.id,
    title: row.title,
    categoryId: row.category_id,
    categoryName: row.category_name,
    date: row.date,
    rawDate: row.raw_date,
    amount: Number(row.amount),
    paymentMethod: row.payment_method,
    iconUrl: row.icon_url ?? undefined,
    notes: row.notes ?? undefined,
  };
}

function rowToCategory(row: any): DbCategory {
  return {
    id: row.id,
    name: row.name,
    amount: Number(row.amount),
    color: row.color,
    bgHex: row.bg_hex,
    icon: row.icon,
  };
}

export const supabaseDb = {
  async getTransactions(): Promise<DbTransaction[]> {
    const { data, error } = await getClient()
      .from("transactions")
      .select("*")
      .order("raw_date", { ascending: false });
    if (error) throw error;
    return (data || []).map(rowToTransaction);
  },

  async getCategories(): Promise<DbCategory[]> {
    const { data, error } = await getClient().from("categories").select("*");
    if (error) throw error;
    return (data || []).map(rowToCategory);
  },

  async addTransaction(tx: DbTransaction): Promise<DbTransaction> {
    const sb = getClient();
    const { error } = await sb.from("transactions").insert({
      id: tx.id,
      title: tx.title,
      category_id: tx.categoryId,
      category_name: tx.categoryName,
      date: tx.date,
      raw_date: tx.rawDate,
      amount: tx.amount,
      payment_method: tx.paymentMethod,
      icon_url: tx.iconUrl ?? null,
      notes: tx.notes ?? null,
    });
    if (error) throw error;

    // Update category total
    const { data: cat } = await sb
      .from("categories")
      .select("amount")
      .eq("id", tx.categoryId)
      .single();
    if (cat) {
      await sb
        .from("categories")
        .update({ amount: Number(cat.amount) + Math.abs(tx.amount) })
        .eq("id", tx.categoryId);
    }
    return tx;
  },

  async updateTransaction(tx: DbTransaction): Promise<DbTransaction | null> {
    const sb = getClient();
    const { data: oldTx } = await sb
      .from("transactions")
      .select("*")
      .eq("id", tx.id)
      .single();
    if (!oldTx) return null;

    const { error } = await sb
      .from("transactions")
      .update({
        title: tx.title,
        category_id: tx.categoryId,
        category_name: tx.categoryName,
        date: tx.date,
        raw_date: tx.rawDate,
        amount: tx.amount,
        payment_method: tx.paymentMethod,
        icon_url: tx.iconUrl ?? null,
        notes: tx.notes ?? null,
      })
      .eq("id", tx.id);
    if (error) throw error;

    // Adjust old category
    const { data: oldCat } = await sb
      .from("categories")
      .select("amount")
      .eq("id", oldTx.category_id)
      .single();
    if (oldCat) {
      await sb
        .from("categories")
        .update({
          amount: Math.max(0, Number(oldCat.amount) - Math.abs(Number(oldTx.amount))),
        })
        .eq("id", oldTx.category_id);
    }

    // Adjust new category
    const { data: newCat } = await sb
      .from("categories")
      .select("amount")
      .eq("id", tx.categoryId)
      .single();
    if (newCat) {
      await sb
        .from("categories")
        .update({
          amount: Number(newCat.amount) + Math.abs(tx.amount),
        })
        .eq("id", tx.categoryId);
    }

    return tx;
  },

  async deleteTransaction(id: string): Promise<boolean> {
    const sb = getClient();
    const { data: tx } = await sb
      .from("transactions")
      .select("*")
      .eq("id", id)
      .single();
    if (!tx) return false;

    const { error } = await sb.from("transactions").delete().eq("id", id);
    if (error) throw error;

    const { data: cat } = await sb
      .from("categories")
      .select("amount")
      .eq("id", tx.category_id)
      .single();
    if (cat) {
      await sb
        .from("categories")
        .update({
          amount: Math.max(0, Number(cat.amount) - Math.abs(Number(tx.amount))),
        })
        .eq("id", tx.category_id);
    }
    return true;
  },

  async updateCategories(categories: DbCategory[]): Promise<void> {
    const sb = getClient();
    for (const cat of categories) {
      await sb
        .from("categories")
        .update({ amount: cat.amount })
        .eq("id", cat.id);
    }
  },
};
