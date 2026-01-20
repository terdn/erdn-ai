import cors from "cors";
import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.get("/", (req, res) => {
  res.json({ status: "ERDN backend running" });
});

app.post("/analyze", async (req, res) => {
  const { image, age } = req.body;

  if (!image) {
    return res.status(400).json({ error: "No image provided" });
  }

  const prompt = `
Analyze the user's facial skin from the image.
Return STRICT JSON only.

Format:
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
  },
  "meta": {
    "age": ${age},
    "ai": "gemini-2.5-flash"
  }
}
`;

  const geminiRes = await fetch(
    "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=" +
      process.env.GEMINI_API_KEY,
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

  const data = await geminiRes.json();
  const text = data.candidates[0].content.parts[0].text;

  res.json(JSON.parse(text));
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server running");
});
