// deban.js
module.exports = {
  name: 'deban',
  description: 'Débannir un utilisateur',
  async execute(message, args) {
    // Vérifier si l'utilisateur a la permission de bannir des membres
    if (!message.member.permissions.has('BAN_MEMBERS')) {
      return message.reply("❌ Tu n'as pas la permission de débannir des membres.");
    }

    const userId = args[0];
    if (!userId) {
      return message.reply('❌ Veuillez spécifier un identifiant utilisateur à débannir.');
    }

    try {
      await message.guild.members.unban(userId);
      message.reply(`✅ L'utilisateur avec l'ID ${userId} a été débanni.`);
    } catch (err) {
      console.error(err);
      message.reply('❌ Impossible de débannir cet utilisateur.');
    }
  },
};
