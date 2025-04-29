const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('dewarn')
    .setDescription('Retirer un avertissement à un utilisateur')
    .addUserOption(option =>
      option.setName('utilisateur')
        .setDescription('Utilisateur à dé-warn')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
  async execute(interaction) {
    const user = interaction.options.getUser('utilisateur');
    const filePath = './warnings.json';

    // Vérification si le fichier existe et est lisible
    let warnData = {};
    if (fs.existsSync(filePath)) {
      try {
        warnData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      } catch (error) {
        console.error('❌ Erreur de lecture du fichier warnings.json:', error);
        return interaction.reply({ content: '❌ Une erreur est survenue lors de la lecture des avertissements.', ephemeral: true });
      }
    } else {
      console.log('⚠️ Le fichier warnings.json n\'existe pas. Il sera créé à la prochaine modification.');
    }

    // Vérification si l'utilisateur a des avertissements
    if (!warnData[user.id] || warnData[user.id] === 0) {
      return interaction.reply({ content: `❌ Cet utilisateur n'a aucun avertissement.`, ephemeral: true });
    }

    // Retirer un avertissement
    warnData[user.id]--;

    // Sauvegarde des modifications dans le fichier
    try {
      fs.writeFileSync(filePath, JSON.stringify(warnData, null, 2), 'utf-8');
    } catch (error) {
      console.error('❌ Erreur de sauvegarde dans le fichier warnings.json:', error);
      return interaction.reply({ content: '❌ Une erreur est survenue lors de la sauvegarde des avertissements.', ephemeral: true });
    }

    await interaction.reply(`✅ Un avertissement a été retiré à ${user.tag}.`);
  }
};
