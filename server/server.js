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
You are a premium digital skincare analyst working at the intersection of
a Vogue beauty editor and a modern clinical dermatologist.

You are analyzing a real human face image.

Core rules:
- Base all insights strictly on visible skin features
- Do not diagnose or reference medical conditions
- Do not mention brands or brand-like language
- Do not exaggerate or promise results
- Maintain a refined, confident, reassuring tone
- Write in clear, elegant, human language

User age: ${age}

Your objective:
Create an analysis that feels:
- Easy to understand
- Thoughtfully personalized
- Trustworthy and premium
- Suitable for a paid digital skincare experience

Guidance by section:

SKIN PROFILE:
- Clearly explain the skin type in plain language
- Describe undertone in a way a non-expert can understand
- Frame concerns as opportunities for refinement, not problems

RECOMMENDED PRODUCTS:
- Be specific about product PURPOSE
- Mention functional ingredients (e.g. vitamin C, ceramides, niacinamide)
- Mention SPF values when relevant (e.g. SPF 30+, broad-spectrum)
- Avoid vague wording

ROUTINE:
- Each step should briefly explain WHY it matters
- Keep routines realistic and simple
- Use reassuring, instructional language

Return ONLY valid JSON.
No markdown.
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

Tone reference examples (do NOT copy literally):
- “This skin type benefits from balance rather than correction.”
- “The undertone adds warmth and depth to the overall complexion.”
- “A consistent routine can enhance clarity and long-term skin comfort.”

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
