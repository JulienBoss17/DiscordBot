// mute.js
module.exports = {
  name: 'mute',
  description: 'Mute un utilisateur',
  async execute(message, args) {
    // Vérifier si l'utilisateur a la permission de gérer les rôles
    if (!message.member.permissions.has('MANAGE_ROLES')) {
      return message.reply("❌ Tu n'as pas la permission de gérer les rôles.");
    }

    const user = message.mentions.users.first();
    if (!user) {
      return message.reply('❌ Veuillez mentionner un utilisateur à muter.');
    }

    const member = message.guild.members.cache.get(user.id);
    const muteRole = await message.guild.roles.create({
      name: 'Muted',
      color: '#555555', 
      permissions: []
    });

    try {
      await member.roles.add(muteRole);
      message.reply(`✅ ${user.tag} a été muté.`);
    } catch (err) {
      console.error(err);
      message.reply('❌ Impossible de muter l\'utilisateur.');
    }
  },
};
