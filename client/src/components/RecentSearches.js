import React, { useState, useEffect } from "react";
import { getSearchHistory } from "../utils/api";
import "./RecentSearches.css";

function RecentSearches({ onCitySelect, refreshKey }) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    getSearchHistory().then((data) => {
      if (Array.isArray(data)) setHistory(data);
    });
  }, [refreshKey]);

  if (history.length === 0) return null;

  return (
    <div className="recent-searches">
      <h3 className="recent-title">Recent Searches</h3>
      <div className="recent-chips">
        {history.map((item) => (
          <button
            key={item._id}
            className="recent-chip"
            onClick={() =>
              onCitySelect({
                name: item.cityName,
                latitude: item.latitude,
                longitude: item.longitude,
                country: item.country,
              })
            }
          >
            {item.cityName}
            {item.country && (
              <span className="chip-country">{item.country}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

export default RecentSearches;
