const Category = require("../models/category");
const slugify = require("slugify");
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

    let imageFile = "";
    if (req.uploadedFilenames) {
      imageFile = req.uploadedFilenames;
    } else if (req.body.image) {
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
    const { name, image } = req.body;

    const slug = slugify(name, { lower: true, locale: "tr" });

    const existingCategory = await Category.findById(id);
    if (!existingCategory) {
      return res.status(404).json({ message: "Kategori bulunamadı" });
    }

    let updatedImage = existingCategory.image;

    if (req.uploadedFilenames) {
      if (existingCategory.image) {
        try {
          await axios.delete(
            `https://storage.bunnycdn.com/${BUNNY_STORAGE_ZONE}/${existingCategory.image}`,
            {
              headers: {
                AccessKey: BUNNY_API_KEY,
              },
            }
          );
          console.log("Eski kategori resmi silindi:", existingCategory.image);
        } catch (err) {
          console.error("Eski resmi silerken hata:", err.message);
        }
      }

      updatedImage = req.uploadedFilenames;
    }

    else if (image === "") {
      if (existingCategory.image) {
        try {
          await axios.delete(
            `https://storage.bunnycdn.com/${BUNNY_STORAGE_ZONE}/${existingCategory.image}`,
            {
              headers: {
                AccessKey: BUNNY_API_KEY,
              },
            }
          );
          console.log("Kategori resmi silindi:", existingCategory.image);
        } catch (err) {
          console.error("Resim silinemedi:", err.message);
        }
      }

      updatedImage = "";
    }

    else if (image !== undefined) {
      updatedImage = image;
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
    res.status(500).json({ message: "Kategori güncellenemedi", error: error.message });
  }
}

async function deleteCategory(req, res) {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({ message: "Kategori bulunamadı" });
    }

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

async function deleteCategoryImage(req, res) {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Kategori bulunamadı" });
    }

    if (category.image) {
      try {
        await axios.delete(`https://storage.bunnycdn.com/${BUNNY_STORAGE_ZONE}/${category.image}`, {
          headers: {
            AccessKey: BUNNY_API_KEY,
          },
        });
        console.log("Kategori resmi BunnyCDN'den silindi:", category.image);
      } catch (err) {
        console.error("Kategori resmi BunnyCDN'den silinemedi:", err.message);
      }
    }

    category.image = "";
    await category.save();

    res.status(200).json({ message: "Kategori resmi silindi", category });
  } catch (error) {
    res.status(500).json({ message: "Kategori resmi silinemedi", error: error.message });
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
