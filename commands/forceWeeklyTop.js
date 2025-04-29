const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('forceweeklytop')
    .setDescription('📢 Force l\'envoi du Top 5 Vocal de la semaine !'),

  async execute(interaction) {
    const weeklyFilePath = path.join(__dirname, '../weeklyVocalTime.json');
    const CHANNEL_NAME = 'ʙᴏᴛ'; // 🔥 même nom que dans le reset automatique

    let weeklyData = {};

    if (fs.existsSync(weeklyFilePath)) {
      const content = fs.readFileSync(weeklyFilePath, 'utf8');
      if (content.trim()) {
        weeklyData = JSON.parse(content);
      }
    }

    const sorted = Object.entries(weeklyData)
      .sort(([, a], [, b]) => b - a)
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
    await interaction.reply({ content: '✅ Top 5 vocal de la semaine envoyé avec succès !', ephemeral: true });
  },
};
