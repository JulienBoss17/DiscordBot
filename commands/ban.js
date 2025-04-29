const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Bannir un utilisateur')
    .addUserOption(option =>
      option.setName('utilisateur')
        .setDescription('Utilisateur à bannir')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
  async execute(interaction) {
    const user = interaction.options.getUser('utilisateur');
    const member = await interaction.guild.members.fetch(user.id);

    try {
      await member.ban({ reason: 'Violation des règles' });
      await interaction.reply(`✅ ${user.tag} a été banni.`);
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: '❌ Impossible de bannir l\'utilisateur.', ephemeral: true });
    }
  }
};
