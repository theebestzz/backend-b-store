const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    originalPrice: {
      type: Number,
      required: true,
    },
    discountPrice: {
      type: Number,
      required: true,
    },
    colors: {
      type: [String],
      required: true,
    },
    gender: {
      type: String,
      required: true,
    },
    homeActive: {
      type: Boolean,
      required: true,
    },
    isFeatured: {
      type: Boolean,
      required: true,
    },
    isActive: {
      type: Boolean,
      required: true,
    },
    stock: {
      type: Number,
      required: true,
    },
    stars: {
      type: Number,
      required: true,
    },
    images: {
      type: [String],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
