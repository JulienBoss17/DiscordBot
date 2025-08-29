const { 
  SlashCommandBuilder, 
  EmbedBuilder, 
  StringSelectMenuBuilder, 
  ActionRowBuilder 
} = require('discord.js');
const fetch = require('node-fetch');
const translate = require('@vitalets/google-translate-api'); // <-- traduction stable

// Mapping français → anglais pour l'API
const SIGN_MAP = {
  'bélier': 'aries',
  'taureau': 'taurus',
  'gémeaux': 'gemini',
  'cancer': 'cancer',
  'lion': 'leo',
  'vierge': 'virgo',
  'balance': 'libra',
  'scorpion': 'scorpio',
  'sagittaire': 'sagittarius',
  'capricorne': 'capricorn',
  'verseau': 'aquarius',
  'poissons': 'pisces'
};

// Emojis pour chaque signe
const SIGN_EMOJI = {
  'bélier': '♈', 'taureau': '♉', 'gémeaux': '♊', 'cancer': '♋',
  'lion': '♌', 'vierge': '♍', 'balance': '♎', 'scorpion': '♏',
  'sagittaire': '♐', 'capricorne': '♑', 'verseau': '♒', 'poissons': '♓'
};

// Couleur pour chaque signe
const SIGN_COLOR = {
  'bélier': 0xFF5733, 'taureau': 0xFFBD33, 'gémeaux': 0x75FF33, 'cancer': 0x33FF57,
  'lion': 0x33FFBD, 'vierge': 0x33D4FF, 'balance': 0x3375FF, 'scorpion': 0x7533FF,
  'sagittaire': 0xD433FF, 'capricorne': 0xFF33A8, 'verseau': 0xFF335E, 'poissons': 0xFF3333
};

const SIGNS_FR = Object.keys(SIGN_MAP);

