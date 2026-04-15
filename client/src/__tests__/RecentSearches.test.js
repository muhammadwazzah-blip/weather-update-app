import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import RecentSearches from "../components/RecentSearches";

jest.mock("../utils/api", () => ({
  getSearchHistory: jest.fn(),
}));

const { getSearchHistory } = require("../utils/api");

const mockHistory = [
  { _id: "1", cityName: "London", country: "UK", latitude: 51.5, longitude: -0.12 },
  { _id: "2", cityName: "Paris", country: "France", latitude: 48.8, longitude: 2.3 },
];

describe("RecentSearches", () => {
  afterEach(() => jest.clearAllMocks());

  it("renders nothing when history is empty", async () => {
    getSearchHistory.mockResolvedValue([]);
    const { container } = render(
      <RecentSearches onCitySelect={jest.fn()} refreshKey={0} />
    );
    await waitFor(() => expect(getSearchHistory).toHaveBeenCalled());
    expect(container.querySelector(".recent-searches")).not.toBeInTheDocument();
  });

  it("renders recent search chips", async () => {
    getSearchHistory.mockResolvedValue(mockHistory);
    render(<RecentSearches onCitySelect={jest.fn()} refreshKey={0} />);

    await waitFor(() => {
      expect(screen.getByText("London")).toBeInTheDocument();
    });
    expect(screen.getByText("Paris")).toBeInTheDocument();
    expect(screen.getByText("Recent Searches")).toBeInTheDocument();
  });

  it("displays country badge on chips", async () => {
    getSearchHistory.mockResolvedValue(mockHistory);
    render(<RecentSearches onCitySelect={jest.fn()} refreshKey={0} />);

    await waitFor(() => {
      expect(screen.getByText("UK")).toBeInTheDocument();
    });
    expect(screen.getByText("France")).toBeInTheDocument();
  });

  it("calls onCitySelect when chip is clicked", async () => {
    getSearchHistory.mockResolvedValue(mockHistory);
    const onCitySelect = jest.fn();
    render(<RecentSearches onCitySelect={onCitySelect} refreshKey={0} />);

    await waitFor(() => {
      expect(screen.getByText("London")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("London"));
    expect(onCitySelect).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "London",
        latitude: 51.5,
        longitude: -0.12,
        country: "UK",
      })
    );
  });

  it("refetches history when refreshKey changes", async () => {
    getSearchHistory.mockResolvedValue(mockHistory);
    const { rerender } = render(
      <RecentSearches onCitySelect={jest.fn()} refreshKey={0} />
    );
    await waitFor(() => expect(getSearchHistory).toHaveBeenCalledTimes(1));

    rerender(<RecentSearches onCitySelect={jest.fn()} refreshKey={1} />);
    await waitFor(() => expect(getSearchHistory).toHaveBeenCalledTimes(2));
  });

  it("handles non-array API response gracefully", async () => {
    getSearchHistory.mockResolvedValue("not-an-array");
    const { container } = render(
      <RecentSearches onCitySelect={jest.fn()} refreshKey={0} />
    );
    await waitFor(() => expect(getSearchHistory).toHaveBeenCalled());
    expect(container.querySelector(".recent-searches")).not.toBeInTheDocument();
  });
});
