const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const dataPath = path.join(__dirname, '../weeklyVoiceTime.json');

// Ordre correct des jours en abrégé
const joursOrdre = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

router.get('/vocal-time/:id', (req, res) => {
  const userId = req.params.id;

  if (!fs.existsSync(dataPath)) {
    return res.status(404).json({ error: 'Données introuvables.' });
  }

  let data;
  try {
    data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  } catch {
    return res.status(500).json({ error: 'Erreur lecture fichier JSON.' });
  }

  const userData = data[userId];
  if (!userData) {
    return res.status(404).json({ error: 'Aucune donnée pour cet utilisateur.' });
  }

  // Construire le tableau complet des jours avec 0 si absent
  const result = joursOrdre.map(jour => ({
    day: jour,
    duration: userData[jour] || 0
  }));

  res.json(result);
});

module.exports = router;
