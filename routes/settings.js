const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload");

const {
  getSettings,
  updateSettings,
  createSettings,
} = require("../controllers/settings");

// Ayarları getir
router.get("/", getSettings);

// Ayarları oluştur
router.post("/", upload.single("logo"), createSettings);

// Ayarları güncelle (logo ile)
router.put("/", upload.single("logo"), updateSettings);

module.exports = router;
