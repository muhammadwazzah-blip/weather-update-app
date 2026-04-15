import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import App from "../App";

jest.mock("../utils/api", () => ({
  __esModule: true,
  searchCities: jest.fn().mockResolvedValue([]),
  getWeather: jest.fn().mockResolvedValue(null),
  getSearchHistory: jest.fn().mockResolvedValue([]),
  getWeatherInfo: jest.fn().mockReturnValue({ label: "Clear", icon: "☀️" }),
}));

describe("App", () => {
  it("renders the app title", async () => {
    render(<App />);
    expect(screen.getByText("Weather Update")).toBeInTheDocument();
    await waitFor(() => {});
  });

  it("renders the subtitle", async () => {
    render(<App />);
    expect(
      screen.getByText("Search any city to get the current weather and 5-day forecast")
    ).toBeInTheDocument();
    await waitFor(() => {});
  });

  it("renders the search bar", async () => {
    render(<App />);
    expect(screen.getByPlaceholderText("Search for a city...")).toBeInTheDocument();
    await waitFor(() => {});
  });

  it("does not show weather card initially", async () => {
    render(<App />);
    expect(screen.queryByText("5-Day Forecast")).not.toBeInTheDocument();
    await waitFor(() => {});
  });

  it("does not show loading state initially", async () => {
    render(<App />);
    expect(screen.queryByText("Fetching weather data...")).not.toBeInTheDocument();
    await waitFor(() => {});
  });

  it("does not show error state initially", async () => {
    const { container } = render(<App />);
    expect(container.querySelector(".error-state")).not.toBeInTheDocument();
    await waitFor(() => {});
  });
});
