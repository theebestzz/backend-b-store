const express = require("express");
const router = express.Router();
const { upload, uploadToBunny } = require("../middlewares/upload");

const {
  getSettings,
  updateSettings,
  createSettings,
} = require("../controllers/settings");

// Ayarları getir
router.get("/", getSettings);

router.post("/", upload.single("logo"), uploadToBunny, createSettings);

router.put("/", upload.single("logo"), uploadToBunny, updateSettings);

module.exports = router;
