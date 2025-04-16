const Category = require("../models/category");
const slugify = require("slugify");
const fs = require("fs");
const path = require("path");
const axios = require("axios");

const BUNNY_API_KEY = process.env.BUNNY_API_KEY;
const BUNNY_STORAGE_ZONE = process.env.BUNNY_STORAGE_ZONE_NAME;

async function getCategories(req, res) {
  try {
    const categories = await Category.find();

    if (!categories) {
      return res.status(404).json({ message: "Kategori bulunamadı" });
    }

    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: "Kategoriler alınamadı" });
  }
}

async function createCategory(req, res) {
  try {
    const { name } = req.body;

    const slug = slugify(name, { lower: true, locale: "tr" });

    if (!name) {
      return res.status(400).json({ message: "Tüm alanları doldurunuz" });
    }

    const existingCategory = await Category.findOne({ slug });

    if (existingCategory) {
      return res.status(400).json({ message: "Bu kategori zaten mevcut" });
    }

    // Resim kontrolü
    let imageFile = "";
    if (req.uploadedFilenames) {
      imageFile = req.uploadedFilenames;
    } else if (req.body.image) {
      // URL olarak resim geliyorsa
      imageFile = req.body.image;
    }

    const category = new Category({
      name,
      slug,
      image: imageFile,
    });

    await category.save();

    res
      .status(201)
      .json({ message: "Kategori başarıyla oluşturuldu", category });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Kategori oluşturulamadı", error: error.message });
  }
}

async function getCategoryById(req, res) {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({ message: "Kategori bulunamadı" });
    }

    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({ message: "Kategori bulunamadı" });
  }
}

async function getCategoryBySlug(req, res) {
  try {
    const { slug } = req.params;
    const category = await Category.findOne({ slug });

    if (!category) {
      return res.status(404).json({ message: "Kategori bulunamadı" });
    }

    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({ message: "Kategori bulunamadı" });
  }
}

async function updateCategory(req, res) {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const slug = slugify(name, { lower: true, locale: "tr" });

    // Önce kategoriyi bulalım
    const existingCategory = await Category.findById(id);
    if (!existingCategory) {
      return res.status(404).json({ message: "Kategori bulunamadı" });
    }

    // Resim işlemleri
    let updatedImage = existingCategory.image;

    // Dosya yüklendiyse
    if (req.file) {
      // Eski resim dosyasını silme (eğer varsa ve URL değilse)
      if (
        existingCategory.image &&
        !existingCategory.image.startsWith("http")
      ) {
        const oldImagePath = path.join(
          __dirname,
          "../uploads",
          existingCategory.image
        );
        fs.unlink(oldImagePath, (err) => {
          if (err) {
            console.error("Eski resim silinirken hata:", err.message);
          }
        });
      }
      updatedImage = req.file.filename;
    }
    // URL olarak resim geliyorsa
    else if (req.body.image) {
      updatedImage = req.body.image;
    }

    const category = await Category.findByIdAndUpdate(
      id,
      {
        name,
        slug,
        image: updatedImage,
      },
      { new: true }
    );

    res.status(200).json({ message: "Kategori güncellendi", category });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Kategori güncellenemedi", error: error.message });
  }
}

async function deleteCategory(req, res) {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({ message: "Kategori bulunamadı" });
    }

    // BunnyCDN'den resmi sil
    if (category.image) {
      try {
        await axios.delete(`https://storage.bunnycdn.com/${BUNNY_STORAGE_ZONE}/${category.image}`, {
          headers: {
            AccessKey: BUNNY_API_KEY,
          },
        });
      } catch (err) {
        console.error("BunnyCDN resim silme hatası:", err.message);
      }
    }

    await Category.findByIdAndDelete(id);

    res.status(200).json({ message: "Kategori ve resmi silindi", category });
  } catch (error) {
    res.status(500).json({ message: "Kategori silinemedi", error: error.message });
  }
}

// Kategori resmi silme
async function deleteCategoryImage(req, res) {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Kategori bulunamadı" });
    }

    // Resim dosyasını silme (eğer URL değilse)
    if (category.image && !category.image.startsWith("http")) {
      const imagePath = path.join("/var/www/cdn/uploads/", category.image);
      fs.unlink(imagePath, (err) => {
        if (err) {
          console.error("Kategori resmi silinirken hata:", err.message);
        }
      });
    }

    // Image alanını boş olarak güncelleme
    category.image = "";
    await category.save();

    res.status(200).json({ message: "Kategori resmi silindi", category });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Kategori resmi silinemedi", error: error.message });
  }
}

module.exports = {
  createCategory,
  getCategories,
  getCategoryById,
  getCategoryBySlug,
  updateCategory,
  deleteCategory,
  deleteCategoryImage,
};
