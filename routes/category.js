const express = require("express");
const router = express.Router();
const { upload, uploadToBunny } = require("../middlewares/upload");

const {
  createCategory,
  getCategories,
  getCategoryById,
  getCategoryBySlug,
  updateCategory,
  deleteCategory,
  deleteCategoryImage,
} = require("../controllers/category");

router.get("/", getCategories);

// Resim yükleme özelliği ile kategori oluşturma
router.post("/", upload.single("image"), uploadToBunny, createCategory);

router.get("/:id", getCategoryById);

router.get("/slug/:slug", getCategoryBySlug);

// Resim yükleme özelliği ile kategori güncelleme
router.put("/:id", upload.single("image"), uploadToBunny, updateCategory);

router.delete("/:id", deleteCategory);

// Kategori resmini silme endpoint'i
router.delete("/:id/image", deleteCategoryImage);

module.exports = router;
