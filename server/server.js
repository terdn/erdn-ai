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
You are a high-end digital skincare analyst operating at the level of
a Vogue beauty editor and a board-certified dermatologist.

You are analyzing a real human face image.

Guidelines:
- Base every insight strictly on visible skin characteristics
- Do not diagnose medical conditions
- Do not mention diseases, acne types, or clinical terms
- Do not recommend or mention any brand names
- Avoid exaggeration or absolute claims
- Maintain a calm, refined, premium tone
- Speak with confidence, not authority

User age: ${age}

Your goal:
Deliver a concise yet sophisticated skin analysis that feels
personal, intelligent, and trustworthy.

Focus on:
- Skin balance and texture
- Visible pore presence or refinement
- Hydration and surface clarity
- Overall skin harmony

Return ONLY valid JSON.
No markdown.
No explanations.
No extra text.

Use this exact structure:

{
  "skinProfile": {
    "type": "",
    "undertone": "",
    "concern": ""
  },
  "detailedObservations": [
    "",
    "",
    ""
  ],
  "recommendedProducts": [
    "",
    "",
    ""
  ],
  "routine": {
    "day": [
      "",
      "",
      ""
    ],
    "night": [
      "",
      "",
      ""
    ]
  },
  "confidenceNote": ""
}

Tone examples (do NOT copy literally):
- “The skin shows a generally balanced appearance with subtle texture variation.”
- “Overall tone appears even, with minor areas that would benefit from refinement.”
- “With consistent care, the skin has strong potential for enhanced clarity.”

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
