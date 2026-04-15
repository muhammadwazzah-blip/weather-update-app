describe("Weather App E2E", () => {
  beforeEach(() => {
    cy.intercept("GET", "**/api/weather/history", { body: [] }).as("getHistory");
    cy.visit("/");
  });

  describe("Page Load", () => {
    it("displays the app title and subtitle", () => {
      cy.contains("Weather Update").should("be.visible");
      cy.contains("Search any city to get the current weather and 5-day forecast").should(
        "be.visible"
      );
    });

    it("shows a search input and disabled search button", () => {
      cy.get(".search-input").should("be.visible").and("have.attr", "placeholder", "Search for a city...");
      cy.get(".search-button").should("be.visible").and("be.disabled");
    });

    it("does not show weather card on initial load", () => {
      cy.get(".weather-card").should("not.exist");
    });
  });

  describe("City Search", () => {
    beforeEach(() => {
      cy.intercept("GET", "**/api/weather/search*", {
        fixture: "searchResults.json",
      }).as("searchCities");
    });

    it("shows autocomplete suggestions after typing", () => {
      cy.get(".search-input").type("London");
      cy.wait("@searchCities");
      cy.get(".search-dropdown").should("be.visible");
      cy.get(".search-item").should("have.length", 2);
      cy.contains("United Kingdom").should("be.visible");
      cy.contains("Canada").should("be.visible");
    });

    it("enables search button after typing 2+ characters", () => {
      cy.get(".search-input").type("Lo");
      cy.get(".search-button").should("not.be.disabled");
    });

    it("keeps search button disabled with single character", () => {
      cy.get(".search-input").type("L");
      cy.get(".search-button").should("be.disabled");
    });

    it("closes dropdown on Escape", () => {
      cy.get(".search-input").type("London");
      cy.wait("@searchCities");
      cy.get(".search-dropdown").should("be.visible");
      cy.get(".search-input").type("{esc}");
      cy.get(".search-dropdown").should("not.exist");
    });

    it("highlights items with arrow keys", () => {
      cy.get(".search-input").type("London");
      cy.wait("@searchCities");
      cy.get(".search-input").type("{downarrow}");
      cy.get(".search-item").first().should("have.class", "active");
      cy.get(".search-input").type("{downarrow}");
      cy.get(".search-item").last().should("have.class", "active");
    });
  });

  describe("Weather Display", () => {
    beforeEach(() => {
      cy.intercept("GET", "**/api/weather/search*", {
        fixture: "searchResults.json",
      }).as("searchCities");

      cy.intercept("GET", "**/api/weather/forecast*", {
        fixture: "forecastResult.json",
      }).as("getForecast");
    });

    it("shows weather card after selecting a city from dropdown", () => {
      cy.get(".search-input").type("London");
      cy.wait("@searchCities");
      cy.contains(".search-item", "United Kingdom").click();
      cy.wait("@getForecast");

      cy.get(".weather-card").should("be.visible");
      cy.contains("14°C").should("be.visible");
      cy.contains("London, United Kingdom").should("be.visible");
    });

    it("displays current weather details", () => {
      cy.get(".search-input").type("London");
      cy.wait("@searchCities");
      cy.contains(".search-item", "United Kingdom").click();
      cy.wait("@getForecast");

      cy.contains("Feels like").should("be.visible");
      cy.contains("12°C").should("be.visible");
      cy.contains("Humidity").should("be.visible");
      cy.contains("72%").should("be.visible");
      cy.contains("Wind").should("be.visible");
      cy.contains("19 km/h").should("be.visible");
    });

    it("displays 5-day forecast", () => {
      cy.get(".search-input").type("London");
      cy.wait("@searchCities");
      cy.contains(".search-item", "United Kingdom").click();
      cy.wait("@getForecast");

      cy.contains("5-Day Forecast").should("be.visible");
      cy.contains("Today").should("be.visible");
      cy.get(".forecast-day").should("have.length", 5);
    });

    it("shows weather after clicking the Search button", () => {
      cy.get(".search-input").type("London");
      cy.get(".search-button").click();
      cy.wait("@searchCities");
      cy.wait("@getForecast");

      cy.get(".weather-card").should("be.visible");
      cy.contains("14°C").should("be.visible");
    });

    it("shows weather after pressing Enter", () => {
      cy.get(".search-input").type("London{enter}");
      cy.wait("@searchCities");
      cy.wait("@getForecast");

      cy.get(".weather-card").should("be.visible");
    });

    it("shows loading state while fetching", () => {
      cy.intercept("GET", "**/api/weather/forecast*", {
        fixture: "forecastResult.json",
        delay: 1000,
      }).as("slowForecast");

      cy.get(".search-input").type("London");
      cy.wait("@searchCities");
      cy.contains(".search-item", "United Kingdom").click();

      cy.contains("Fetching weather data...").should("be.visible");
      cy.wait("@slowForecast");
      cy.contains("Fetching weather data...").should("not.exist");
    });
  });

  describe("Error Handling", () => {
    it("shows error message when forecast API fails", () => {
      cy.intercept("GET", "**/api/weather/search*", {
        fixture: "searchResults.json",
      }).as("searchCities");

      cy.intercept("GET", "**/api/weather/forecast*", {
        statusCode: 500,
        body: { error: "Failed to fetch weather data" },
      }).as("failedForecast");

      cy.get(".search-input").type("London");
      cy.wait("@searchCities");
      cy.contains(".search-item", "United Kingdom").click();
      cy.wait("@failedForecast");

      cy.get(".error-state").should("be.visible");
      cy.contains("Unable to fetch weather data").should("be.visible");
    });

    it("does not show weather card on error", () => {
      cy.intercept("GET", "**/api/weather/search*", {
        fixture: "searchResults.json",
      }).as("searchCities");

      cy.intercept("GET", "**/api/weather/forecast*", {
        statusCode: 500,
        body: {},
      }).as("failedForecast");

      cy.get(".search-input").type("London");
      cy.wait("@searchCities");
      cy.contains(".search-item", "United Kingdom").click();
      cy.wait("@failedForecast");

      cy.get(".weather-card").should("not.exist");
    });
  });

  describe("Search Again", () => {
    it("replaces weather card when searching for a new city", () => {
      cy.intercept("GET", "**/api/weather/search*", {
        fixture: "searchResults.json",
      }).as("searchCities");

      cy.intercept("GET", "**/api/weather/forecast*", {
        fixture: "forecastResult.json",
      }).as("getForecast");

      cy.get(".search-input").type("London");
      cy.wait("@searchCities");
      cy.contains(".search-item", "United Kingdom").click();
      cy.wait("@getForecast");
      cy.contains("London, United Kingdom").should("be.visible");

      cy.get(".search-input").clear().type("London");
      cy.wait("@searchCities");
      cy.contains(".search-item", "Canada").click();
      cy.wait("@getForecast");
      cy.contains("London, Canada").should("be.visible");
    });
  });
});
