const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;

dotenv.config();

const connectDB = require("./config/connect");
const productRoutes = require("./routes/product");
const categoryRoutes = require("./routes/category");
const settingsRoutes = require("./routes/settings");

connectDB();

const corsOptions = {
  origin: "https://bulutcanta.com",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.disable("x-powered-by");

app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/uploads", express.static("uploads"));

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
