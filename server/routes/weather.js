const express = require("express");
const fetch = require("node-fetch");
const SearchHistory = require("../models/SearchHistory");

const router = express.Router();

const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";
const WEATHER_URL = "https://api.open-meteo.com/v1/forecast";

router.get("/search", async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) {
      return res.json({ results: [] });
    }

    const response = await fetch(
      `${GEOCODING_URL}?name=${encodeURIComponent(q)}&count=5&language=en&format=json`
    );
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("City search error:", error.message);
    res.status(500).json({ error: "Failed to search cities" });
  }
});

router.get("/forecast", async (req, res) => {
  try {
    const { lat, lon, city, country } = req.query;
    if (!lat || !lon) {
      return res.status(400).json({ error: "Latitude and longitude required" });
    }

    const params = new URLSearchParams({
      latitude: lat,
      longitude: lon,
      current:
        "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m",
      daily:
        "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max",
      timezone: "auto",
      forecast_days: "5",
    });

    const response = await fetch(`${WEATHER_URL}?${params}`);
    const data = await response.json();

    if (city) {
      try {
        await SearchHistory.create({
          cityName: city,
          latitude: parseFloat(lat),
          longitude: parseFloat(lon),
          country: country || "",
        });
      } catch {
        // Non-critical: don't fail the request if DB save fails
      }
    }

    res.json(data);
  } catch (error) {
    console.error("Weather fetch error:", error.message);
    res.status(500).json({ error: "Failed to fetch weather data" });
  }
});

router.get("/history", async (req, res) => {
  try {
    const history = await SearchHistory.find()
      .sort({ searchedAt: -1 })
      .limit(8)
      .lean();

    const unique = [];
    const seen = new Set();
    for (const item of history) {
      const key = `${item.cityName}-${item.country}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(item);
      }
    }

    res.json(unique.slice(0, 5));
  } catch (error) {
    res.json([]);
  }
});

module.exports = router;
