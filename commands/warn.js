const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Avertir un utilisateur')
    .addUserOption(option =>
      option.setName('utilisateur')
        .setDescription('Utilisateur à avertir')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('raison')
        .setDescription('Raison de l\'avertissement')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
  async execute(interaction) {
    const user = interaction.options.getUser('utilisateur');
    const reason = interaction.options.getString('raison') || 'Aucune raison donnée';
    const filePath = './warnings.json';

    // Vérifier si le fichier existe et le lire
    let warnData = {};
    if (fs.existsSync(filePath)) {
      try {
        warnData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      } catch (error) {
        console.error('Erreur de lecture du fichier warnings.json:', error);
      }
    } else {
      console.log('Le fichier warnings.json n\'existe pas, il sera créé.');
    }

    // Ajouter ou incrémenter l'avertissement pour l'utilisateur
    if (!warnData[user.id]) {
      warnData[user.id] = 1; // Si l'utilisateur n'a pas encore d'avertissement, il en reçoit un
    } else {
      warnData[user.id]++; // Sinon, on incrémente le nombre d'avertissements
    }

    // Sauvegarder les avertissements dans le fichier
    try {
      fs.writeFileSync(filePath, JSON.stringify(warnData, null, 2), 'utf-8');
    } catch (error) {
      console.error('Erreur d\'écriture dans le fichier warnings.json:', error);
      return interaction.reply({ content: '❌ Une erreur est survenue lors de la sauvegarde de l\'avertissement.', ephemeral: true });
    }

    // Envoi du message à l'utilisateur
    try {
      await user.send(`⚠️ Tu as été averti(e) sur ${interaction.guild.name} : ${reason}`);
      await interaction.reply(`⚠️ ${user.tag} a été averti. Raison : ${reason}`);
    } catch {
      await interaction.reply({ content: '❌ Impossible d\'envoyer un message à cet utilisateur.', ephemeral: true });
    }
  }
};
