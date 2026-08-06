import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { db } from "./server/db/index";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API route: Health Check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // ─── Data API (dummy JSON in dev, Supabase in prod) ──────────────────────

  // GET all transactions
  app.get("/api/transactions", async (_req, res) => {
    try {
      const transactions = await db.getTransactions();
      res.json(transactions);
    } catch (error: any) {
      console.error("GET /api/transactions error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // GET all categories
  app.get("/api/categories", async (_req, res) => {
    try {
      const categories = await db.getCategories();
      res.json(categories);
    } catch (error: any) {
      console.error("GET /api/categories error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // POST a new transaction
  app.post("/api/transactions", async (req, res) => {
    try {
      const tx = req.body;
      if (!tx || !tx.id || !tx.title || typeof tx.amount !== "number") {
        return res.status(400).json({ error: "Invalid transaction payload" });
      }
      const created = await db.addTransaction(tx);
      res.status(201).json(created);
    } catch (error: any) {
      console.error("POST /api/transactions error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // PUT update a transaction
  app.put("/api/transactions/:id", async (req, res) => {
    try {
      const tx = req.body;
      if (!tx || !tx.id || !tx.title || typeof tx.amount !== "number") {
        return res.status(400).json({ error: "Invalid transaction payload" });
      }
      const updated = await (db as any).updateTransaction(tx);
      if (!updated) return res.status(404).json({ error: "Transaction not found" });
      res.json(updated);
    } catch (error: any) {
      console.error("PUT /api/transactions/:id error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // POST / PUT categories
  app.post("/api/categories", async (req, res) => {
    try {
      const cat = req.body;
      if (!cat || !cat.id || !cat.name) {
        return res.status(400).json({ error: "Invalid category payload" });
      }
      if ((db as any).addCategory) {
        await (db as any).addCategory(cat);
      }
      res.status(201).json(cat);
    } catch (error: any) {
      console.error("POST /api/categories error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/categories", async (req, res) => {
    try {
      const categories = req.body;
      if (!Array.isArray(categories)) {
        return res.status(400).json({ error: "Expected array of categories" });
      }
      await db.updateCategories(categories);
      res.json({ success: true });
    } catch (error: any) {
      console.error("PUT /api/categories error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // DELETE a transaction by id
  app.delete("/api/transactions/:id", async (req, res) => {
    try {
      const ok = await db.deleteTransaction(req.params.id);
      if (!ok) return res.status(404).json({ error: "Transaction not found" });
      res.json({ success: true });
    } catch (error: any) {
      console.error("DELETE /api/transactions/:id error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development vs static serve for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
