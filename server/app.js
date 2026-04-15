const express = require("express");
const cors = require("cors");
const weatherRoutes = require("./routes/weather");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/weather", weatherRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Weather App API is running" });
});

module.exports = app;
