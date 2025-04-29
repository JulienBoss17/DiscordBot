const fs = require('fs');
const path = require('path');

const daysOfWeek = {
  mon: "Lun",
  tue: "Mar",
  wed: "Mer",
  thu: "Jeu",
  fri: "Ven",
  sat: "Sam",
  sun: "Dim"
};

const day = new Date().toLocaleString('en-US', { weekday: 'short' }).toLowerCase(); // mon, tue, etc.
const frenchDay = daysOfWeek[day];

function saveVoiceTime(userId, voiceTimeMap) {
  const joinTime = voiceTimeMap.get(userId);
  if (!joinTime) return;

  const timeSpent = Date.now() - joinTime;
  const seconds = Math.floor(timeSpent / 1000); // ← On garde les secondes

  const files = [
    './vocalTime.json',
    './weeklyVoiceTime.json'
  ];

  const day = new Date().toLocaleString('en-US', { weekday: 'short' }).toLowerCase(); // mon, tue, etc.
  const frenchDay = daysOfWeek[day];
  
  if (!frenchDay) {
    console.error(`❌ Jour inconnu : ${day}`);
    return;
  }
  

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

    if (filePath === './weeklyVoiceTime.json') {
      if (!data[userId]) data[userId] = {};
      if (!data[userId][frenchDay]) data[userId][frenchDay] = 0;

      data[userId][frenchDay] += seconds; // ← Stockage en secondes
    } else {
      data[userId] = (data[userId] || 0) + seconds;
    }

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  }

  console.log(`✅ Temps sauvegardé pour ${userId}: +${seconds} secondes`);
  voiceTimeMap.delete(userId);
}

module.exports = { saveVoiceTime };
