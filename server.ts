import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { db } from "./server/db/index";
import { verifyGoogleAuthToken } from "./server/auth/googleAuth";

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 5000;

  app.use(express.json());

  // API route: Health Check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // ─── Google OAuth Auth API ──────────────────────────────────────────

  app.post("/api/auth/google", async (req, res) => {
    try {
      const { credential } = req.body || {};
      if (!credential) {
        return res.status(400).json({ success: false, error: "Credential token Google diperlukan" });
      }
      const { user, token } = await verifyGoogleAuthToken(credential);
      res.json({ success: true, user, token });
    } catch (error: any) {
      console.error("POST /api/auth/google error:", error);
      res.status(400).json({ success: false, error: error.message || "Gagal verifikasi Google Login" });
    }
  });

  // ─── Dev Bypass Login API (Local Development Only - Disabled in Production) ─
  if (process.env.NODE_ENV !== "production") {
    app.post("/api/auth/dev-login", async (_req, res) => {
      try {
        const devEmail = "dev@dompetku.local";
        const existingUser = await db.getUserByEmail(devEmail);
        const now = new Date().toISOString();

        const userObj = {
          id: existingUser?.id || "usr_dev_local",
          email: devEmail,
          name: "Developer Local",
          avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=DevUser",
          createdAt: existingUser?.createdAt || now,
          updatedAt: now,
          loginCount: (existingUser?.loginCount || 0) + 1,
        };

        const user = await db.upsertUser(userObj);
        const token = `token_dev_${user.id}_${Date.now()}`;

        res.json({ success: true, user, token });
      } catch (error: any) {
        console.error("POST /api/auth/dev-login error:", error);
        res.status(500).json({ success: false, error: error.message || "Gagal dev login" });
      }
    });
  }

  // ─── Data API (dummy JSON in dev, PostgreSQL in prod) ──────────────────────

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

  // GET all registered WhatsApp users (per number)
  app.get("/api/users", async (_req, res) => {
    try {
      const users = await db.getUsers();
      res.json(users);
    } catch (error: any) {
      console.error("GET /api/users error:", error);
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

  // Vite middleware for local development vs static serve for production/docker
  const isDocker = process.env.DB_MODE === "postgres"; // We use postgres in Docker
  
  if (process.env.NODE_ENV !== "production" && !isDocker) {
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
