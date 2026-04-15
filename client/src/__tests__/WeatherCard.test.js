import React from "react";
import { render, screen } from "@testing-library/react";
import WeatherCard from "../components/WeatherCard";

const mockWeather = {
  current: {
    temperature_2m: 18.5,
    apparent_temperature: 16.2,
    relative_humidity_2m: 65,
    wind_speed_10m: 12.3,
    weather_code: 2,
    wind_direction_10m: 180,
  },
  daily: {
    time: ["2026-04-08", "2026-04-09", "2026-04-10", "2026-04-11", "2026-04-12"],
    weather_code: [2, 3, 61, 0, 1],
    temperature_2m_max: [20, 18, 15, 22, 21],
    temperature_2m_min: [12, 10, 8, 13, 11],
    precipitation_probability_max: [10, 30, 80, 5, 15],
  },
};

describe("WeatherCard", () => {
  it("renders nothing when weather is null", () => {
    const { container } = render(<WeatherCard weather={null} cityName="London" />);
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing when weather.current is missing", () => {
    const { container } = render(<WeatherCard weather={{}} cityName="London" />);
    expect(container.firstChild).toBeNull();
  });

  it("displays current temperature", () => {
    render(<WeatherCard weather={mockWeather} cityName="London, UK" />);
    expect(screen.getByText("19°C")).toBeInTheDocument();
  });

  it("displays city name", () => {
    render(<WeatherCard weather={mockWeather} cityName="London, UK" />);
    expect(screen.getByText("London, UK")).toBeInTheDocument();
  });

  it("displays feels like temperature", () => {
    render(<WeatherCard weather={mockWeather} cityName="London, UK" />);
    expect(screen.getByText("Feels like")).toBeInTheDocument();
    expect(screen.getByText("16°C")).toBeInTheDocument();
  });

  it("displays humidity", () => {
    render(<WeatherCard weather={mockWeather} cityName="London, UK" />);
    expect(screen.getByText("Humidity")).toBeInTheDocument();
    expect(screen.getByText("65%")).toBeInTheDocument();
  });

  it("displays wind speed", () => {
    render(<WeatherCard weather={mockWeather} cityName="London, UK" />);
    expect(screen.getByText("Wind")).toBeInTheDocument();
    expect(screen.getByText("12 km/h")).toBeInTheDocument();
  });

  it("displays weather description", () => {
    render(<WeatherCard weather={mockWeather} cityName="London, UK" />);
    expect(screen.getByText("Partly cloudy")).toBeInTheDocument();
  });

  it("renders 5-day forecast section", () => {
    render(<WeatherCard weather={mockWeather} cityName="London, UK" />);
    expect(screen.getByText("5-Day Forecast")).toBeInTheDocument();
    expect(screen.getByText("Today")).toBeInTheDocument();
  });

  it("displays forecast high and low temperatures", () => {
    render(<WeatherCard weather={mockWeather} cityName="London, UK" />);
    expect(screen.getByText("20°")).toBeInTheDocument();
    expect(screen.getByText("12°")).toBeInTheDocument();
  });
});
