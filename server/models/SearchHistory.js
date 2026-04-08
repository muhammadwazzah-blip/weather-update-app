const mongoose = require("mongoose");

const searchHistorySchema = new mongoose.Schema({
  cityName: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  country: { type: String },
  searchedAt: { type: Date, default: Date.now },
});

searchHistorySchema.index({ searchedAt: -1 });

module.exports = mongoose.model("SearchHistory", searchHistorySchema);
