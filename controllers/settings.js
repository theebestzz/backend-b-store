const Settings = require("../models/settings");
const axios = require("axios");

const BUNNY_API_KEY = process.env.BUNNY_API_KEY;
const BUNNY_STORAGE_ZONE = process.env.BUNNY_STORAGE_ZONE_NAME;

async function getSettings(req, res) {
  try {
    let settings = await Settings.findOne();

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

async function createSettings(req, res) {
  try {
    const existingSettings = await Settings.findOne();

    if (existingSettings) {
      return res.status(400).json({
        message: "Ayarlar zaten mevcut. Güncellemek için PUT kullanın.",
      });
    }

    const {
      name,
      adress,
      iletisim,
      email,
      work_hours,
      instagram,
      facebook,
      twitter,
      logo,
      whatsapp
    } = req.body;

    let logoFile = "";
    if (req.file) {
      logoFile = req.file.filename;
    }
    else if (logo) {
      logoFile = logo;
    }

    const settings = new Settings({
      logo: logoFile,
      name,
      adress,
      iletisim,
      email,
      work_hours,
      instagram,
      facebook,
      twitter,
      whatsapp
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

async function updateSettings(req, res) {
  try {
    const {
      name,
      adress,
      iletisim,
      email,
      work_hours,
      instagram,
      facebook,
      twitter,
      logo,
      whatsapp
    } = req.body;

    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }

    if (req.uploadedFilenames) {
      if (settings.logo) {
        try {
          await axios.delete(`https://storage.bunnycdn.com/${BUNNY_STORAGE_ZONE}/${settings.logo}`, {
            headers: {
              AccessKey: BUNNY_API_KEY,
            },
          });
        } catch (err) {
          console.error("Eski logo silinemedi:", err.message);
        }
      }

      settings.logo = req.uploadedFilenames;
    }

    else if (logo === "") {
      if (settings.logo) {
        try {
          await axios.delete(`https://storage.bunnycdn.com/${BUNNY_STORAGE_ZONE}/${settings.logo}`, {
            headers: {
              AccessKey: BUNNY_API_KEY,
            },
          });
        } catch (err) {
          console.error("Logo silme hatası:", err.message);
        }
      }
      settings.logo = "";
    }

    else if (logo !== undefined) {
      settings.logo = logo;
    }

    settings.name = name || settings.name;
    settings.adress = adress || settings.adress;
    settings.iletisim = iletisim || settings.iletisim;
    settings.email = email || settings.email;
    settings.work_hours = work_hours || settings.work_hours;
    settings.instagram = instagram || settings.instagram;
    settings.facebook = facebook || settings.facebook;
    settings.twitter = twitter || settings.twitter;
    settings.whatsapp = whatsapp || settings.whatsapp;

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
