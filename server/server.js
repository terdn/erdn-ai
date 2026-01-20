import cors from "cors";
import dotenv from "dotenv";
import express from "express";

dotenv.config();

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

    // 🔥 ŞİMDİLİK SABİT AMA DOĞRU FORMAT
    // Gemini bağlı olsa bile frontend BUNU ister
    res.json({
      skinProfile: {
        type: "Combination skin",
        undertone: "Neutral-Warm",
        concern: "Mild congestion on lower face",
      },
      recommendedProducts: [
        "Gentle cleansing gel",
        "Hydrating serum",
        "Lightweight moisturizer",
      ],
      routine: {
        day: [
          "Cleanse gently",
          "Apply hydrating serum",
          "Use SPF 30+ sunscreen",
        ],
        night: [
          "Cleanse thoroughly",
          "Targeted treatment on congested areas",
          "Moisturize",
        ],
      },
      meta: {
        age,
        ai: "gemini-2.5-flash",
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Analysis failed" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
