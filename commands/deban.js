const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('deban')
    .setDescription('Débannir un utilisateur')
    .addStringOption(option =>
      option.setName('id')
        .setDescription('ID de l\'utilisateur à débannir')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
  async execute(interaction) {
    const userId = interaction.options.getString('id');

    try {
      await interaction.guild.members.unban(userId);
      await interaction.reply(`✅ L'utilisateur avec l'ID ${userId} a été débanni.`);
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: '❌ Impossible de débannir cet utilisateur.', ephemeral: true });
    }
  }
};
