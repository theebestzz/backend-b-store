const multer = require("multer");
const path = require("path");
const axios = require("axios");

// BunnyCDN Ayarları
const BUNNY_API_KEY = process.env.BUNNY_API_KEY;
const BUNNY_UPLOAD_URL = process.env.BUNNY_CDN_URL;

// Dosya bellekte tutulacak
const storage = multer.memoryStorage();

// Sadece resim dosyaları kabul edilecek
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp|jfif/;
  const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mime = allowedTypes.test(file.mimetype);
  if (ext && mime) {
    cb(null, true);
  } else {
    cb(new Error("Sadece resim dosyaları yüklenebilir"));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

// BunnyCDN'e upload eden middleware
async function uploadToBunny(req, res, next) {
  if (!req.file && !req.files) return next();

  try {
    const files = req.file ? [req.file] : req.files;
    const filenames = [];

    for (const file of files) {
      const uniqueName =
        Date.now() +
        "-" +
        Math.round(Math.random() * 1e9) +
        path.extname(file.originalname);

      await axios.put(`${BUNNY_UPLOAD_URL}/${uniqueName}`, file.buffer, {
        headers: {
          AccessKey: BUNNY_API_KEY,
          "Content-Type": file.mimetype,
        },
      });

      filenames.push(uniqueName);
    }

    // Tek dosya ise string, çoklu dosya ise array gönder
    req.uploadedFilenames = filenames.length === 1 ? filenames[0] : filenames;
    next();
  } catch (error) {
    console.error("BunnyCDN'e yüklenirken hata:", error.message);
    return res.status(500).json({ error: "Dosya yüklenemedi" });
  }
}

module.exports = {
  upload,
  uploadToBunny,
};
