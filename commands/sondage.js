// sondage.js
module.exports = {
  name: 'sondage',
  description: 'Créer un sondage interactif',
  async execute(message, args) {
    // Vérifier si l'utilisateur a la permission de gérer les messages
    if (!message.member.permissions.has('MANAGE_MESSAGES')) {
      return message.reply("❌ Tu n'as pas la permission de gérer les messages.");
    }

    const pollQuestion = args.join(' ');
    if (!pollQuestion) {
      return message.reply("❌ Veuillez fournir une question pour le sondage.");
    }

    // Créer le sondage
    const pollEmbed = {
      color: 0x0099ff,
      title: "Sondage",
      description: pollQuestion,
      footer: {
        text: `Sondage créé par ${message.author.tag}`,
      },
    };

    try {
      const pollMessage = await message.channel.send({ embeds: [pollEmbed] });
      await pollMessage.react('👍');
      await pollMessage.react('👎');
      message.reply("✅ Sondage créé avec succès.");
    } catch (err) {
      console.error(err);
      message.reply('❌ Une erreur est survenue lors de la création du sondage.');
    }
  },
};
