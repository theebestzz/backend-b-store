const Settings = require("../models/settings");
const fs = require("fs");
const path = require("path");
const axios = require("axios");

const BUNNY_API_KEY = process.env.BUNNY_API_KEY;
const BUNNY_STORAGE_ZONE = process.env.BUNNY_STORAGE_ZONE_NAME;

// Ayarları getir
async function getSettings(req, res) {
  try {
    // Tek bir ayarlar kaydı olacağı için ilk kaydı getiriyoruz
    let settings = await Settings.findOne();

    // Eğer ayarlar kaydı yoksa, yeni bir tane oluşturalım
    if (!settings) {
      settings = new Settings();
      await settings.save();
    }

    res.status(200).json(settings);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Ayarlar alınamadı", error: error.message });
  }
}

// Ayarları oluştur (ilk kez)
async function createSettings(req, res) {
  try {
    // Önce var mı diye kontrol edelim
    const existingSettings = await Settings.findOne();

    if (existingSettings) {
      return res.status(400).json({
        message: "Ayarlar zaten mevcut. Güncellemek için PUT kullanın.",
      });
    }

    const {
      name,
      adres,
      iletisim,
      email,
      calisma_saatleri,
      instagram,
      facebook,
      twitter,
      logo, // Logo URL için
    } = req.body;

    let logoFile = "";
    // Dosya olarak yüklenen logo varsa
    if (req.file) {
      logoFile = req.file.filename;
    }
    // URL olarak gelen logo varsa
    else if (logo) {
      logoFile = logo;
    }

    const settings = new Settings({
      logo: logoFile,
      name,
      adres,
      iletisim,
      email,
      calisma_saatleri,
      instagram,
      facebook,
      twitter,
    });

    await settings.save();

    res
      .status(201)
      .json({ message: "Ayarlar başarıyla oluşturuldu", settings });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Ayarlar oluşturulamadı", error: error.message });
  }
}

// Ayarları güncelle
async function updateSettings(req, res) {
  try {
    const {
      name,
      adres,
      iletisim,
      email,
      calisma_saatleri,
      instagram,
      facebook,
      twitter,
      logo, // sadece string olarak gelen logo
    } = req.body;

    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }

    // 🟡 1. Yeni logo yüklendiyse eski logoyu BunnyCDN'den sil
    if (req.uploadedFilenames) {
      // Eski logo sil
      if (settings.logo) {
        try {
          await axios.delete(`https://storage.bunnycdn.com/${BUNNY_STORAGE_ZONE}/${settings.logo}`, {
            headers: {
              AccessKey: BUNNY_API_KEY,
            },
          });
          console.log("Eski logo silindi:", settings.logo);
        } catch (err) {
          console.error("Eski logo silinemedi:", err.message);
        }
      }

      // Yeni logo adını ayarla
      settings.logo = req.uploadedFilenames;
    }

    // 🟡 2. Logo silinmek istenirse (logo: "")
    else if (logo === "") {
      if (settings.logo) {
        try {
          await axios.delete(`https://storage.bunnycdn.com/${BUNNY_STORAGE_ZONE}/${settings.logo}`, {
            headers: {
              AccessKey: BUNNY_API_KEY,
            },
          });
          console.log("Logo silindi:", settings.logo);
        } catch (err) {
          console.error("Logo silme hatası:", err.message);
        }
      }
      settings.logo = "";
    }

    // 🟡 3. Logo istenirse dışarıdan (string ile URL ya da dosya adı) verilebilir
    else if (logo !== undefined) {
      settings.logo = logo;
    }

    // Diğer alanlar
    settings.name = name || settings.name;
    settings.adres = adres || settings.adres;
    settings.iletisim = iletisim || settings.iletisim;
    settings.email = email || settings.email;
    settings.calisma_saatleri = calisma_saatleri || settings.calisma_saatleri;
    settings.instagram = instagram || settings.instagram;
    settings.facebook = facebook || settings.facebook;
    settings.twitter = twitter || settings.twitter;

    await settings.save();

    res.status(200).json({ message: "Ayarlar başarıyla güncellendi", settings });
  } catch (error) {
    res.status(500).json({ message: "Ayarlar güncellenemedi", error: error.message });
  }
}

module.exports = {
  getSettings,
  createSettings,
  updateSettings,
};
