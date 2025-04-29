const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Supprime un certain nombre de messages')
    .addIntegerOption(option =>
      option.setName('nombre')
        .setDescription('Nombre de messages à supprimer (1-100)')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
  async execute(interaction) {
    const amount = interaction.options.getInteger('nombre');
    if (amount < 1 || amount > 100) {
      return interaction.reply({ content: '❌ Le nombre doit être entre 1 et 100.', ephemeral: true });
    }
    await interaction.channel.bulkDelete(amount, true);
    const reply = await interaction.reply(`🧼 ${amount} messages supprimés.`);
    setTimeout(() => reply.delete(), 3000);
  }
};
