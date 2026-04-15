import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import SearchBar from "../components/SearchBar";

const mockSearchCities = jest.fn();

jest.mock("../utils/api", () => ({
  __esModule: true,
  searchCities: (...args) => mockSearchCities(...args),
}));

const mockCities = [
  { id: 1, name: "London", country: "United Kingdom", admin1: "England", latitude: 51.5, longitude: -0.12 },
  { id: 2, name: "London", country: "Canada", admin1: "Ontario", latitude: 42.9, longitude: -81.2 },
];

describe("SearchBar", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockSearchCities.mockReset();
    mockSearchCities.mockResolvedValue(mockCities);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("renders the search input and button", () => {
    render(<SearchBar onCitySelect={jest.fn()} />);
    expect(screen.getByPlaceholderText("Search for a city...")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /search/i })).toBeInTheDocument();
  });

  it("search button is disabled when input is empty", () => {
    render(<SearchBar onCitySelect={jest.fn()} />);
    expect(screen.getByRole("button", { name: /search/i })).toBeDisabled();
  });

  it("enables search button after typing 2+ characters", () => {
    render(<SearchBar onCitySelect={jest.fn()} />);
    fireEvent.change(screen.getByPlaceholderText("Search for a city..."), {
      target: { value: "Lo" },
    });
    expect(screen.getByRole("button", { name: /search/i })).not.toBeDisabled();
  });

  it("does not search when query is less than 2 characters", () => {
    render(<SearchBar onCitySelect={jest.fn()} />);
    fireEvent.change(screen.getByPlaceholderText("Search for a city..."), {
      target: { value: "L" },
    });
    act(() => { jest.advanceTimersByTime(300); });
    expect(mockSearchCities).not.toHaveBeenCalled();
  });

  it("shows dropdown results after typing", async () => {
    render(<SearchBar onCitySelect={jest.fn()} />);
    const input = screen.getByPlaceholderText("Search for a city...");

    fireEvent.change(input, { target: { value: "London" } });

    await act(async () => {
      jest.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(screen.getByText("United Kingdom")).toBeInTheDocument();
    });
    expect(screen.getAllByText("London")).toHaveLength(2);
  });

  it("calls onCitySelect when a dropdown item is clicked", async () => {
    const onCitySelect = jest.fn();
    render(<SearchBar onCitySelect={onCitySelect} />);
    const input = screen.getByPlaceholderText("Search for a city...");

    fireEvent.change(input, { target: { value: "London" } });

    await act(async () => {
      jest.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(screen.getByText("United Kingdom")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("United Kingdom"));

    expect(onCitySelect).toHaveBeenCalledWith(
      expect.objectContaining({ name: "London", country: "United Kingdom" })
    );
  });

  it("closes dropdown on Escape key", async () => {
    render(<SearchBar onCitySelect={jest.fn()} />);
    const input = screen.getByPlaceholderText("Search for a city...");

    fireEvent.change(input, { target: { value: "London" } });

    await act(async () => {
      jest.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(screen.getByText("United Kingdom")).toBeInTheDocument();
    });

    fireEvent.keyDown(input, { key: "Escape" });
    expect(screen.queryByText("United Kingdom")).not.toBeInTheDocument();
  });

  it("navigates dropdown with arrow keys", async () => {
    render(<SearchBar onCitySelect={jest.fn()} />);
    const input = screen.getByPlaceholderText("Search for a city...");

    fireEvent.change(input, { target: { value: "London" } });

    await act(async () => {
      jest.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(screen.getByText("United Kingdom")).toBeInTheDocument();
    });

    fireEvent.keyDown(input, { key: "ArrowDown" });
    const items = screen.getAllByRole("listitem");
    expect(items[0]).toHaveClass("active");

    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(items[1]).toHaveClass("active");
    expect(items[0]).not.toHaveClass("active");
  });

  it("selects first result when Search button is clicked", async () => {
    const onCitySelect = jest.fn();
    render(<SearchBar onCitySelect={onCitySelect} />);
    const input = screen.getByPlaceholderText("Search for a city...");

    fireEvent.change(input, { target: { value: "London" } });
    jest.useRealTimers();

    fireEvent.click(screen.getByRole("button", { name: /search/i }));

    await waitFor(() => {
      expect(onCitySelect).toHaveBeenCalledWith(
        expect.objectContaining({ name: "London" })
      );
    });
  });
});
