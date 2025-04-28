const { generateWeeklyRanking } = require('../utils/generateWeeklyRanking');
const channelId = 'TON_ID_SALON'; // 🔥 Remplace par l'ID du salon où tu veux poster.

module.exports = {
  name: '!resetweekly',
  description: 'Réinitialise le classement vocal de la semaine.',
  async execute(message, args, client) {
    if (!message.member.permissions.has('ADMINISTRATOR')) {
      return message.reply("❌ Tu n'as pas la permission d'utiliser cette commande.");
    }

    console.log('🔄 Commande !resetweekly exécutée.');

    await generateWeeklyRanking(client, channelId);

    message.reply('✅ Classement vocal de la semaine sauvegardé et reset effectué.');
  }
};
