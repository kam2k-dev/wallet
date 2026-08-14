/**
 * PostgreSQL database client for production.
 * Requires DATABASE_URL env var.
 *
 * Expected tables (see schema.sql):
 *   categories  (id text pk, name text, amount numeric, color text, bg_hex text, icon text)
 *   transactions (id text pk, title text, category_id text fk, category_name text,
 *                 date text, raw_date date, amount numeric, payment_method text,
 *                 icon_url text, notes text)
 */
import { Pool } from "pg";
import type { DbTransaction, DbCategory, DbUser } from "./dummyDb";

let pool: Pool | null = null;

function getPool(): Pool {
  if (pool) return pool;
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL must be set when DB_MODE=postgres");
  }
  pool = new Pool({
    connectionString: url,
  });
  return pool;
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
    type: row.type,
  };
}

function rowToUser(row: any): DbUser {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    avatar: row.avatar ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    loginCount: Number(row.login_count),
  };
}

export const postgresDb = {
  async getTransactions(): Promise<DbTransaction[]> {
    const { rows } = await getPool().query(
      "SELECT * FROM transactions ORDER BY raw_date DESC"
    );
    return rows.map(rowToTransaction);
  },

  async getCategories(): Promise<DbCategory[]> {
    const { rows } = await getPool().query("SELECT * FROM categories");
    return rows.map(rowToCategory);
  },

  async addTransaction(tx: DbTransaction): Promise<DbTransaction> {
    const client = await getPool().connect();
    try {
      await client.query("BEGIN");

      await client.query(
        `INSERT INTO transactions 
        (id, title, category_id, category_name, date, raw_date, amount, payment_method, icon_url, notes) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          tx.id,
          tx.title,
          tx.categoryId,
          tx.categoryName,
          tx.date,
          tx.rawDate,
          tx.amount,
          tx.paymentMethod,
          tx.iconUrl ?? null,
          tx.notes ?? null,
        ]
      );

      // Update category total
      const { rows } = await client.query(
        "SELECT amount FROM categories WHERE id = $1",
        [tx.categoryId]
      );
      
      if (rows.length > 0) {
        const currentAmount = Number(rows[0].amount);
        await client.query(
          "UPDATE categories SET amount = $1 WHERE id = $2",
          [currentAmount + Math.abs(tx.amount), tx.categoryId]
        );
      }

      await client.query("COMMIT");
      return tx;
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  },

  async updateTransaction(tx: DbTransaction): Promise<DbTransaction | null> {
    const client = await getPool().connect();
    try {
      await client.query("BEGIN");

      // Get old transaction
      const { rows: oldRows } = await client.query(
        "SELECT * FROM transactions WHERE id = $1",
        [tx.id]
      );
      if (oldRows.length === 0) {
        await client.query("ROLLBACK");
        return null;
      }
      const oldTx = rowToTransaction(oldRows[0]);

      // Adjust old category amount
      const { rows: oldCatRows } = await client.query(
        "SELECT amount FROM categories WHERE id = $1",
        [oldTx.categoryId]
      );
      if (oldCatRows.length > 0) {
        const currentAmount = Number(oldCatRows[0].amount);
        await client.query(
          "UPDATE categories SET amount = $1 WHERE id = $2",
          [Math.max(0, currentAmount - Math.abs(oldTx.amount)), oldTx.categoryId]
        );
      }

      // Adjust new category amount
      const { rows: newCatRows } = await client.query(
        "SELECT amount FROM categories WHERE id = $1",
        [tx.categoryId]
      );
      if (newCatRows.length > 0) {
        const currentAmount = Number(newCatRows[0].amount);
        await client.query(
          "UPDATE categories SET amount = $1 WHERE id = $2",
          [currentAmount + Math.abs(tx.amount), tx.categoryId]
        );
      }

      // Update transaction
      await client.query(
        `UPDATE transactions 
        SET title = $1, category_id = $2, category_name = $3, date = $4, raw_date = $5, 
            amount = $6, payment_method = $7, icon_url = $8, notes = $9
        WHERE id = $10`,
        [
          tx.title,
          tx.categoryId,
          tx.categoryName,
          tx.date,
          tx.rawDate,
          tx.amount,
          tx.paymentMethod,
          tx.iconUrl ?? null,
          tx.notes ?? null,
          tx.id,
        ]
      );

      await client.query("COMMIT");
      return tx;
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  },

  async deleteTransaction(id: string): Promise<boolean> {
    const client = await getPool().connect();
    try {
      await client.query("BEGIN");

      // Get transaction to delete
      const { rows: oldRows } = await client.query(
        "SELECT * FROM transactions WHERE id = $1",
        [id]
      );
      if (oldRows.length === 0) {
        await client.query("ROLLBACK");
        return false;
      }
      const oldTx = rowToTransaction(oldRows[0]);

      // Delete transaction
      await client.query("DELETE FROM transactions WHERE id = $1", [id]);

      // Adjust category amount
      const { rows: catRows } = await client.query(
        "SELECT amount FROM categories WHERE id = $1",
        [oldTx.categoryId]
      );
      if (catRows.length > 0) {
        const currentAmount = Number(catRows[0].amount);
        await client.query(
          "UPDATE categories SET amount = $1 WHERE id = $2",
          [Math.max(0, currentAmount - Math.abs(oldTx.amount)), oldTx.categoryId]
        );
      }

      await client.query("COMMIT");
      return true;
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  },

  async addCategory(cat: DbCategory): Promise<DbCategory> {
    await getPool().query(
      `INSERT INTO categories (id, name, amount, color, bg_hex, icon, type) 
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (id) DO UPDATE 
       SET name = EXCLUDED.name, amount = EXCLUDED.amount, color = EXCLUDED.color, 
           bg_hex = EXCLUDED.bg_hex, icon = EXCLUDED.icon, type = EXCLUDED.type`,
      [cat.id, cat.name, cat.amount, cat.color, cat.bgHex, cat.icon, cat.type]
    );
    return cat;
  },

  async updateCategories(categories: DbCategory[]): Promise<void> {
    const client = await getPool().connect();
    try {
      await client.query("BEGIN");
      
      // Clear existing categories
      await client.query("DELETE FROM categories");
      
      // Insert new categories
      for (const cat of categories) {
        await client.query(
          `INSERT INTO categories (id, name, amount, color, bg_hex, icon, type) 
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [cat.id, cat.name, cat.amount, cat.color, cat.bgHex, cat.icon, cat.type]
        );
      }
      
      await client.query("COMMIT");
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  },

  async getUsers(): Promise<DbUser[]> {
    const { rows } = await getPool().query(
      "SELECT * FROM users ORDER BY created_at ASC"
    );
    return rows.map(rowToUser);
  },

  async getUserByEmail(email: string): Promise<DbUser | null> {
    const { rows } = await getPool().query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    return rows.length > 0 ? rowToUser(rows[0]) : null;
  },

  async upsertUser(user: DbUser): Promise<DbUser> {
    const { rows } = await getPool().query(
      `INSERT INTO users (id, email, name, avatar, created_at, updated_at, login_count)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (email) DO UPDATE
       SET name = EXCLUDED.name,
           avatar = EXCLUDED.avatar,
           updated_at = EXCLUDED.updated_at,
           login_count = EXCLUDED.login_count
       RETURNING *`,
      [
        user.id,
        user.email,
        user.name,
        user.avatar ?? null,
        user.createdAt,
        user.updatedAt,
        user.loginCount,
      ]
    );
    return rowToUser(rows[0]);
  },
};
