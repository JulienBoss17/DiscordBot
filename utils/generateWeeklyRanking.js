const fs = require('fs');
const { getISOWeek } = require('date-fns');


const globalTimeFile = './vocalTime.json';

async function generateWeeklyRanking(client, channelId) {
    const currentTime = new Date();
    const weekNumber = getISOWeek(currentTime);    
  const weeklyFile = `./weeklyTime_${weekNumber}.json`;

  if (fs.existsSync(globalTimeFile)) {
    try {
      const fileContent = fs.readFileSync(globalTimeFile, 'utf8');
      const globalData = JSON.parse(fileContent);

      fs.writeFileSync(weeklyFile, JSON.stringify(globalData, null, 2), 'utf8');
      console.log(`✅ Classement sauvegardé dans ${weeklyFile}`);

      const channel = client.channels.cache.get(channelId);
      if (channel) {
        await channel.send(`Classement vocal de la semaine ${weekNumber} :\n\`\`\`json\n${JSON.stringify(globalData, null, 2)}\n\`\`\``);
        console.log('✅ Message envoyé.');
      } else {
        console.log('❌ Salon introuvable.');
      }

      // Reset global time file
      fs.writeFileSync(globalTimeFile, JSON.stringify({}, null, 2), 'utf8');
      console.log("✅ Données globales réinitialisées.");
      
    } catch (error) {
      console.error('❌ Erreur pendant la génération du classement :', error);
    }
  } else {
    console.log('❌ Aucun fichier vocalTime.json trouvé.');
  }
}

module.exports = { generateWeeklyRanking };
