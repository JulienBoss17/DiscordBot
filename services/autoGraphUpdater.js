const fs = require('fs');
const path = require('path');
const { generateVoiceGraph } = require('../utils/generateVoiceGraph');
const { AttachmentBuilder, EmbedBuilder } = require('discord.js');

const dataPath = path.join(__dirname, '../weeklyVoiceTime.json');

const sentMessages = {}; // Stockage en mémoire des messages déjà envoyés

async function updateOrCreateGraphMessage(client, channelId) {
  const channel = await client.channels.fetch(channelId);
  const data = JSON.parse(fs.readFileSync(dataPath));

  for (const userId of Object.keys(data)) {
    const member = await client.users.fetch(userId).catch(() => null);
    if (!member) continue;

    const username = member.username;

    try {
      const buffer = await generateVoiceGraph(userId, username);
      const attachment = new AttachmentBuilder(buffer, { name: 'graph.png' });

      const embed = new EmbedBuilder()
        .setTitle(`📊 Statistiques vocales - ${username}`)
        .setImage('attachment://graph.png')
        .setColor(0x00AEFF)
        .setTimestamp();

      if (sentMessages[userId]) {
        // Mise à jour d’un message déjà envoyé
        await sentMessages[userId].edit({ embeds: [embed], files: [attachment] });
        console.log(`[AutoGraph] ✅ Graphique mis à jour pour ${username}`);
      } else {
        // Aucun message initial — ne rien faire
        console.log(`[AutoGraph] ⏩ Aucun message à mettre à jour pour ${username}`);
      }
    } catch (err) {
      console.error(`[AutoGraph] ❌ Erreur pour ${username} :`, err.message);
    }
  }
}

function startAutoGraphUpdater(client, channelId, intervalMs = 60000) {
  setInterval(() => {
    updateOrCreateGraphMessage(client, channelId);
  }, intervalMs);
  console.log(`[AutoGraph] 🔁 Mise à jour automatique toutes les ${intervalMs / 60000} min`);
}

module.exports = { startAutoGraphUpdater };
