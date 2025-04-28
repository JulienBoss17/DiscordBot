const fs = require("fs");

module.exports = {
  name: 'tempsvocal',
  async execute(message, args) {
    const user = message.mentions.users.first() || message.author;
    const data = fs.existsSync('./vocalTime.json') ? JSON.parse(fs.readFileSync('./vocalTime.json')) : {};
    const seconds = data[user.id] || 0;

    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;

    message.channel.send(`🎙️ ${user.username} a passé ${h}h ${m}m ${s}s en vocal.`);
  }
};
