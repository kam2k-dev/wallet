/**
 * Dummy JSON-file database for local development.
 * Persists data to server/db/data.json so changes survive server restarts.
 */
import fs from "fs";
import path from "path";

export interface DbTransaction {
  id: string;
  title: string;
  categoryId: string;
  categoryName: string;
  date: string;
  rawDate: string;
  amount: number;
  paymentMethod: string;
  iconUrl?: string;
  notes?: string;
}

export interface DbCategory {
  id: string;
  name: string;
  amount: number;
  color: string;
  bgHex: string;
  icon: string;
  budget?: number;
}

export interface DbUser {
  id: string;
  phone: string;
  name: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
  loginCount: number;
}

interface DbShape {
  transactions: DbTransaction[];
  categories: DbCategory[];
  users: DbUser[];
}

const DATA_DIR = path.join(process.cwd(), "server", "db");
const DATA_FILE = path.join(DATA_DIR, "data.json");

const SEED: DbShape = {
  categories: [
    { id: "groceries", name: "Groceries", amount: 1245.3, color: "#9466ff", bgHex: "#9c27b0", icon: "shopping_bag" },
    { id: "transport", name: "Transport", amount: 540.0, color: "#2170e4", bgHex: "#2196f3", icon: "directions_car" },
    { id: "entertainment", name: "Entertainment", amount: 600.0, color: "#27AE60", bgHex: "#4caf50", icon: "event" },
    { id: "rent", name: "Rent & Utilities", amount: 1080.5, color: "#F39C12", bgHex: "#ff9800", icon: "home" },
  ],
  transactions: [
    {
      id: "t-1",
      title: "Supermart Groceries",
      categoryId: "groceries",
      categoryName: "Groceries",
      date: "Sep 14, 2025",
      rawDate: "2025-09-14",
      amount: 52.3,
      paymentMethod: "Card •••• 1234",
    },
    {
      id: "t-2",
      title: "Fresh Bakery",
      categoryId: "groceries",
      categoryName: "Groceries",
      date: "Sep 13, 2025",
      rawDate: "2025-09-13",
      amount: -30.45,
      paymentMethod: "Paid with Visa",
    },
    {
      id: "t-3",
      title: "Gas Station",
      categoryId: "transport",
      categoryName: "Transport",
      date: "Sep 11, 2025",
      rawDate: "2025-09-11",
      amount: -45.06,
      paymentMethod: "Card •••• 1234",
    },
    {
      id: "t-4",
      title: "Organic Market",
      categoryId: "groceries",
      categoryName: "Groceries",
      date: "Sep 11, 2025",
      rawDate: "2025-09-11",
      amount: 45.06,
      paymentMethod: "Card •••• 1234",
    },
    {
      id: "t-5",
      title: "Metro Commute Pass",
      categoryId: "transport",
      categoryName: "Transport",
      date: "Sep 09, 2025",
      rawDate: "2025-09-09",
      amount: -85.0,
      paymentMethod: "Card •••• 1234",
    },
    {
      id: "t-6",
      title: "Concert Tickets",
      categoryId: "entertainment",
      categoryName: "Entertainment",
      date: "Sep 08, 2025",
      rawDate: "2025-09-08",
      amount: -120.0,
      paymentMethod: "Paid with Visa",
    },
    {
      id: "t-7",
      title: "Apartment Monthly Rent",
      categoryId: "rent",
      categoryName: "Rent & Utilities",
      date: "Sep 01, 2025",
      rawDate: "2025-09-01",
      amount: -950.0,
      paymentMethod: "Bank Transfer",
    },
    {
      id: "t-8",
      title: "Water & Electric Bill",
      categoryId: "rent",
      categoryName: "Rent & Utilities",
      date: "Sep 05, 2025",
      rawDate: "2025-09-05",
      amount: -130.5,
      paymentMethod: "Auto-Pay",
    },
  ],
  users: [],
};

function ensureFile(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(SEED, null, 2), "utf-8");
  }
}

function read(): DbShape {
  ensureFile();
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    const parsed = JSON.parse(raw) as Partial<DbShape>;
    return {
      transactions: parsed.transactions ?? SEED.transactions,
      categories: parsed.categories ?? SEED.categories,
      users: parsed.users ?? [],
    };
  } catch {
    return structuredClone(SEED);
  }
}

function write(data: DbShape): void {
  ensureFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
}

export const dummyDb = {
  async getTransactions(): Promise<DbTransaction[]> {
    return read().transactions;
  },

  async getCategories(): Promise<DbCategory[]> {
    return read().categories;
  },

  async addTransaction(tx: DbTransaction): Promise<DbTransaction> {
    const db = read();
    db.transactions.unshift(tx);
    // Update category total
    const cat = db.categories.find((c) => c.id === tx.categoryId);
    if (cat) cat.amount += Math.abs(tx.amount);
    write(db);
    return tx;
  },

  async updateTransaction(tx: DbTransaction): Promise<DbTransaction | null> {
    const db = read();
    const idx = db.transactions.findIndex((t) => t.id === tx.id);
    if (idx === -1) return null;
    const oldTx = db.transactions[idx];
    
    // Adjust old category amount
    const oldCat = db.categories.find((c) => c.id === oldTx.categoryId);
    if (oldCat) oldCat.amount = Math.max(0, oldCat.amount - Math.abs(oldTx.amount));

    // Adjust new category amount
    const newCat = db.categories.find((c) => c.id === tx.categoryId);
    if (newCat) newCat.amount += Math.abs(tx.amount);

    db.transactions[idx] = tx;
    write(db);
    return tx;
  },

  async deleteTransaction(id: string): Promise<boolean> {
    const db = read();
    const idx = db.transactions.findIndex((t) => t.id === id);
    if (idx === -1) return false;
    const [removed] = db.transactions.splice(idx, 1);
    const cat = db.categories.find((c) => c.id === removed.categoryId);
    if (cat) cat.amount = Math.max(0, cat.amount - Math.abs(removed.amount));
    write(db);
    return true;
  },

  async addCategory(cat: DbCategory): Promise<DbCategory> {
    const db = read();
    const existingIdx = db.categories.findIndex((c) => c.id === cat.id);
    if (existingIdx >= 0) {
      db.categories[existingIdx] = cat;
    } else {
      db.categories.push(cat);
    }
    write(db);
    return cat;
  },

  async updateCategories(categories: DbCategory[]): Promise<void> {
    const db = read();
    db.categories = categories;
    write(db);
  },

  async getUsers(): Promise<DbUser[]> {
    return read().users;
  },

  async getUserByPhone(phone: string): Promise<DbUser | null> {
    const db = read();
    return db.users.find((u) => u.phone === phone) || null;
  },

  async upsertUser(user: DbUser): Promise<DbUser> {
    const db = read();
    const idx = db.users.findIndex((u) => u.phone === user.phone);
    if (idx >= 0) {
      db.users[idx] = { ...db.users[idx], ...user };
    } else {
      db.users.push(user);
    }
    write(db);
    return user;
  },
};
