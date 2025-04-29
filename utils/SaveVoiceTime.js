const fs = require('fs');
const path = require('path');

function saveVoiceTime(userId, voiceTimeMap) {
  const joinTime = voiceTimeMap.get(userId);
  if (!joinTime) return;

  const timeSpent = Date.now() - joinTime;
  const seconds = Math.floor(timeSpent / 1000);

  // Fichiers de sauvegarde
  const files = [
    './vocalTime.json',           // Historique complet
    './weeklyVocalTime.json'       // Hebdomadaire
  ];

  for (const filePath of files) {
    let data = {};

    if (fs.existsSync(filePath)) {
      try {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        if (fileContent.trim()) {
          data = JSON.parse(fileContent);
        }
      } catch (error) {
        console.error(`❌ Erreur de parsing du fichier ${filePath}`);
      }
    }

    // Mise à jour du temps pour l'utilisateur
    data[userId] = (data[userId] || 0) + seconds;

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  }

  console.log(`✅ Temps sauvegardé pour ${userId}: +${seconds}s`);
  voiceTimeMap.delete(userId); // Nettoyage
}

module.exports = { saveVoiceTime };
