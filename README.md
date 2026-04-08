# Weather Update App

A full-stack MERN weather application. Search any city and get current weather conditions with a 5-day forecast.

**Tech Stack:** MongoDB, Express.js, React, Node.js  
**Weather API:** [Open-Meteo](https://open-meteo.com/) (free, no API key required)

## Features

- City search with autocomplete (powered by Open-Meteo Geocoding API)
- Current weather: temperature, feels like, humidity, wind speed
- 5-day forecast with highs, lows, and precipitation probability
- Recent search history stored in MongoDB
- Responsive design with a modern dark UI

## Prerequisites

- **Node.js** v16+
- **MongoDB** running locally on port 27017 (or update `MONGODB_URI` in `server/.env`)

## Quick Start

```bash
# Install all dependencies (root + server + client)
npm run install-all

# Start both server and client in development mode
npm run dev
```

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000

## Project Structure

```
├── server/             # Express backend
│   ├── index.js        # Server entry point
│   ├── models/         # Mongoose models
│   ├── routes/         # API routes
│   └── .env            # Environment config
├── client/             # React frontend
│   ├── public/
│   └── src/
│       ├── components/ # React components
│       ├── utils/      # API helpers
│       ├── App.js      # Root component
│       └── App.css     # Global styles
└── package.json        # Root scripts (concurrently)
```

## API Endpoints

| Endpoint | Description |
|---|---|
| `GET /api/weather/search?q=city` | Search cities by name |
| `GET /api/weather/forecast?lat=&lon=&city=&country=` | Get weather forecast |
| `GET /api/weather/history` | Get recent search history |
