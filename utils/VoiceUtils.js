const fs = require('fs');
const { getDay, getHours, getMinutes } = require('date-fns');


// Chemins des fichiers
const globalTimeFile = './vocalTime.json';

let voiceTimeMap = new Map();

// Fonction pour sauvegarder le temps passé
function saveVoiceTime(userId) {
  const joinTime = voiceTimeMap.get(userId);
  if (!joinTime) return;

  const timeSpent = Date.now() - joinTime;
  const seconds = Math.floor(timeSpent / 1000);

  let data = {};

  if (fs.existsSync(globalTimeFile)) {
    try {
      const fileContent = fs.readFileSync(globalTimeFile, 'utf8');
      if (fileContent.trim()) {
        data = JSON.parse(fileContent);
      }
    } catch (error) {
      console.error("❌ Erreur de parsing du fichier vocalTime.json");
    }
  }

  data[userId] = (data[userId] || 0) + seconds;

  fs.writeFileSync(globalTimeFile, JSON.stringify(data, null, 2), 'utf8');

  console.log(`✅ Temps sauvegardé pour ${userId}: +${seconds}s`);
  voiceTimeMap.delete(userId);
}

// Vérification chaque minute si nous sommes dimanche à 23h59
function checkWeeklyReset(generateWeeklyRanking) {
  setInterval(() => {
    const now = new Date();
    if (getDay(now) === 0 && getHours(now) === 23 && getMinutes(now) === 59) {
      generateWeeklyRanking();
    }
  }, 60000);
}

module.exports = {
  saveVoiceTime,
  checkWeeklyReset,
  voiceTimeMap, // On exporte aussi la map pour l'utiliser dans app.js
};
