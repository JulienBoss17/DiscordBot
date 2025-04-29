const fs = require('fs');
const path = require('path');
const cron = require('node-cron');
const { EmbedBuilder } = require('discord.js');

const weeklyFilePath = path.join(__dirname, '../weeklyVoiceTime.json');

// 🔥 Tu peux changer le nom ici
const CHANNEL_NAME = 'ʙᴏᴛ'; 

function resetWeeklyVocalTime(client) {
  // 🔥 Cette ligne lance la tâche tous les dimanches à 23h59
  cron.schedule('59 23 * * 0', async () => {
    console.log('🔄 Réinitialisation du vocalTime hebdomadaire...');

    let weeklyData = {};

    if (fs.existsSync(weeklyFilePath)) {
      const content = fs.readFileSync(weeklyFilePath, 'utf8');
      if (content.trim()) {
        weeklyData = JSON.parse(content);
      }
    }

    // --- Top 5
    const sorted = Object.entries(weeklyData)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    const topList = sorted.map(([userId, time], index) => {
      const hours = Math.floor(time / 3600);
      const minutes = Math.floor((time % 3600) / 60);
      return `**#${index + 1}** <@${userId}> - **${hours}h ${minutes}min**`;
    }).join('\n');

    // --- Embed
    const embed = new EmbedBuilder()
      .setColor(0x00AE86)
      .setTitle('🏆 Top 5 des Cracks de la Semaine')
      .setDescription(topList || 'Personne n\'a été actif cette semaine...')
      .setTimestamp();

    // --- Trouver le salon par NOM
    const channel = client.channels.cache.find(ch => ch.name === CHANNEL_NAME && ch.isTextBased());
    
    if (channel) {
      await channel.send({ embeds: [embed] });
      console.log('✅ Top 5 envoyé dans le salon !');
    } else {
      console.log(`⚠️ Salon "${CHANNEL_NAME}" introuvable.`);
    }

    // --- Reset fichier
    fs.writeFileSync(weeklyFilePath, '{}', 'utf8');
    console.log('✅ weeklyVoiceTime.json vidé !');
  }, {
    timezone: 'Europe/Paris' // très important !
  });
}

module.exports = { resetWeeklyVocalTime };
