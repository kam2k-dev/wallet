import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { db } from "./server/db/index";
import { waAuthService } from "./server/auth/waAuth";

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 5000;

  app.use(express.json());

  // API route: Health Check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // ─── WhatsApp Reverse Auth API ──────────────────────────────────────────

  // 1. Initiate WhatsApp Reverse Auth session
  app.post("/api/auth/wa/initiate", (req, res) => {
    try {
      const { phoneHint } = req.body || {};
      const session = waAuthService.initiateSession(phoneHint);
      res.json({ success: true, session });
    } catch (error: any) {
      console.error("POST /api/auth/wa/initiate error:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // 2. Check status of an auth session (polling endpoint)
  app.get("/api/auth/wa/status/:sessionId", (req, res) => {
    try {
      const { sessionId } = req.params;
      const session = waAuthService.getSessionStatus(sessionId);
      if (!session) {
        return res.status(404).json({ success: false, error: "Session not found or expired" });
      }
      res.json({
        success: true,
        status: session.status,
        session,
        user: session.user,
        token: session.token,
      });
    } catch (error: any) {
      console.error("GET /api/auth/wa/status error:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // 3. Webhook for Baileys self-hosted bot
  // Baileys bot sends: { from: "628123456789@s.whatsapp.net", text: "LOGIN 123456" }
  app.post("/api/auth/wa/webhook", (req, res) => {
    try {
      const { from, text, message } = req.body || {};
      const messageText = text || message || "";
      const fromPhone = from || "";

      if (!fromPhone || !messageText) {
        return res.status(400).json({ success: false, error: "Missing 'from' or 'text' in payload" });
      }

      const result = waAuthService.handleIncomingMessage(fromPhone, messageText);
      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json({
        success: true,
        message: "Authentication successful",
        session: result.session,
      });
    } catch (error: any) {
      console.error("POST /api/auth/wa/webhook error:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // 4. Mock verification endpoint for local dev testing
  app.post("/api/auth/wa/mock-verify", (req, res) => {
    try {
      const { sessionId, phone } = req.body || {};
      if (!sessionId) {
        return res.status(400).json({ success: false, error: "Missing sessionId" });
      }

      const result = waAuthService.mockVerify(sessionId, phone || "+628123456789");
      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json({
        success: true,
        session: result.session,
        user: result.session?.user,
        token: result.session?.token,
      });
    } catch (error: any) {
      console.error("POST /api/auth/wa/mock-verify error:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

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
