const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('demute')
    .setDescription('Démuter un utilisateur')
    .addUserOption(option =>
      option.setName('utilisateur')
        .setDescription('Utilisateur à démute')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
  async execute(interaction) {
    const user = interaction.options.getUser('utilisateur');
    const member = await interaction.guild.members.fetch(user.id);
    const muteRole = interaction.guild.roles.cache.find(role => role.name === 'Muted');

    if (!muteRole) {
      return interaction.reply({ content: '❌ Le rôle "Muted" n\'existe pas.', ephemeral: true });
    }

    try {
      await member.roles.remove(muteRole);
      await interaction.reply(`✅ ${user.tag} a été démute.`);
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: '❌ Impossible de démute l\'utilisateur.', ephemeral: true });
    }
  }
};
