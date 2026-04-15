const mongoose = require("mongoose");
require("dotenv").config();

const app = require("./app");
const PORT = process.env.PORT || 5001;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB connection error:", err.message));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
