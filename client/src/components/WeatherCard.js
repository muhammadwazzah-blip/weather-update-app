import React from "react";
import { useNavigate } from "react-router-dom";
import { getWeatherInfo } from "../utils/api";
import "./WeatherCard.css";

function WeatherCard({ weather, cityName }) {
  const navigate = useNavigate();

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

  const handleClick = () => {
    navigate("/weather/detail", { state: { weather, cityName } });
  };

  return (
    <div className="weather-card weather-card-clickable" onClick={handleClick} role="link" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && handleClick()}>
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

      <div className="weather-card-hint">
        <span>Tap for details</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </div>
    </div>
  );
}

export default WeatherCard;
