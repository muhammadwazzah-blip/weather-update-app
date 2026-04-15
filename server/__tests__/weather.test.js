const request = require("supertest");
const app = require("../app");

jest.mock("node-fetch", () => jest.fn());
jest.mock("../models/SearchHistory");

const fetch = require("node-fetch");
const SearchHistory = require("../models/SearchHistory");

describe("GET /", () => {
  it("returns API running message", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Weather App API is running");
  });
});

describe("GET /api/weather/search", () => {
  afterEach(() => jest.clearAllMocks());

  it("returns empty results when query is missing", async () => {
    const res = await request(app).get("/api/weather/search");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ results: [] });
  });

  it("returns empty results when query is too short", async () => {
    const res = await request(app).get("/api/weather/search?q=a");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ results: [] });
  });

  it("proxies geocoding results from Open-Meteo", async () => {
    const mockResults = {
      results: [
        { id: 1, name: "London", country: "United Kingdom", latitude: 51.5, longitude: -0.12 },
      ],
    };
    fetch.mockResolvedValueOnce({
      json: async () => mockResults,
    });

    const res = await request(app).get("/api/weather/search?q=London");
    expect(res.status).toBe(200);
    expect(res.body.results).toHaveLength(1);
    expect(res.body.results[0].name).toBe("London");
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("geocoding-api.open-meteo.com")
    );
  });

  it("returns 500 when external API fails", async () => {
    fetch.mockRejectedValueOnce(new Error("Network error"));

    const res = await request(app).get("/api/weather/search?q=London");
    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Failed to search cities");
  });
});

describe("GET /api/weather/forecast", () => {
  afterEach(() => jest.clearAllMocks());

  it("returns 400 when lat/lon are missing", async () => {
    const res = await request(app).get("/api/weather/forecast");
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Latitude and longitude required");
  });

  it("returns 400 when only lat is provided", async () => {
    const res = await request(app).get("/api/weather/forecast?lat=51.5");
    expect(res.status).toBe(400);
  });

  it("returns weather data and saves to history", async () => {
    const mockWeather = {
      current: { temperature_2m: 15, weather_code: 0 },
      daily: { time: ["2026-04-08"], temperature_2m_max: [18], temperature_2m_min: [10] },
    };
    fetch.mockResolvedValueOnce({
      json: async () => mockWeather,
    });
    SearchHistory.create.mockResolvedValueOnce({});

    const res = await request(app).get(
      "/api/weather/forecast?lat=51.5&lon=-0.12&city=London&country=UK"
    );
    expect(res.status).toBe(200);
    expect(res.body.current.temperature_2m).toBe(15);
    expect(SearchHistory.create).toHaveBeenCalledWith(
      expect.objectContaining({ cityName: "London", country: "UK" })
    );
  });

  it("returns weather even when DB save fails", async () => {
    const mockWeather = { current: { temperature_2m: 20 } };
    fetch.mockResolvedValueOnce({
      json: async () => mockWeather,
    });
    SearchHistory.create.mockRejectedValueOnce(new Error("DB down"));

    const res = await request(app).get(
      "/api/weather/forecast?lat=51.5&lon=-0.12&city=London"
    );
    expect(res.status).toBe(200);
    expect(res.body.current.temperature_2m).toBe(20);
  });

  it("skips DB save when city is not provided", async () => {
    const mockWeather = { current: { temperature_2m: 22 } };
    fetch.mockResolvedValueOnce({
      json: async () => mockWeather,
    });

    const res = await request(app).get("/api/weather/forecast?lat=51.5&lon=-0.12");
    expect(res.status).toBe(200);
    expect(SearchHistory.create).not.toHaveBeenCalled();
  });

  it("returns 500 when external API fails", async () => {
    fetch.mockRejectedValueOnce(new Error("Timeout"));

    const res = await request(app).get("/api/weather/forecast?lat=51.5&lon=-0.12");
    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Failed to fetch weather data");
  });
});

describe("GET /api/weather/history", () => {
  afterEach(() => jest.clearAllMocks());

  it("returns deduplicated recent searches", async () => {
    const mockHistory = [
      { _id: "1", cityName: "London", country: "UK", latitude: 51.5, longitude: -0.12 },
      { _id: "2", cityName: "London", country: "UK", latitude: 51.5, longitude: -0.12 },
      { _id: "3", cityName: "Paris", country: "France", latitude: 48.8, longitude: 2.3 },
    ];
    SearchHistory.find.mockReturnValue({
      sort: jest.fn().mockReturnValue({
        limit: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(mockHistory),
        }),
      }),
    });

    const res = await request(app).get("/api/weather/history");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body[0].cityName).toBe("London");
    expect(res.body[1].cityName).toBe("Paris");
  });

  it("returns empty array when DB throws", async () => {
    SearchHistory.find.mockReturnValue({
      sort: jest.fn().mockReturnValue({
        limit: jest.fn().mockReturnValue({
          lean: jest.fn().mockRejectedValue(new Error("DB error")),
        }),
      }),
    });

    const res = await request(app).get("/api/weather/history");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("limits results to 5 unique cities", async () => {
    const mockHistory = Array.from({ length: 8 }, (_, i) => ({
      _id: String(i),
      cityName: `City${i}`,
      country: "X",
      latitude: i,
      longitude: i,
    }));
    SearchHistory.find.mockReturnValue({
      sort: jest.fn().mockReturnValue({
        limit: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(mockHistory),
        }),
      }),
    });

    const res = await request(app).get("/api/weather/history");
    expect(res.status).toBe(200);
    expect(res.body.length).toBeLessThanOrEqual(5);
  });
});
