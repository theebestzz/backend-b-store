const Settings = require("../models/settings");
const fs = require("fs");
const path = require("path");

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
    // Form verilerini alalım
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

    // Mevcut ayarları bulalım, yoksa yeni oluşturalım
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }

    // Eğer yeni logo yüklendiyse (dosya olarak)
    if (req.file) {
      // Eski logoyu silelim (varsa ve dosya ise)
      if (settings.logo && settings.logo.startsWith("http") === false) {
        const oldLogoPath = path.join("/var/www/cdn/uploads/", settings.logo);
        fs.unlink(oldLogoPath, (err) => {
          if (err) {
            console.error("Eski logo silinirken hata:", err.message);
          }
        });
      }

      // Yeni logo adını kaydedelim
      settings.logo = req.file.filename;
    }
    // Eğer logo parametresi tanımlıysa (empty olsa bile)
    else if (logo !== undefined) {
      // Eğer logo boş string ise (silme işareti)
      if (logo === "") {
        // Eski logoyu silelim (varsa ve dosya ise)
        if (settings.logo && settings.logo.startsWith("http") === false) {
          try {
            const oldLogoPath = path.join(
              "/var/www/cdn/uploads/",
              settings.logo
            );
            if (fs.existsSync(oldLogoPath)) {
              fs.unlinkSync(oldLogoPath); // Senkron silme işlemi
            } else {
            }
          } catch (err) {
            console.error("Logo silinirken hata:", err.message);
          }
        }
        settings.logo = ""; // Logo alanını boşalt
      } else {
        settings.logo = logo;
      }
    }

    // Diğer alanları güncelleyelim
    settings.name = name || settings.name;
    settings.adres = adres || settings.adres;
    settings.iletisim = iletisim || settings.iletisim;
    settings.email = email || settings.email;
    settings.calisma_saatleri = calisma_saatleri || settings.calisma_saatleri;
    settings.instagram = instagram || settings.instagram;
    settings.facebook = facebook || settings.facebook;
    settings.twitter = twitter || settings.twitter;

    await settings.save();

    res
      .status(200)
      .json({ message: "Ayarlar başarıyla güncellendi", settings });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Ayarlar güncellenemedi", error: error.message });
  }
}

module.exports = {
  getSettings,
  createSettings,
  updateSettings,
};
