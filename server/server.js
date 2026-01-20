import { GoogleGenerativeAI } from "@google/generative-ai";
import cors from "cors";
import express from "express";
import multer from "multer";

const app = express();
const upload = multer();

app.use(cors());
app.use(express.json({ limit: "15mb" }));

const genAI = new GoogleGenerativeAI(process.env.EXPO_PUBLIC_GEMINI_API_KEY);

app.post("/analyze", upload.none(), async (req, res) => {
  try {
    const { image, age } = req.body;

    if (!image) {
      return res.status(400).json({ error: "Image missing" });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const prompt = `
You are a digital skincare analysis assistant.

Rules:
- NO brand names
- NOT medical advice
- Clear, confident, detailed tone
- Human-like explanations
- Practical routine

User age: ${age}

Analyze the face image and return STRICT JSON in this format:

{
  "skinProfile": {
    "type": "",
    "undertone": "",
    "concern": ""
  },
  "recommendedProducts": [
    "generic product type",
    "generic product type"
  ],
  "routine": {
    "day": [
      "step"
    ],
    "night": [
      "step"
    ]
  }
}
`;

    const result = await model.generateContent([
      {
        role: "user",
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
    ]);

    const text = result.response.text();
    const json = JSON.parse(text);

    res.json(json);
  } catch (err) {
    console.error("ANALYZE ERROR:", err);
    res.status(500).json({ error: "Analysis failed" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
