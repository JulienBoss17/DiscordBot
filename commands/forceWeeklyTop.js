const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('forceweeklytop')
    .setDescription('📢 Force l\'envoi du Top 5 Vocal de la semaine !'),

  async execute(interaction) {
    // Vérifier les permissions de l'utilisateur
    if (!interaction.member.permissions.has('ADMINISTRATOR')) {
      return interaction.reply({ content: '❌ Tu n\'as pas les permissions nécessaires pour utiliser cette commande.', ephemeral: true });
    }

    const weeklyFilePath = path.join(__dirname, '../weeklyVoiceTime.json');
    const CHANNEL_NAME = 'ʙᴏᴛ'; // 🔥 même nom que dans le reset automatique

    let weeklyData = {};

    if (fs.existsSync(weeklyFilePath)) {
      const content = fs.readFileSync(weeklyFilePath, 'utf8');
      if (content.trim()) {
        weeklyData = JSON.parse(content);
      }
    }

    // Tri et vérification des temps
    const sorted = Object.entries(weeklyData)
      .map(([userId, time]) => {
        // Assurer que time est un nombre valide et pas NaN
        const validTime = !isNaN(time) && time >= 0 ? time : 0; // Si time est invalide, le remplacer par 0
        return [userId, validTime];
      })
      .sort(([, a], [, b]) => b - a) // Tri décroissant par le temps
      .slice(0, 5);

    const topList = sorted.map(([userId, time], index) => {
      const hours = Math.floor(time / 3600);
      const minutes = Math.floor((time % 3600) / 60);
      return `**#${index + 1}** <@${userId}> - **${hours}h ${minutes}min**`;
    }).join('\n');

    const embed = new EmbedBuilder()
      .setColor(0x00AE86)
      .setTitle('🏆 Top 5 des Cracks de la Semaine (FORCÉ)')
      .setDescription(topList || 'Personne n\'a été actif cette semaine...')
      .setTimestamp();

    const channel = interaction.guild.channels.cache.find(ch => ch.name === CHANNEL_NAME && ch.isTextBased());

    if (!channel) {
      return interaction.reply({ content: `⚠️ Salon "${CHANNEL_NAME}" introuvable.`, ephemeral: true });
    }

    await channel.send({ embeds: [embed] });

    // Réinitialiser le fichier weeklyVoiceTime.json (le vider)
    fs.writeFileSync(weeklyFilePath, JSON.stringify({}, null, 2), 'utf8');
    
    await interaction.reply({ content: '✅ Top 5 vocal de la semaine envoyé avec succès et fichier réinitialisé !', ephemeral: true });
  },
};