const LOL_PREDICTIONS = [
  "Tu feed ton jungler malgré toi aujourd’hui.",
  "Ton ulti va renverser un fight improbable.",
  "Tu voles un dragon en solo, applause irl.",
  "Ton smite sera parfait (ou pas).",
  "Teamfight épique incoming, prépare les pings.",
  "Ta lane va push plus vite que prévu.",
  "Un gank surprise va te sauver la vie.",
  "Tu splitpush comme un vrai stratège.",
  "Ward placée au bon endroit, bravo !",
  "Ton ADC oublie de farmer, c’est ton jour de gloire.",
  "Tu esquives un skillshot crucial, feelgood moment.",
  "La prochaine teamfight va te faire briller.",
  "Tu sécurises un baron sans stress.",
  "Ton support pleure de joie (ou de rage).",
  "Un pentakill est peut-être à portée de main.",
  "Le timer du dragon est ton meilleur ami.",
  "Gros engage incoming, sois prêt.",
  "Tu fais un 1v2 improbable et tu t’en sors.",
  "Un dive bien calculé va te rapporter un kill.",
  "Ta vision map va sauver ton équipe.",
  "Tu prends un turret gratuitement, merci qui ?",
  "Ton flash va changer le cours d’un fight.",
  "Un reset parfait te met dans la course.",
  "Ton lane opponent va ragequit (peut-être).",
  "Tu kite comme un pro, respect.",
  "Le jungler ennemi te sous-estime.",
  "Tu prends la lead dans le prochain fight.",
  "Objectif sécurisé avec brio.",
  "Ton poke met en pression l’ennemi.",
  "Ult incoming, prépare ton highlight.",
  "Ton teamfight split est légendaire.",
  "Tu réussis un combo inattendu, applause.",
  "Un steal de buff légendaire se profile.",
  "Tu survives avec 10 HP, feel alive.",
  "Ta vision fait tilt l’ennemi.",
  "Le next drag est ton moment pour briller.",
  "Ton roam va surprendre toute la team.",
  "Tu contrôles le midgame comme un chef.",
  "Gank réussi, ton team est impressionnée.",
  "Tu clean un wave mieux que jamais.",
  "Ton engage initie la victoire.",
  "Une kite parfaite fait fuir l’ennemi.",
  "Ton CC change le fight à lui seul.",
  "Tu splitpush pendant que le reste fight.",
  "Vision resetée, tu sauves la game.",
  "Un steal de jungle improbable arrive.",
  "Tu bait l’ennemi comme un pro.",
  "Le next teamfight sera épique grâce à toi.",
  "Tu pings mieux que ton support.",
  "Ta lane dominance est incontestable.",
  "Tu trades mieux que prévu, gg.",
  "Ton ulti va renverser le midgame.",
  "Tu backdoor un inhibiteur, style pro.",
  "Une teamfight clutch t’attend.",
  "Ton engage est synchronisé parfaitement.",
  "Tu échapppes à un gank inimaginable.",
  "Objectif pris sous le nez de l’ennemi.",
  "Ton skillshot touche tout le monde.",
  "Tu kite le carry ennemi à la perfection.",
  "Ta macro décision change le cours du game.",
  "Tu wardes parfaitement le Baron.",
  "Ton timing d’ulti est impeccable.",
  "Tu punish le splitpush adverse.",
  "Un fight en 3v4 tourne en ta faveur.",
  "Ton burst delete l’ADC ennemi.",
  "Une engage surprise va faire tilt l’ennemi.",
  "Ton kiting sauve un fight perdu.",
  "Le prochain dragon est sécurisé grâce à toi.",
  "Ta lane va snowball de manière épique.",
  "Tu fais un steal d’inhibiteur incroyable.",
  "Ton poke constant fatigue l’équipe ennemie.",
  "Ta roam mid change la dynamique du jeu.",
  "Tu trades au perfection et reprends lane.",
  "Ton engage CC le backline adverse.",
  "Tu splitpush avec confiance totale.",
  "La prochaine fight est ta scène de gloire.",
  "Ton teamplay est irréprochable aujourd’hui.",
  "Une pick-off improbable te fait sourire.",
  "Tu wardes deep et évites un gank.",
  "Ton burst fait tomber le tank ennemi.",
  "Une rotation parfaite arrive de ta part.",
  "Tu bait le jungler adverse et c’est parfait.",
  "Ton ulti engage ou disengage au moment clé.",
  "Tu kite le carry adverse avec style.",
  "Ta lane pressure est insupportable pour l’ennemi.",
  "Le next objective va tomber entre tes mains.",
  "Tu survives un 1v3 impossible.",
  "Ta vision map claque la game.",
  "Un engage parfait te met en avant.",
  "Tu backdoor en solo et surprends l’ennemi.",
  "Ton CC sauve la fight.",
  "Tu trades mieux que jamais.",
  "Un steal de jungle te donne l’avantage.",
  "Ton poke constant fait tilt l’équipe adverse.",
  "Une engage surprise va faire briller ton team.",
  "Ton ulti change la dynamique d’un fight.",
  "Tu kite le carry avec excellence.",
  "Ta macro décision est décisive.",
  "Tu wardes au bon endroit, gg.",
  "Ton burst delete l’ennemi prioritaire.",
  "Une rotation parfaite t’offre un avantage stratégique.",
  "Tu bait l’adversaire et c’est parfait.",
  "Ton engage est synchronisé au poil.",
  "Tu échappes à un gank improbable.",
  "Objectif pris sous la pression ennemie.",
  "Ton skillshot touche le max de cibles.",
  "Tu kite le carry adverse parfaitement.",
  "Ta macro décision change le midgame.",
  "Tu wardes le Baron parfaitement.",
  "Ton timing d’ulti est parfait.",
  "Tu punish le splitpush adverse avec brio.",
  "Un fight en 3v4 tourne à ton avantage.",
  "Ton burst élimine le carry adverse.",
  "Une engage surprise va faire tilt l’ennemi.",
  "Ton kiting sauve un fight perdu.",
  "Le prochain dragon est sécurisé grâce à toi.",
  "Ta lane snowball de manière épique.",
  "Tu fais un steal d’inhibiteur incroyable.",
  "Ton poke constant fatigue l’équipe ennemie.",
  "Ta roam mid change la dynamique du jeu.",
  "Tu trades au perfection et reprends lane.",
  "Ton engage CC le backline adverse.",
  "Tu splitpush avec confiance totale.",
  "La prochaine fight est ta scène de gloire.",
  "Ton teamplay est irréprochable aujourd’hui.",
  "Une pick-off improbable te fait sourire.",
  "Tu wardes deep et évites un gank.",
  "Ton burst fait tomber le tank ennemi.",
  "Une rotation parfaite arrive de ta part.",
  "Tu bait le jungler adverse et c’est parfait.",
  "Ton ulti engage ou disengage au moment clé.",
  "Tu kite le carry adverse avec style.",
  "Ta lane pressure est insupportable pour l’ennemi.",
  "Le next objective va tomber entre tes mains.",
  "Tu survives un 1v3 impossible.",
  "Ta vision map claque la game.",
  "Un engage parfait te met en avant.",
  "Tu backdoor en solo et surprends l’ennemi.",
  "Ton CC sauve le fight.",
  "Tu trades mieux que jamais.",
  "Un steal de jungle te donne l’avantage.",
  "Ton poke constant fait tilt l’équipe adverse.",
  "Une engage surprise va faire briller ton team.",
  "Ton ulti change la dynamique d’un fight.",
  "Tu kite le carry avec excellence.",
  "Ta macro décision est décisive.",
  "Tu wardes au bon endroit, gg.",
  "Ton burst delete l’ennemi prioritaire.",
  "Une rotation parfaite t’offre un avantage stratégique.",
  "Tu bait l’adversaire et c’est parfait.",
  "Ton engage est synchronisé au poil.",
  "Tu échappes à un gank improbable.",
  "Objectif pris sous la pression ennemie.",
  "Ton skillshot touche le max de cibles.",
  "Tu kite le carry adverse parfaitement.",
  "Ta macro décision change le midgame.",
  "Tu wardes le Baron parfaitement.",
  "Ton timing d’ulti est parfait.",
  "Tu punish le splitpush adverse avec brio.",
  "Un fight en 3v4 tourne à ton avantage.",
  "Ton burst élimine le carry adverse.",
  "Une engage surprise va faire tilt l’ennemi.",
  "Ton kiting sauve un fight perdu.",
  "Le prochain dragon est sécurisé grâce à toi.",
];

