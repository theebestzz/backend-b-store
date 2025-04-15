const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload");

const {
  createProduct,
  getProducts,
  updateProduct,
  getProductById,
  getProductBySlug,
  deleteProduct,
  deleteProductImage,
} = require("../controllers/product");

router.get("/", getProducts);

router.get("/:id", getProductById);

router.get("/slug/:slug", getProductBySlug);

router.post("/", upload.array("images", 5), createProduct);

router.put("/:id", upload.array("images", 5), updateProduct);

router.delete("/:id", deleteProduct);

router.delete("/:productId/image/:filename", deleteProductImage);

module.exports = router;
