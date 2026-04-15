import { getWeatherInfo } from "../utils/api";

describe("getWeatherInfo", () => {
  it("returns correct info for clear sky (code 0)", () => {
    const info = getWeatherInfo(0);
    expect(info.label).toBe("Clear sky");
    expect(info.icon).toBe("☀️");
  });

  it("returns correct info for thunderstorm (code 95)", () => {
    const info = getWeatherInfo(95);
    expect(info.label).toBe("Thunderstorm");
    expect(info.icon).toBe("⛈️");
  });

  it("returns correct info for heavy snow (code 75)", () => {
    const info = getWeatherInfo(75);
    expect(info.label).toBe("Heavy snow");
    expect(info.icon).toBe("❄️");
  });

  it('returns "Unknown" for unrecognized weather code', () => {
    const info = getWeatherInfo(999);
    expect(info.label).toBe("Unknown");
    expect(info.icon).toBe("❓");
  });

  it("handles undefined code", () => {
    const info = getWeatherInfo(undefined);
    expect(info.label).toBe("Unknown");
  });
});
