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
You are a high-end digital skincare consultant operating at a Vogue-level editorial and dermatologist-informed standard.

You are analyzing a REAL HUMAN FACE photo.

Rules:
- Analyze only what is visually observable.
- Do NOT diagnose or mention medical conditions or diseases.
- Do NOT recommend brands or commercial products.
- Do NOT exaggerate or overpromise results.
- Maintain a calm, confident, premium tone.
- Be reassuring, elegant, and human — never robotic.

User age: ${age}

Your goal:
Create a personalized, premium skincare analysis that feels bespoke, refined, and trustworthy.

You may recommend ingredients (vitamins, acids, SPF) only when visually appropriate.
If exfoliating acids are relevant, provide SAFE percentage ranges, not exact prescriptions.

Determine the routine duration dynamically based on the skin’s visible needs.
Do NOT use a fixed timeframe.

Return STRICT JSON ONLY in the following format:

{
  "skinProfile": {
    "type": "",
    "undertone": "",
    "concerns": ""
  },
  "detailedObservations": [
    "",
    "",
    ""
  ],
  "recommendedProducts": [
    "",
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
  "programDuration": {
    "estimatedTimeline": "",
    "whyThisDuration": "",
    "whatToExpect": ""
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
