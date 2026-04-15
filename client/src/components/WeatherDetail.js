import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getWeatherInfo } from "../utils/api";
import "./WeatherDetail.css";

const WIND_DIRECTIONS = [
  "N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE",
  "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW",
];

function getWindDirection(degrees) {
  if (degrees == null) return "N/A";
  const idx = Math.round(degrees / 22.5) % 16;
  return WIND_DIRECTIONS[idx];
}

function formatTime(isoString) {
  if (!isoString) return "";
  const d = new Date(isoString);
  return d.toLocaleString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function WeatherDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  const { weather, cityName } = location.state || {};

  if (!weather || !weather.current) {
    return (
      <div className="detail-page">
        <div className="detail-empty">
          <p>No weather data available.</p>
          <button className="detail-back-btn" onClick={() => navigate("/")}>
            Back to Search
          </button>
        </div>
      </div>
    );
  }

  const current = weather.current;
  const daily = weather.daily;
  const currentInfo = getWeatherInfo(current.weather_code);
  const windDir = getWindDirection(current.wind_direction_10m);

  const forecastDays = daily?.time?.map((date, i) => {
    const info = getWeatherInfo(daily.weather_code[i]);
    const d = new Date(date + "T00:00:00");
    return {
      date: d.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" }),
      shortDay: i === 0 ? "Today" : d.toLocaleDateString("en-US", { weekday: "short" }),
      icon: info.icon,
      label: info.label,
      high: Math.round(daily.temperature_2m_max[i]),
      low: Math.round(daily.temperature_2m_min[i]),
      precipitation: daily.precipitation_probability_max[i],
    };
  });

  return (
    <div className="detail-page">
      <button className="detail-back-btn" onClick={() => navigate("/")}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M15 18l-6-6 6-6" />
        </svg>
        Back
      </button>

      <div className="detail-hero">
        <span className="detail-hero-icon">{currentInfo.icon}</span>
        <div className="detail-hero-info">
          <span className="detail-hero-temp">{Math.round(current.temperature_2m)}°C</span>
          <span className="detail-hero-desc">{currentInfo.label}</span>
          <span className="detail-hero-city">{cityName}</span>
        </div>
      </div>

      {current.time && (
        <p className="detail-updated">Last updated: {formatTime(current.time)}</p>
      )}

      <section className="detail-section">
        <h3 className="detail-section-title">Current Conditions</h3>
        <div className="detail-grid">
          <div className="detail-stat">
            <span className="detail-stat-icon">🌡️</span>
            <div className="detail-stat-text">
              <span className="detail-stat-label">Feels Like</span>
              <span className="detail-stat-value">{Math.round(current.apparent_temperature)}°C</span>
            </div>
          </div>
          <div className="detail-stat">
            <span className="detail-stat-icon">💧</span>
            <div className="detail-stat-text">
              <span className="detail-stat-label">Humidity</span>
              <span className="detail-stat-value">{current.relative_humidity_2m}%</span>
            </div>
          </div>
          <div className="detail-stat">
            <span className="detail-stat-icon">💨</span>
            <div className="detail-stat-text">
              <span className="detail-stat-label">Wind Speed</span>
              <span className="detail-stat-value">{Math.round(current.wind_speed_10m)} km/h</span>
            </div>
          </div>
          <div className="detail-stat">
            <span className="detail-stat-icon">🧭</span>
            <div className="detail-stat-text">
              <span className="detail-stat-label">Wind Direction</span>
              <span className="detail-stat-value">{windDir} ({Math.round(current.wind_direction_10m)}°)</span>
            </div>
          </div>
          <div className="detail-stat">
            <span className="detail-stat-icon">🌡️</span>
            <div className="detail-stat-text">
              <span className="detail-stat-label">Temperature</span>
              <span className="detail-stat-value">{current.temperature_2m}°C</span>
            </div>
          </div>
          <div className="detail-stat">
            <span className="detail-stat-icon">📍</span>
            <div className="detail-stat-text">
              <span className="detail-stat-label">Coordinates</span>
              <span className="detail-stat-value">{weather.latitude?.toFixed(2)}°, {weather.longitude?.toFixed(2)}°</span>
            </div>
          </div>
        </div>
      </section>

      {forecastDays && forecastDays.length > 0 && (
        <section className="detail-section">
          <h3 className="detail-section-title">5-Day Forecast</h3>
          <div className="detail-forecast-list">
            {forecastDays.map((d) => (
              <div key={d.date} className="detail-forecast-row">
                <div className="detail-forecast-day-info">
                  <span className="detail-forecast-icon">{d.icon}</span>
                  <div className="detail-forecast-day-text">
                    <span className="detail-forecast-date">{d.date}</span>
                    <span className="detail-forecast-label">{d.label}</span>
                  </div>
                </div>
                <div className="detail-forecast-stats">
                  <span className="detail-forecast-high">{d.high}°</span>
                  <span className="detail-forecast-low">{d.low}°</span>
                  <span className="detail-forecast-precip">💧 {d.precipitation}%</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {weather.timezone && (
        <p className="detail-timezone">Timezone: {weather.timezone}</p>
      )}
    </div>
  );
}

export default WeatherDetail;
