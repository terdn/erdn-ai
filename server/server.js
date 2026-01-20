import cors from "cors";
import express from "express";

const app = express();

app.use(cors());
app.use(express.json({ limit: "12mb" }));

app.get("/", (req, res) => {
  res.json({ status: "ERDN backend running" });
});

app.post("/analyze", async (req, res) => {
  try {
    const { image, age } = req.body;

    if (!image) {
      return res.status(400).json({ error: "Image is required" });
    }

    const prompt = `
You are a high-end digital skin analyst working at a luxury dermatology clinic.

You are analyzing a REAL HUMAN FACE photo.

STRICT RULES:
- Do NOT mention brands
- Do NOT mention diseases or diagnoses
- Do NOT exaggerate
- Do NOT use emojis
- Do NOT leave any field empty
- Be calm, precise, confident, premium
- Write for a paying user

User age: ${age ?? "not specified"}

You MUST return VALID JSON.
ALL fields MUST be filled with meaningful content.

JSON FORMAT (STRICT):

{
  "skinProfile": {
    "type": "Clear explanation of skin type in 1–2 sentences",
    "undertone": "Clear undertone description in 1 sentence",
    "concern": "At least ONE clear, realistic skin concern in 1 sentence"
  },
  "recommendedProducts": [
    "Product category + purpose + key ingredients (example: niacinamide, ceramides, vitamin C, SPF value if relevant)",
    "Product category + purpose + key ingredients",
    "Product category + purpose + key ingredients"
  ],
  "routine": {
    "day": [
      "Step name + short explanation",
      "Step name + short explanation",
      "Step name + short explanation"
    ],
    "night": [
      "Step name + short explanation",
      "Step name + short explanation (include usage frequency if actives are involved)",
      "Step name + short explanation"
    ]
  },
  "programGuidance": "Estimated time frame (for example 3–5 weeks) explaining when visible improvements may begin with consistent use.",
  "confidenceNote": "A short, reassuring, premium closing sentence."
}

Remember:
- NO empty fields
- NO generic filler
- Write like a dermatologist speaking to a premium client
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
                    data: image
                  }
                }
              ]
            }
          ]
        })
      }
    );

    const data = await geminiResponse.json();

    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error("Empty response from Gemini");
    }

    const cleaned = text.trim().replace(/```json|```/g, "");
    const parsed = JSON.parse(cleaned);

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
