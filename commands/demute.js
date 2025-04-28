// demute.js
module.exports = {
  name: 'demute',
  description: 'Démuter un utilisateur',
  async execute(message, args) {
    // Vérifier si l'utilisateur a la permission de gérer les rôles
    if (!message.member.permissions.has('MANAGE_ROLES')) {
      return message.reply("❌ Tu n'as pas la permission de gérer les rôles.");
    }

    const user = message.mentions.users.first();
    if (!user) {
      return message.reply('❌ Veuillez mentionner un utilisateur à démute.');
    }

    const member = message.guild.members.cache.get(user.id);
    const muteRole = message.guild.roles.cache.find(role => role.name === 'Muted');
    if (!muteRole) {
      return message.reply('❌ Le rôle "Muted" n\'existe pas.');
    }

    try {
      await member.roles.remove(muteRole);
      message.reply(`✅ ${user.tag} a été démute.`);
    } catch (err) {
      console.error(err);
      message.reply('❌ Impossible de démute l\'utilisateur.');
    }
  },
};
