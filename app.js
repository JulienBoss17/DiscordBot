require('dotenv').config();
const { Client, GatewayIntentBits, Partials } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require('fs');
const path = require('path');
const { clear } = require('console');
const { EmbedBuilder } = require('discord.js');
const { formatDistanceToNow } = require('date-fns');
const { fr } = require('date-fns/locale');
const { saveVoiceTime, checkWeeklyReset, voiceTimeMap } = require('./utils/VoiceUtils');
const globalTimeFile = './vocalTime.json';



// IDs importants
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;
const token = process.env.TOKEN;

if (!token || !clientId || !guildId) {
  console.error("❌ Vérifie que TOKEN, CLIENT_ID et GUILD_ID sont bien définis dans ton fichier .env");
  process.exit(1);
}

// Slash commands à enregistrer
const commands = [
  new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Bannir un utilisateur')
    .addUserOption(option => option.setName('utilisateur').setDescription('L’utilisateur à bannir').setRequired(true)),
  new SlashCommandBuilder()
    .setName('deban')
    .setDescription('Débannir un utilisateur')
    .addUserOption(option => option.setName('utilisateur').setDescription('L’utilisateur à débannir').setRequired(true)),
  new SlashCommandBuilder()
    .setName('vocal')
    .setDescription('Voir le temps passé en vocal')
    .addUserOption(option => option.setName('utilisateur').setDescription('L’utilisateur à consulter')),
  new SlashCommandBuilder()
    .setName('mute')
    .setDescription('Muter un utilisateur pour une durée')
    .addUserOption(option => option.setName('utilisateur').setDescription('L’utilisateur à mute').setRequired(true))
    .addStringOption(option => option.setName('durée').setDescription('Ex: 10m, 2h, 30s').setRequired(true)),
  new SlashCommandBuilder()
    .setName('demute')
    .setDescription('Démuter un utilisateur')
    .addUserOption(option => option.setName('utilisateur').setDescription('L’utilisateur à démute').setRequired(true)),
  new SlashCommandBuilder()
    .setName('sondage')
    .setDescription('Créer un sondage')
    .addStringOption(option => option.setName('question').setDescription('La question du sondage').setRequired(true)),
  new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Avertir un utilisateur')
    .addUserOption(option => option.setName('utilisateur').setDescription('L’utilisateur à avertir').setRequired(true)),
  new SlashCommandBuilder()
    .setName('dewarn')
    .setDescription('Enlever un avertissement à un utilisateur')
    .addUserOption(option => option.setName('utilisateur').setDescription('L’utilisateur dont l’avertissement sera enlevé').setRequired(true)),
  new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Effacer un nombre spécifique de messages')
    .addIntegerOption(option => option.setName('nombre').setDescription('Le nombre de messages à effacer').setRequired(true)),
  new SlashCommandBuilder()
    .setName('classement')
    .setDescription('Affiche le classement des membres en fonction du temps passé en vocal'),
  new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Affiche la liste des commandes disponibles'),
];

// Enregistrement des slash commands
const rest = new REST({ version: '9' }).setToken(token);
(async () => {
  try {
    console.log('✅ Enregistrement des commandes slash...');
    await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
      body: commands.map(command => command.toJSON()),
    });
    console.log('✅ Commandes slash enregistrées avec succès!');
  } catch (error) {
    console.error('❌ Erreur enregistrement slash commands :', error);
  }
})();

// Initialisation du bot
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
  ],
  partials: [Partials.Channel]
});

// message de bienvenue
client.on('guildMemberAdd', async (member) => {
  const channel = member.guild.channels.cache.find((ch) => ch.name === 'ʙɪᴇɴᴠᴇɴᴜᴇ');
  const rolesChannel = member.guild.channels.cache.find(ch => ch.name === 'rᴏʟᴇs');
  const rulesChannel = member.guild.channels.cache.find(ch => ch.name === 'ʀᴜʟᴇs');
  const rolesMention = rolesChannel ? `<#${rolesChannel.id}>` : '#rᴏʟᴇs';
  const rulesMention = rulesChannel ? `<#${rulesChannel.id}>` : '#ʀᴜʟᴇs';

  if (!channel) return;

  try {
    const { name, memberCount } = member.guild;

    const welcomeEmbed = new EmbedBuilder()
      .setColor(0x1E2A78)
      .setDescription(
        `Tu as rejoint **LOL PAS TROP FR** !🫡 \n
        ❗ Avant toutes choses, merci de bien choisir un ou plusieurs ${rolesMention} afin de pouvoir avoir accès à l'intégralité du serveur !\n
        🖱️ Reste détendu et ne prend pas trop les games au sérieux!\n`
      )
      .setThumbnail(member.user.displayAvatarURL())
      .addFields(
        { name: '🎤 Présentation', value: 'Serveur discord crée dans le but de chill et jouer à plusieurs tout en détente et dans la bonne humeur ! 🙏 ', inline: false },
        { name: '🛡️ Règles', value: `Merci de lire les règles ${rulesMention}.`, inline: true },
        {
          name: '📊 Infos Serveur',
          value: `Nom : ${name}\nMembres : ${memberCount}`,
          inline: false,
        }
      )
      .setFooter({ text: 'Forge ta légende, invocateur !' })
      .setTimestamp();

    channel.send({
      content: `⚔️ Bienvenue ${member} !`,
      embeds: [welcomeEmbed]
    });
  } catch (error) {
    console.error('Erreur lors de l\'envoi du message de bienvenue :', error);
  }
});

