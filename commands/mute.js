const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mute')
    .setDescription('Mute un utilisateur')
    .addUserOption(option =>
      option.setName('utilisateur')
        .setDescription('Utilisateur à mute')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
  async execute(interaction) {
    const user = interaction.options.getUser('utilisateur');
    const member = await interaction.guild.members.fetch(user.id);
    let muteRole = interaction.guild.roles.cache.find(role => role.name === 'Muted');

    if (!muteRole) {
      muteRole = await interaction.guild.roles.create({
        name: 'Muted',
        color: '#555555',
        permissions: []
      });
    }

    try {
      await member.roles.add(muteRole);
      await interaction.reply(`✅ ${user.tag} a été muté.`);
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: '❌ Impossible de muter l\'utilisateur.', ephemeral: true });
    }
  }
};
