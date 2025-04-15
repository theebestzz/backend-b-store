const Product = require("../models/product");
const slugify = require("slugify");

const fs = require("fs");
const path = require("path");

async function getProducts(req, res) {
  try {
    const products = await Product.find();

    if (!products) {
      return res.status(404).json({ message: "Ürün bulunamadı" });
    }

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Ürünler alınamadı" });
  }
}

async function getProductById(req, res) {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Ürün bulunamadı" });
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: "Ürün bulunamadı" });
  }
}

async function getProductBySlug(req, res) {
  try {
    const { slug } = req.params;
    const product = await Product.findOne({ slug });

    if (!product) {
      return res.status(404).json({ message: "Ürün bulunamadı" });
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: "Ürün bulunamadı" });
  }
}

async function createProduct(req, res) {
  try {
    // FormData ile gelen değerleri dönüştür
    const name = req.body.name;
    const description = req.body.description;
    const originalPrice = Number(req.body.originalPrice);
    const discountPrice = Number(req.body.discountPrice);
    const category = req.body.category;
    const gender = req.body.gender;
    const homeActive = req.body.homeActive === "true";
    const isFeatured = req.body.isFeatured === "true";
    const isActive = req.body.isActive === "true";
    const stock = Number(req.body.stock);
    const stars = Number(req.body.stars);

    // colors virgül ile geliyorsa ayır
    let colors = req.body.colors;
    if (typeof colors === "string") {
      colors = colors.split(",").map((c) => c.trim());
    }

    // resimler artık req.files içinde
    const images = req.uploadedFilenames;

    // Bu seferki validation güncellenmiş alanlara göre olmalı
    if (
      !name ||
      !description ||
      isNaN(originalPrice) ||
      isNaN(discountPrice) ||
      !category ||
      !gender ||
      typeof homeActive !== "boolean" ||
      typeof isFeatured !== "boolean" ||
      typeof isActive !== "boolean" ||
      isNaN(stock) ||
      isNaN(stars) ||
      !Array.isArray(colors) ||
      colors.length === 0 ||
      !Array.isArray(images) ||
      images.length === 0
    ) {
      return res.status(400).json({ message: "Tüm alanları doldurunuz" });
    }

    const slug = slugify(name, { lower: true, locale: "tr" });

    const existingProduct = await Product.findOne({ slug });
    if (existingProduct) {
      return res.status(400).json({ message: "Bu ürün zaten mevcut" });
    }

    const product = new Product({
      name,
      slug,
      description,
      originalPrice,
      discountPrice,
      category,
      gender,
      homeActive,
      isFeatured,
      isActive,
      stock,
      stars,
      colors,
      images,
    });

    await product.save();

    res.status(201).json({ message: "Ürün başarıyla oluşturuldu", product });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Ürün oluşturulamadı", error: error.message });
  }
}

async function updateProduct(req, res) {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      originalPrice,
      discountPrice,
      category,
      gender,
      homeActive,
      isFeatured,
      isActive,
      stock,
      stars,
      colors,
    } = req.body;

    // Get the existing product to preserve existing images
    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return res.status(404).json({ message: "Ürün bulunamadı" });
    }

    // Handle new uploaded images
    let updatedImages = [...existingProduct.images];
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file) => file.filename);
      updatedImages = [...updatedImages, ...newImages];
    }

    const product = await Product.findByIdAndUpdate(
      id,
      {
        name,
        description,
        originalPrice,
        discountPrice,
        category,
        images: updatedImages,
        gender,
        homeActive,
        isFeatured,
        isActive,
        stock,
        stars,
        colors,
      },
      { new: true }
    );

    res.status(200).json({ message: "Ürün başarıyla güncellendi", product });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Ürün güncellenemedi", error: error.message });
  }
}

async function deleteProduct(req, res) {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({ message: "Ürün bulunamadı" });
    }

    // Ürüne ait resimleri sil
    if (product.images && product.images.length > 0) {
      product.images.forEach((filename) => {
        const filePath = path.join("/var/www/cdn/uploads/", filename);
        fs.unlink(filePath, (err) => {
          if (err) {
            console.error("Resim silinirken hata oluştu:", err.message);
          }
        });
      });
    }

    res.status(200).json({ message: "Ürün ve resimleri silindi", product });
  } catch (error) {
    res.status(500).json({ message: "Ürün silinemedi", error: error.message });
  }
}

async function deleteProductImage(req, res) {
  try {
    const { productId, filename } = req.params;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Ürün bulunamadı" });
    }

    // Dosya dizinden sil
    const filePath = path.join("/var/www/cdn/uploads/", filename);
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error("Dosya silinemedi:", err.message);
      }
    });

    // DB'den çıkar
    product.images = product.images.filter((img) => img !== filename);
    await product.save();

    res
      .status(200)
      .json({ message: "Resim başarıyla silindi", images: product.images });
  } catch (error) {
    res.status(500).json({ message: "Resim silinemedi", error: error.message });
  }
}

module.exports = {
  createProduct,
  getProducts,
  updateProduct,
  getProductById,
  getProductBySlug,
  deleteProduct,
  deleteProductImage,
};
