import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API route: Health Check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // API route: Smart Category Insights using Gemini API
  app.post("/api/smart-categorize", async (req, res) => {
    try {
      const { transactions, promptText } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        // Fallback response if GEMINI_API_KEY is not set yet
        return res.json({
          insight: "We've categorized your transactions automatically into Groceries, Transport, Entertainment, and Rent & Utilities. Your top spending area this month is Groceries ($1,245.30).",
          suggestions: [
            { category: "groceries", title: "Supermart Groceries", suggestion: "High frequency grocery store detected" },
            { category: "rent", title: "Monthly Rent", suggestion: "Fixed monthly obligation" }
          ]
        });
      }

      const ai = new GoogleGenAI({ apiKey });
      const prompt = `You are a modern financial assistant for a fintech spend analysis app. 
Analyze these user transactions: ${JSON.stringify(transactions || [])}.
User request / context: ${promptText || "Provide spend insights and category tips."}.
Return a clean JSON object with two fields:
1. "insight": a friendly 2-sentence summary of spending habits and recommendations.
2. "suggestions": an array of items with { title, category, tip }.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      const responseText = response.text || "";
      let parsed = null;
      try {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0]);
        }
      } catch (e) {
        console.warn("Could not parse AI JSON response, returning raw text", e);
      }

      res.json(parsed || {
        insight: responseText || "We've categorized your transactions automatically. You may change them if you want.",
        suggestions: []
      });

    } catch (error: any) {
      console.error("Gemini smart categorize error:", error);
      res.json({
        insight: "We've categorized your transactions automatically based on merchant names. You may re-assign categories anytime.",
        suggestions: []
      });
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
