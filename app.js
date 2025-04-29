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
const { saveVoiceTime } = require('./utils/SaveVoiceTime');
const { resetWeeklyVocalTime } = require('./utils/ResetWeeklyVocalTime');
const { startAutoGraphUpdater } = require('./services/autoGraphUpdater');
const { generateVoiceGraph } = require('./utils/generateVoiceGraph');
const { AttachmentBuilder } = require('discord.js');






// IDs importants
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;
const token = process.env.TOKEN;

if (!token || !clientId || !guildId) {
  console.error("❌ Vérifie que TOKEN, CLIENT_ID et GUILD_ID sont bien définis dans ton fichier .env");
  process.exit(1);
}

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

client.commands = new Map();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

const commands = []; // Initialisation du tableau de commandes

for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  if (command.data) {
    commands.push(command.data.toJSON()); // Ajoute la commande au tableau
    client.commands.set(command.data.name, command); // Stocke la commande pour l'exécution
  } else {
    console.warn(`⚠️ La commande ${file} ne contient pas 'data'.`);
  }
}


const rest = new REST({ version: '9' }).setToken(token);

(async () => {
  try {
    console.log('✅ Enregistrement des commandes slash...');
    await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
      body: commands, // Ici, commands doit être un tableau contenant les commandes
    });
    console.log('✅ Commandes slash enregistrées avec succès!');
  } catch (error) {
    console.error('❌ Erreur enregistrement slash commands :', error);
  }
})();


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

// Gestion des interactions
client.on('interactionCreate', async interaction => {
  // 🎯 Si c'est une interaction de menu déroulant
  if (interaction.isStringSelectMenu() && interaction.customId === 'select_user_stats') {
    const userId = interaction.values[0];
    const user = await interaction.client.users.fetch(userId);
    const username = user.username;

    try {
      const buffer = await generateVoiceGraph(userId, username);
      const attachment = new AttachmentBuilder(buffer, { name: 'graph.png' });

      const embed = new EmbedBuilder()
        .setTitle(`📊 Statistiques vocales - ${username}`)
        .setImage('attachment://graph.png')
        .setColor(0x00AEFF)
        .setTimestamp();

      await interaction.update({ embeds: [embed], files: [attachment] });
    } catch (err) {
      console.error(err);
      await interaction.reply({ content: "Erreur lors de la génération du graphique.", ephemeral: true });
    }

    return; // On quitte ici, pas besoin d'exécuter une commande slash
  }

  // 🎯 Si c'est une commande slash
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: '❌ Une erreur est survenue lors de l\'exécution de la commande.', ephemeral: true });
  }
});


const voiceTimeMap = new Map();

client.on('voiceStateUpdate', (oldState, newState) => {
  const userId = newState.id;
  
  const oldChannel = oldState.channelId;
  const newChannel = newState.channelId;

  // Récupérer le salon AFK depuis le serveur
  const afkChannel = newState.guild.channels.cache.find(ch => ch.name === 'ᴀғᴋ');

  if (!afkChannel) {
    console.log('Salon AFK non trouvé');
    return;
  }

  // --- Cas 1 : Rejoint un salon vocal
  if (!oldChannel && newChannel) {
    if (newChannel !== afkChannel.id) { // Si ce n'est PAS l'AFK
      console.log(`[+] ${userId} a rejoint un vocal normal.`);
      voiceTimeMap.set(userId, Date.now());
    } else {
      console.log(`[~] ${userId} a rejoint le salon AFK. Pas de chrono.`);
    }
    return;
  }

  // --- Cas 2 : Quitte un salon vocal
  if (oldChannel && !newChannel) {
    if (oldChannel !== afkChannel.id) {
      console.log(`[-] ${userId} quitte un vocal normal.`);
      saveVoiceTime(userId, voiceTimeMap);
;
    } else {
      console.log(`[-] ${userId} quitte l'AFK. Pas de sauvegarde.`);
    }
    voiceTimeMap.delete(userId);
    return;
  }

  // --- Cas 3 : Change de salon vocal
  if (oldChannel && newChannel && oldChannel !== newChannel) {
    if (oldChannel === afkChannel.id) {
      console.log(`[+] ${userId} passe de l'AFK à un salon normal.`);
      voiceTimeMap.set(userId, Date.now());
      return;
    }

    if (newChannel === afkChannel.id) {
      console.log(`[~] ${userId} passe d'un salon normal à l'AFK.`);
      saveVoiceTime(userId, voiceTimeMap);
;
      voiceTimeMap.delete(userId);
      return;
    }

    console.log(`[↔] ${userId} change de salon normal.`);
    saveVoiceTime(userId, voiceTimeMap);;
    voiceTimeMap.set(userId, Date.now());
    return;
  }
});



const blockedUsers = new Set();

// Lancement du bot
client.once('ready', () => {
  console.log(`✅ Connecté en tant que ${client.user.tag}`);
  resetWeeklyVocalTime(client); // <- ICI !
  startAutoGraphUpdater(client, '1355638066424844486');
});

client.login(token)
  .then(() => console.log("✅ Connexion réussie au bot Discord"))
  .catch(err => {
    console.error("❌ Erreur lors de la connexion au bot:", err);
    process.exit(1);
  });
