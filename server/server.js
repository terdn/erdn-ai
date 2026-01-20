import cors from "cors";
import express from "express";

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.get("/", (req, res) => {
  res.json({ status: "ERDN backend running" });
});

app.post("/analyze", async (req, res) => {
  try {
    const { image, age } = req.body;

    if (!image) {
      return res.status(400).json({ error: "No image provided" });
    }

    const prompt = `
You are a professional digital skincare analyst.

Analyze the provided real human face image.

Rules:
- No medical diagnosis
- No diseases
- No brand names
- No exaggeration
- Premium, calm, confident tone
- Base everything ONLY on visible skin

User age: ${age}

Return ONLY valid JSON.
Do NOT use markdown.
Do NOT add explanations.

JSON format:

{
  "skinProfile": {
    "type": "",
    "undertone": "",
    "concern": ""
  },
  "detailedObservations": ["", "", ""],
  "recommendedProducts": ["", "", ""],
  "routine": {
    "day": ["", "", ""],
    "night": ["", "", ""]
  },
  "confidenceNote": ""
}
`;

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt },
                {
                  inlineData: {
                    mimeType: "image/jpeg",
                    data: image,
                  },
                },
              ],
            },
          ],
        }),
      }
    );

    const result = await geminiResponse.json();

    const rawText =
      result?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      throw new Error("Empty Gemini response");
    }

    // 🔥 EN KRİTİK KISIM — JSON GÜVENLİ AYIKLAMA
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      console.error("Gemini raw output:", rawText);
      throw new Error("No JSON found in Gemini output");
    }

    const parsed = JSON.parse(jsonMatch[0]);
    res.json(parsed);
  } catch (err) {
    console.error("Analyze error:", err);
    res.status(500).json({ error: "Analysis failed" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("ERDN server running on port", PORT);
});
