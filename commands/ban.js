// ban.js
module.exports = {
  name: 'ban',
  description: 'Bannir un utilisateur',
  async execute(message, args) {
    // Vérifier si l'utilisateur a la permission de bannir des membres
    if (!message.member.permissions.has('BAN_MEMBERS')) {
      return message.reply("❌ Tu n'as pas la permission de bannir des membres.");
    }

    const user = message.mentions.users.first();
    if (!user) {
      return message.reply('❌ Veuillez mentionner un utilisateur à bannir.');
    }

    const member = message.guild.members.cache.get(user.id);
    try {
      await member.ban({ reason: 'Violation des règles' });
      message.reply(`✅ ${user.tag} a été banni.`);
    } catch (err) {
      console.error(err);
      message.reply('❌ Impossible de bannir l\'utilisateur.');
    }
  },
};
