// utils/saveVoiceTime.js
const fs = require('fs');

function saveVoiceTime(userId, voiceTimeMap) {
  const joinTime = voiceTimeMap.get(userId);
  if (!joinTime) return;

  const seconds = Math.floor((Date.now() - joinTime) / 1000);
  const filePath = './vocalTime.json';
  let data = {};

  if (fs.existsSync(filePath)) {
    try {
      data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } catch (e) {
      console.error('❌ Erreur parsing vocalTime.json');
    }
  }

  data[userId] = (data[userId] || 0) + seconds;
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`✅ Temps sauvegardé pour ${userId}: +${seconds}s`);
}

module.exports = saveVoiceTime;
