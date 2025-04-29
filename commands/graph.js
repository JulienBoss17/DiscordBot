const { SlashCommandBuilder } = require('@discordjs/builders');
const { AttachmentBuilder, EmbedBuilder } = require('discord.js');
const { generateVoiceGraph } = require('../utils/generateVoiceGraph');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('graph')
    .setDescription('Affiche ton temps passé en vocal sous forme de graphique')
    .addUserOption(option =>
      option.setName('utilisateur')
        .setDescription("L'utilisateur ciblé")
        .setRequired(false)
    ),

  async execute(interaction) {
    const user = interaction.options.getUser('utilisateur') || interaction.user;

    try {
      const imageBuffer = await generateVoiceGraph(user.id, user.username);
      const attachment = new AttachmentBuilder(imageBuffer, { name: 'graph.png' });

      const embed = new EmbedBuilder()
        .setTitle(`📈 Graphique de ${user.username}`)
        .setImage('attachment://graph.png')
        .setColor(0x00AEFF)
        .setTimestamp();

      await interaction.reply({ embeds: [embed], files: [attachment] });
    } catch (err) {
      console.error(err);
      await interaction.reply({ content: `❌ ${err.message}`, ephemeral: true });
    }
  }
};
