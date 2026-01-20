import cors from "cors";
import dotenv from "dotenv";
import express from "express";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));

// HEALTH CHECK
app.get("/", (req, res) => {
  res.json({ status: "ERDN backend running" });
});

// ANALYZE ENDPOINT
app.post("/analyze", async (req, res) => {
  try {
    const { image, age } = req.body;

    if (!image) {
      return res.status(400).json({ error: "No image provided" });
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      return res.status(500).json({ error: "Missing GEMINI_API_KEY" });
    }

    const prompt = `
Analyze the user's face from the image and return STRICT JSON ONLY.

Rules:
- No brand names
- No medical advice
- Generic skincare recommendations
- The analysis must depend on facial features
- Age is provided by user

Return format:
{
  "skinProfile": {
    "type": "...",
    "undertone": "...",
    "concern": "..."
  },
  "recommendedProducts": [],
  "routine": {
    "day": [],
    "night": []
  }
}

User age: ${age || "unknown"}
`;

    const geminiRes = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" +
        GEMINI_API_KEY,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                { text: prompt },
                {
                  inlineData: {
                    mimeType: "image/jpeg",
                    data: image
                  }
                }
              ]
            }
          ]
        })
      }
    );

    const data = await geminiRes.json();

    if (!data.candidates || !data.candidates[0]) {
      return res.status(500).json({ error: "Gemini response invalid" });
    }

    const text = data.candidates[0].content.parts[0].text;

    // Gemini sometimes wraps JSON in ``` — clean it
    const clean = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const parsed = JSON.parse(clean);

    res.json(parsed);
  } catch (err) {
    console.error("ANALYZE ERROR:", err);
    res.status(500).json({ error: "Analysis failed" });
  }
});

// PORT — DO NOT TOUCH
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
