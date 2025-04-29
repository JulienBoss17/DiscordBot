const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tempsvocal')
    .setDescription('Voir le temps passé en vocal par un utilisateur')
    .addUserOption(option =>
      option.setName('utilisateur')
        .setDescription('Utilisateur à vérifier')
        .setRequired(false)),
  async execute(interaction) {
    const user = interaction.options.getUser('utilisateur') || interaction.user;
    const data = fs.existsSync('./vocalTime.json') ? JSON.parse(fs.readFileSync('./vocalTime.json', 'utf-8')) : {};
    const seconds = data[user.id] || 0;

    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;

    await interaction.reply(`🎙️ ${user.username} a passé ${h}h ${m}m ${s}s en vocal.`);
  }
};
