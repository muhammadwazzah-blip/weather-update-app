import React from "react";
import { getWeatherInfo } from "../utils/api";
import "./WeatherCard.css";

function WeatherCard({ weather, cityName }) {
  if (!weather || !weather.current) return null;

  const current = weather.current;
  const daily = weather.daily;
  const currentInfo = getWeatherInfo(current.weather_code);

  const days = daily?.time?.map((date, i) => {
    const info = getWeatherInfo(daily.weather_code[i]);
    const d = new Date(date + "T00:00:00");
    const dayName =
      i === 0
        ? "Today"
        : d.toLocaleDateString("en-US", { weekday: "short" });
    return {
      day: dayName,
      icon: info.icon,
      label: info.label,
      high: Math.round(daily.temperature_2m_max[i]),
      low: Math.round(daily.temperature_2m_min[i]),
      precipitation: daily.precipitation_probability_max[i],
    };
  });

  return (
    <div className="weather-card">
      <div className="weather-current">
        <div className="weather-main">
          <span className="weather-emoji">{currentInfo.icon}</span>
          <div className="weather-temp-block">
            <span className="weather-temp">
              {Math.round(current.temperature_2m)}°C
            </span>
            <span className="weather-desc">{currentInfo.label}</span>
          </div>
        </div>

        <div className="weather-city">{cityName}</div>

        <div className="weather-details">
          <div className="detail-item">
            <span className="detail-label">Feels like</span>
            <span className="detail-value">
              {Math.round(current.apparent_temperature)}°C
            </span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Humidity</span>
            <span className="detail-value">
              {current.relative_humidity_2m}%
            </span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Wind</span>
            <span className="detail-value">
              {Math.round(current.wind_speed_10m)} km/h
            </span>
          </div>
        </div>
      </div>

      {days && days.length > 0 && (
        <div className="weather-forecast">
          <h3 className="forecast-title">5-Day Forecast</h3>
          <div className="forecast-grid">
            {days.map((d) => (
              <div key={d.day} className="forecast-day">
                <span className="forecast-day-name">{d.day}</span>
                <span className="forecast-icon">{d.icon}</span>
                <div className="forecast-temps">
                  <span className="temp-high">{d.high}°</span>
                  <span className="temp-low">{d.low}°</span>
                </div>
                <span className="forecast-precip">💧 {d.precipitation}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default WeatherCard;