const HOROSCOPES_FALLBACK = [
  "Aujourd'hui est un jour parfait pour de nouvelles aventures.",
  "Les astres t'encouragent à prendre des risques calculés.",
  "Une surprise inattendue pourrait égayer ta journée.",
  "Prends le temps de réfléchir avant de réagir."
];

// Traduction stable via Google Translate API non officielle
async function translateToFrench(text) {
  try {
    const res = await translate(text, { to: 'fr' });
    return res.text || text;
  } catch (err) {
    console.error('Erreur traduction :', err);
    return text;
  }
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('horoscope')
    .setDescription('Donne ton horoscope du jour + une prédiction gaming LoL humoristique.'),

  async execute(interaction) {
    const menu = new StringSelectMenuBuilder()
      .setCustomId('select-sign')
      .setPlaceholder('Choisis ton signe du zodiaque')
      .addOptions(SIGNS_FR.map(sign => ({
        label: `${SIGN_EMOJI[sign]} ${sign.charAt(0).toUpperCase() + sign.slice(1)}`,
        value: sign
      })));

    await interaction.reply({
      content: 'Sélectionne ton signe : ⏳',
      components: [new ActionRowBuilder().addComponents(menu)],
      ephemeral: true
    });
  },

  async handleSelect(interaction) {
    if (!interaction.isStringSelectMenu() || interaction.customId !== 'select-sign') return;

    const signFr = interaction.values[0];
    const signEn = SIGN_MAP[signFr];
    const emoji = SIGN_EMOJI[signFr];
    const color = SIGN_COLOR[signFr] || 0xFFD700;

    await interaction.update({ content: `Récupération de l'horoscope pour ${signFr}… ⏳`, components: [] });

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      const res = await fetch(`https://horoscope-app-api.vercel.app/api/v1/get-horoscope/daily?sign=${signEn}`, {
        signal: controller.signal
      });
      clearTimeout(timeout);

      const json = await res.json();
      const horoscopeText = json.data?.horoscope_data || HOROSCOPES_FALLBACK[Math.floor(Math.random() * HOROSCOPES_FALLBACK.length)];
      const horoscope = await translateToFrench(horoscopeText);

      const gaming = LOL_PREDICTIONS[Math.floor(Math.random() * LOL_PREDICTIONS.length)];

      const embed = new EmbedBuilder()
        .setColor(color)
        .setTitle(`${emoji} Horoscope du jour – ${signFr.charAt(0).toUpperCase() + signFr.slice(1)}`)
        .addFields(
          { name: '🔮 Sérieux (Amour / Travail / Chance)', value: horoscope },
          { name: '🎮 Prédiction gaming (LoL - fun)', value: gaming }
        )
        .setTimestamp();

      await interaction.editReply({ content: null, embeds: [embed] });

    } catch (err) {
      console.error(err);
      await interaction.editReply({
        content: '❌ Impossible de récupérer l’horoscope (API lente ou indisponible).',
        embeds: []
      });
    }
  }
};
