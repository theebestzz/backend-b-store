const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const app = express();

const port = process.env.PORT || 5000;
const siteUrl = process.env.SITE_URL;

dotenv.config();

const connectDB = require("./config/connect");

const productRoutes = require("./routes/product");
const categoryRoutes = require("./routes/category");
const settingsRoutes = require("./routes/settings");

connectDB();

const corsOptions = {
  origin: [siteUrl, "http://localhost:3000"],
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
