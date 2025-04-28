// dewarn.js
module.exports = {
  name: 'dewarn',
  description: 'Retirer un avertissement d\'un utilisateur',
  async execute(message, args) {
    // Vérifier si l'utilisateur a la permission de gérer les avertissements
    if (!message.member.permissions.has('MANAGE_MESSAGES')) {
      return message.reply("❌ Tu n'as pas la permission de gérer les avertissements.");
    }

    const user = message.mentions.users.first();
    if (!user) {
      return message.reply('❌ Veuillez mentionner un utilisateur dont vous voulez retirer l\'avertissement.');
    }

    // Charger le fichier de sauvegarde des avertissements
    const warnData = JSON.parse(fs.readFileSync('./warnings.json', 'utf-8'));

    if (!warnData[user.id] || warnData[user.id] === 0) {
      return message.reply('❌ Cet utilisateur n\'a aucun avertissement.');
    }

    // Supprimer un avertissement
    warnData[user.id]--;
    fs.writeFileSync('./warnings.json', JSON.stringify(warnData));

    message.reply(`✅ Un avertissement a été retiré de ${user.tag}.`);
  },
};
