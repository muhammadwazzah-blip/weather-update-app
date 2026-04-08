const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const weatherRoutes = require("./routes/weather");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB connection error:", err.message));

app.use("/api/weather", weatherRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Weather App API is running" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
