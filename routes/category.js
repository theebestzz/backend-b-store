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

router.post("/", upload.single("image"), uploadToBunny, createCategory);

router.get("/:id", getCategoryById);

router.get("/slug/:slug", getCategoryBySlug);

router.put("/:id", upload.single("image"), uploadToBunny, updateCategory);

router.delete("/:id", deleteCategory);

router.delete("/:id/image", deleteCategoryImage);

module.exports = router;