client.on('guildMemberRemove', async (member) => {
  const channel = member.guild.channels.cache.find(ch => ch.name === 'ʙɪᴇɴᴠᴇɴᴜᴇ');
  if (!channel) return;

  const joinedAt = member.joinedAt;

  const timeAgo = formatDistanceToNow(joinedAt, { addSuffix: true, locale: fr });

  const leaveEmbed = new EmbedBuilder()
    .setColor(0xFF0000)
    .setTitle(`🚪 ${member.user.tag} a quitté le serveur`)
    .setThumbnail(member.user.displayAvatarURL())
    .setDescription(`Cet utilisateur avait rejoint le serveur **${timeAgo}**.`)
    .addFields({ name: 'À la prochaine, peut-être...', value: "", inline: false })
    .setTimestamp();

  channel.send({ embeds: [leaveEmbed] });
});

// Gestion des slash commands
client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  const { commandName, options } = interaction;
  const member = interaction.member;

  const permsRequises = {
    ban: 'BanMembers',
    deban: 'BanMembers',
    mute: 'ModerateMembers',
    demute: 'ModerateMembers',
    sondage: 'ManageMessages',
    warn: 'KickMembers',
    dewarn: 'KickMembers',
    clear: 'ManageMessages',
    ping: 'SendMessages',
  };

  const permission = permsRequises[commandName];
  if (permission && !member.permissions.has(permission)) {
    return interaction.reply({ content: "❌ Tu n'as pas la permission d'utiliser cette commande.", ephemeral: true });
  }

  try {
    if (commandName === 'ban') {
      const user = options.getUser('utilisateur');
      const memberToBan = interaction.guild.members.cache.get(user.id);
      if (!memberToBan) return interaction.reply("Utilisateur introuvable.");
      await memberToBan.ban();
      return interaction.reply(`${user.tag} a été **banni**.`);
    }

    if (commandName === 'clear') {
      const number = options.getInteger('nombre');
      if (number < 1 || number > 100) {
        return interaction.reply({ content: "❌ Veuillez spécifier un nombre entre 1 et 100.", ephemeral: true });
      }

      try {
        const fetchedMessages = await interaction.channel.messages.fetch({ limit: number });
        await interaction.channel.bulkDelete(fetchedMessages);
        return interaction.reply({ content: `✅ ${number} messages ont été supprimés.`, ephemeral: true });
      } catch (error) {
        console.error("Erreur lors de la suppression des messages : ", error);
        return interaction.reply({ content: "❌ Une erreur est survenue lors de la suppression des messages.", ephemeral: true });
      }
    }

    if (commandName === 'deban') {
      const user = options.getUser('utilisateur');
      await interaction.guild.bans.remove(user.id);
      return interaction.reply(`${user.tag} a été **débanni**.`);
    }

    if (commandName === 'mute') {
      const user = options.getUser('utilisateur');
      const durationStr = options.getString('durée');
      const memberToMute = interaction.guild.members.cache.get(user.id);
      if (!memberToMute) return interaction.reply("Utilisateur introuvable.");

      const match = durationStr.match(/^(\d+)(s|m|h)$/);
      if (!match) return interaction.reply("⛔ Format invalide. Utilise par exemple 10m, 2h, ou 30s.");
      const [, value, unit] = match;
      const multiplier = unit === 's' ? 1000 : unit === 'm' ? 60_000 : 3_600_000;
      const durationMs = parseInt(value) * multiplier;

      await memberToMute.timeout(durationMs);
      return interaction.reply(`${user.tag} a été **muté pendant ${value}${unit}**.`);
    }

    if (commandName === 'vocal') {
      const target = options.getUser('utilisateur') || interaction.user;
      const dataFile = './vocalTime.json';
      const data = fs.existsSync(dataFile) ? JSON.parse(fs.readFileSync(dataFile)) : {};
      const totalSeconds = data[target.id] || 0;

      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      const timeString = `${hours}h ${minutes}m ${seconds}s`;

      return interaction.reply(`🕒 ${target.tag} a passé **${timeString}** en vocal.`);
    }

    if (commandName === 'classement') {
      const dataFile = './vocalTime.json';
      if (!fs.existsSync(dataFile)) {
        return interaction.reply("❌ Aucune donnée de temps vocal disponible.");
      }

      const data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
      const sortedUsers = Object.entries(data)
        .map(([userId, time]) => ({ userId, time }))
        .sort((a, b) => b.time - a.time)
        .slice(0, 10);

      if (sortedUsers.length === 0) {
        return interaction.reply("❌ Aucune donnée sur le temps vocal.");
      }

      const leaderboard = sortedUsers
        .map(({ userId, time }, index) => {
          const minutes = Math.floor(time / 60);
          const seconds = time % 60;
          return `${index + 1}. <@${userId}> - ${minutes}m ${seconds}s`;
        })
        .join('\n');

      const embed = new EmbedBuilder()
        .setColor(0x1E2A78)
        .setTitle("🏆 Classement des membres en vocal")
        .setDescription(leaderboard)
        .setFooter({ text: 'Forge ta légende, invocateur !' })
        .setTimestamp();

      return interaction.reply({ embeds: [embed] });
    }

    if (commandName === 'demute') {
      const user = options.getUser('utilisateur');
      const memberToUnmute = interaction.guild.members.cache.get(user.id);
      if (!memberToUnmute) return interaction.reply("Utilisateur introuvable.");
      await memberToUnmute.timeout(null);
      return interaction.reply(`${user.tag} a été **démute**.`);
    }

    if (commandName === 'sondage') {
      const question = options.getString('question');
      const embed = {
        title: "📊 Nouveau sondage",
        description: question,
        color: 0x5865F2,
        footer: { text: `Par ${interaction.user.tag}` },
      };
      const pollMessage = await interaction.reply({ embeds: [embed], fetchReply: true });
      await pollMessage.react("👍");
      await pollMessage.react("👎");
    }

    if (commandName === 'warn') {
      const user = options.getUser('utilisateur');
      const memberToWarn = interaction.guild.members.cache.get(user.id);
      if (!memberToWarn) return interaction.reply("Utilisateur introuvable.");

      const warningsFile = './warnings.json';
      const warningsData = fs.existsSync(warningsFile) ? JSON.parse(fs.readFileSync(warningsFile)) : {};

      if (!warningsData[user.id]) warningsData[user.id] = 0;
      warningsData[user.id]++;

      fs.writeFileSync(warningsFile, JSON.stringify(warningsData));

      return interaction.reply(`${user.tag} a été **averti**. (Avertissements: ${warningsData[user.id]})`);
    }

    if (commandName === 'dewarn') {
      const user = options.getUser('utilisateur');
      const memberToDeWarn = interaction.guild.members.cache.get(user.id);
      if (!memberToDeWarn) return interaction.reply("Utilisateur introuvable.");

      const warningsFile = './warnings.json';
      const warningsData = fs.existsSync(warningsFile) ? JSON.parse(fs.readFileSync(warningsFile)) : {};

      if (!warningsData[user.id] || warningsData[user.id] === 0) {
        return interaction.reply(`${user.tag} n'a aucun avertissement à retirer.`);
      }

      warningsData[user.id]--;

      fs.writeFileSync(warningsFile, JSON.stringify(warningsData));

      return interaction.reply(`${user.tag} a eu un avertissement retiré. (Avertissements restants: ${warningsData[user.id]})`);
    }

  } catch (err) {
    console.error(err);
    interaction.reply({ content: "❌ Une erreur est survenue.", ephemeral: true });
  }
});

