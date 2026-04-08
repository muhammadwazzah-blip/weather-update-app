import React, { useState, useRef, useEffect, useCallback } from "react";
import { searchCities } from "../utils/api";
import "./SearchBar.css";

function SearchBar({ onCitySelect }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const wrapperRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const doSearch = useCallback(async (value) => {
    if (value.length < 2) {
      setResults([]);
      setIsOpen(false);
      return [];
    }
    setLoading(true);
    try {
      const cities = await searchCities(value);
      setResults(cities);
      setIsOpen(cities.length > 0);
      setActiveIndex(-1);
      return cities;
    } catch {
      setResults([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(value), 300);
  };

  const handleSelect = (city) => {
    setQuery(`${city.name}, ${city.country}`);
    setIsOpen(false);
    setResults([]);
    onCitySelect(city);
  };

  const handleSearch = async () => {
    if (query.length < 2) return;
    if (activeIndex >= 0 && results[activeIndex]) {
      handleSelect(results[activeIndex]);
      return;
    }
    const cities = await doSearch(query);
    if (cities.length > 0) {
      handleSelect(cities[0]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
      return;
    }
    if (!isOpen) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div className="search-bar" ref={wrapperRef}>
      <div className="search-input-wrapper">
        <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          type="text"
          className="search-input"
          placeholder="Search for a city..."
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => results.length > 0 && setIsOpen(true)}
        />
        {loading && <span className="search-spinner" />}
        <button
          className="search-button"
          onClick={handleSearch}
          disabled={query.length < 2}
          aria-label="Search"
        >
          Search
        </button>
      </div>

      {isOpen && (
        <ul className="search-dropdown">
          {results.map((city, idx) => (
            <li
              key={city.id}
              className={`search-item ${idx === activeIndex ? "active" : ""}`}
              onClick={() => handleSelect(city)}
              onMouseEnter={() => setActiveIndex(idx)}
            >
              <span className="city-name">{city.name}</span>
              <span className="city-meta">
                {city.admin1 ? `${city.admin1}, ` : ""}
                {city.country}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SearchBar;
