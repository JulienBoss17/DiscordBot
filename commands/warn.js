module.exports = {
    name: 'warn',
    async execute(message, args) {
      if (!message.member.permissions.has('ModerateMembers')) {
        return message.reply("Tu n'as pas la permission de faire ça.");
      }
  
      const user = message.mentions.members.first();
      const reason = args.slice(1).join(' ') || "Aucune raison donnée";
  
      if (!user) return message.reply("Mentionne un utilisateur à avertir.");
  
      try {
        await user.send(`⚠️ Tu as été averti(e) sur ${message.guild.name} : ${reason}`);
        message.channel.send(`⚠️ ${user.user.tag} a été averti.`)
      } catch {
        message.reply("Impossible d'envoyer un message à cet utilisateur.");
      }
    }
  };
  