const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('sondage')
    .setDescription('Créer un sondage interactif')
    .addStringOption(option =>
      option.setName('question')
        .setDescription('La question du sondage')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
  async execute(interaction) {
    const question = interaction.options.getString('question');

    const embed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle('📊 Sondage')
      .setDescription(question)
      .setFooter({ text: `Sondage créé par ${interaction.user.tag}` });

    try {
      const pollMessage = await interaction.channel.send({ embeds: [embed] });
      await pollMessage.react('👍');
      await pollMessage.react('👎');
      await interaction.reply({ content: '✅ Sondage créé avec succès.', ephemeral: true });
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: '❌ Erreur lors de la création du sondage.', ephemeral: true });
    }
  }
};
