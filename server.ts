import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }
    aiClient = new GoogleGenAI({ apiKey: key });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));

  // API Routes
  app.post("/api/recommend-outfit", async (req, res) => {
    try {
      const { weather, occasion, preferredColor, wardrobe } = req.body;

      if (!wardrobe || !Array.isArray(wardrobe) || wardrobe.length === 0) {
        return res.status(400).json({ error: "Wardrobe is empty or missing" });
      }

      const ai = getAI();

      let prompt = `You are an expert AI fashion stylist. The user wants an outfit recommendation based ONLY on their existing wardrobe.
Weather: ${weather || 'Any'}
Occasion: ${occasion || 'Casual'}
Preferred Color: ${preferredColor || 'Any'}

Here is the user's available wardrobe (in JSON format):
${JSON.stringify(wardrobe.map((item: any) => ({
  id: item.id,
  category: item.category,
  color: item.color,
  brand: item.brand
})), null, 2)}

Select items to form a complete outfit (e.g., Top + Bottom + Footwear + Accessories). You can also use a Dress.
Only use items exactly as provided in the JSON, outputting their 'id' fields. Provide a short description (1-2 sentences) of why this outfit works.

Output ONLY a raw JSON object (no markdown formatting, no code blocks) like:
{
  "outfitIds": ["id1", "id2"],
  "description": "This works because..."
}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash", 
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.7
        }
      });

      const messageContent = response.text;
      if (!messageContent) {
         throw new Error("Empty response from AI");
      }

      const suggestion = JSON.parse(messageContent);
      res.json(suggestion);
    } catch (error: any) {
      console.error("AI Recommendation Error:", error);
      res.status(500).json({ error: error.message || "Internal Server Error" });
    }
  });

  // Vite middleware for development
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
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
