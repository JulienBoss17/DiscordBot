const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('classement')
    .setDescription('Affiche le classement des membres en fonction du temps passé en vocal'),
  async execute(interaction) {
    const dataFile = './vocalTime.json';
    let data = {};

    if (fs.existsSync(dataFile)) {
      const fileContent = fs.readFileSync(dataFile, 'utf8');
      if (fileContent.trim()) {
        data = JSON.parse(fileContent);
      }
    }

    const sorted = Object.entries(data)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    const embed = new EmbedBuilder()
      .setColor(0x1E2A78)
      .setTitle('🏆 Classement Temps Vocal')
      .setDescription(
        sorted.length ? 
          sorted.map(([userId, seconds], index) => `#${index + 1} <@${userId}> - ${Math.floor(seconds / 60)} min`).join('\n')
          : 'Aucune donnée enregistrée.'
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
