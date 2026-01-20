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

You are analyzing a REAL HUMAN FACE photo.

Your task:
- Analyze visible skin characteristics ONLY
- Do NOT guess medical conditions
- Do NOT mention diseases or diagnoses
- Do NOT recommend brands
- Do NOT exaggerate
- Be calm, confident, and premium in tone

User age: ${age}

Return STRICT JSON ONLY in the following format:

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
`;

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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

    const text =
      result?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error("Gemini returned empty response");
    }

    const parsed = JSON.parse(text);
    res.json(parsed);
  } catch (err) {
    console.error("Analyze error:", err);
    res.status(500).json({ error: "Analysis failed" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log("ERDN server running on port", PORT)
);
