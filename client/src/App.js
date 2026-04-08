import React, { useState, useCallback } from "react";
import SearchBar from "./components/SearchBar";
import WeatherCard from "./components/WeatherCard";
import RecentSearches from "./components/RecentSearches";
import { getWeather } from "./utils/api";
import "./App.css";

function App() {
  const [weather, setWeather] = useState(null);
  const [cityName, setCityName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCitySelect = useCallback(async (city) => {
    setLoading(true);
    setError("");
    setCityName(`${city.name}, ${city.country || ""}`);
    try {
      const data = await getWeather(
        city.latitude,
        city.longitude,
        city.name,
        city.country
      );
      setWeather(data);
      setRefreshKey((k) => k + 1);
    } catch {
      setError("Unable to fetch weather data. Please try again.");
      setWeather(null);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className="app">
      <div className="app-bg" />
      <div className="app-content">
        <header className="app-header">
          <h1 className="app-title">
            <span className="title-icon">⛅</span> Weather Update
          </h1>
          <p className="app-subtitle">
            Search any city to get the current weather and 5-day forecast
          </p>
        </header>

        <SearchBar onCitySelect={handleCitySelect} />

        <RecentSearches
          onCitySelect={handleCitySelect}
          refreshKey={refreshKey}
        />

        {loading && (
          <div className="loading-state">
            <div className="loading-pulse" />
            <span>Fetching weather data...</span>
          </div>
        )}

        {error && <div className="error-state">{error}</div>}

        {!loading && weather && (
          <WeatherCard weather={weather} cityName={cityName} />
        )}
      </div>
    </div>
  );
}

export default App;