// Gestion des changements de salons vocaux
client.on('voiceStateUpdate', (oldState, newState) => {
  const userId = newState.id;
  const oldChannel = oldState.channelId;
  const newChannel = newState.channelId;

  const afkChannel = newState.guild.channels.cache.find(ch => ch.name === 'ᴀғᴋ');

  // Cas où on rejoint un salon vocal normal
  if (!oldChannel && newChannel) {
    if (newChannel !== afkChannel.id) { // Pas un salon AFK
      console.log(`[+] ${userId} a rejoint un vocal normal.`);
      voiceTimeMap.set(userId, Date.now());
    } else {
      console.log(`[~] ${userId} a rejoint le salon AFK. Pas de chrono.`);
    }
  }

  // Cas où on quitte un salon vocal
  if (oldChannel && !newChannel) {
    if (oldChannel !== afkChannel.id) { // Pas un salon AFK
      console.log(`[-] ${userId} quitte un vocal normal.`);
      saveVoiceTime(userId, globalTimeFile);  // Sauvegarder dans le fichier global
    } else {
      console.log(`[-] ${userId} quitte l'AFK. Pas de sauvegarde.`);
    }
    voiceTimeMap.delete(userId);
  }

  // Cas où on change de salon vocal
  if (oldChannel && newChannel && oldChannel !== newChannel) {
    if (oldChannel !== afkChannel.id) { // Quitte un salon vocal normal
      console.log(`[-] ${userId} quitte un vocal normal.`);
      saveVoiceTime(userId, globalTimeFile);
    }

    if (newChannel !== afkChannel.id) { // Rejoint un salon vocal normal
      console.log(`[+] ${userId} rejoint un vocal normal.`);
      voiceTimeMap.set(userId, Date.now());
    } else {  // Salon AFK
      console.log(`[~] ${userId} a rejoint le salon AFK. Pas de chrono.`);
    }
  }
});

checkWeeklyReset(generateWeeklyRanking); 

// Lancement du bot
client.once('ready', () => {
  console.log(`✅ Connecté en tant que ${client.user.tag}`);
});

client.login(token)
  .then(() => console.log("✅ Connexion réussie au bot Discord"))
  .catch(err => {
    console.error("❌ Erreur lors de la connexion au bot:", err);
    process.exit(1);
  });
