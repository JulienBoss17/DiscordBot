module.exports = {
    name: 'clear',
    async execute(message, args) {
      if (!message.member.permissions.has('ManageMessages')) {
        return message.reply("Tu n'as pas la permission de faire ça.");
      }
  
      const amount = parseInt(args[0]);
      if (isNaN(amount) || amount < 1 || amount > 100) {
        return message.reply("Spécifie un nombre entre 1 et 100.");
      }
  
      await message.channel.bulkDelete(amount, true);
      message.channel.send(`🧼 ${amount} messages supprimés.`).then(msg => {
        setTimeout(() => msg.delete(), 3000);
      });
    }
  };
  