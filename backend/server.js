
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const feedbackSchema = new mongoose.Schema({
  courseName: { type: String, required: true, trim: true },
  comments: { type: String, required: true, trim: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  courseDuration: { type: String, default: "Not specified" }
}, { timestamps: true });

const Feedback = mongoose.model("Feedback", feedbackSchema);

app.get("/api/health", (req, res) => {
  res.json({ message: "Feedback API is running" });
});

app.get("/api/feedback", async (req, res) => {
  try {
    res.json(await Feedback.find().sort({ createdAt: -1 }));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/feedback", async (req, res) => {
  try {
    const feedback = await Feedback.create(req.body);
    res.status(201).json(feedback);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.put("/api/feedback/:id", async (req, res) => {
  try {
    const feedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    res.json(feedback);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.delete("/api/feedback/:id", async (req, res) => {
  try {
    const feedback = await Feedback.findByIdAndDelete(req.params.id);

    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    res.json({ message: "Feedback deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected successfully");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(error => {
    console.error("MongoDB connection failed:", error.message);
  });
