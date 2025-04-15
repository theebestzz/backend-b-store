const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
    logo: {
      type: String,
      default: "",
    },
    name: {
      type: String,
      default: "Bulut Çanta",
    },
    adres: {
      type: String,
      default: "",
    },
    iletisim: {
      type: String,
      default: "",
    },
    email: {
      type: String,
      default: "",
    },
    calisma_saatleri: {
      type: String,
      default: "",
    },
    instagram: {
      type: String,
      default: "",
    },
    facebook: {
      type: String,
      default: "",
    },
    twitter: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Settings", settingsSchema);
