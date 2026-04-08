const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5001/api";

async function safeFetch(url) {
  const res = await fetch(url);
  const text = await res.text();
  if (!res.ok) throw new Error(text || res.statusText);
  if (!text) return null;
  return JSON.parse(text);
}

export async function searchCities(query) {
  if (!query || query.length < 2) return [];
  try {
    const data = await safeFetch(
      `${API_BASE}/weather/search?q=${encodeURIComponent(query)}`
    );
    return data?.results || [];
  } catch {
    return [];
  }
}

export async function getWeather(lat, lon, city, country) {
  const params = new URLSearchParams({
    lat,
    lon,
    city: city || "",
    country: country || "",
  });
  return safeFetch(`${API_BASE}/weather/forecast?${params}`);
}

export async function getSearchHistory() {
  try {
    const data = await safeFetch(`${API_BASE}/weather/history`);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

const WMO_CODES = {
  0: { label: "Clear sky", icon: "☀️" },
  1: { label: "Mainly clear", icon: "🌤️" },
  2: { label: "Partly cloudy", icon: "⛅" },
  3: { label: "Overcast", icon: "☁️" },
  45: { label: "Foggy", icon: "🌫️" },
  48: { label: "Depositing rime fog", icon: "🌫️" },
  51: { label: "Light drizzle", icon: "🌦️" },
  53: { label: "Moderate drizzle", icon: "🌦️" },
  55: { label: "Dense drizzle", icon: "🌦️" },
  61: { label: "Slight rain", icon: "🌧️" },
  63: { label: "Moderate rain", icon: "🌧️" },
  65: { label: "Heavy rain", icon: "🌧️" },
  71: { label: "Slight snow", icon: "🌨️" },
  73: { label: "Moderate snow", icon: "🌨️" },
  75: { label: "Heavy snow", icon: "❄️" },
  77: { label: "Snow grains", icon: "❄️" },
  80: { label: "Slight showers", icon: "🌦️" },
  81: { label: "Moderate showers", icon: "🌧️" },
  82: { label: "Violent showers", icon: "⛈️" },
  85: { label: "Slight snow showers", icon: "🌨️" },
  86: { label: "Heavy snow showers", icon: "❄️" },
  95: { label: "Thunderstorm", icon: "⛈️" },
  96: { label: "Thunderstorm with hail", icon: "⛈️" },
  99: { label: "Thunderstorm with heavy hail", icon: "⛈️" },
};

export function getWeatherInfo(code) {
  return WMO_CODES[code] || { label: "Unknown", icon: "❓" };
}
