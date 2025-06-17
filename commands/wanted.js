const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const Canvas = require('canvas');
const fetch = require('node-fetch');
const sharp = require('sharp');

/** Formatage nombre avec espaces pour les milliers */
function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

/** Génère un motif bois grain fin */
function drawWoodTexture(ctx, width, height) {
  // Fond bois dégradé brun foncé
  let grd = ctx.createLinearGradient(0, 0, 0, height);
  grd.addColorStop(0, '#5a3a0a');
  grd.addColorStop(1, '#4a2a00');
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, width, height);

  // Grain vertical très fin, alternance clair/foncé
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
  for (let x = 0; x < width; x += 2) {
    ctx.beginPath();
    ctx.moveTo(x + Math.sin(x / 20) * 2, 0);
    ctx.lineTo(x + Math.sin(x / 20) * 2, height);
    ctx.stroke();
  }

  // Noeuds de bois circulaires semi-transparents
  for (let i = 0; i < 30; i++) {
    let x = Math.random() * width;
    let y = Math.random() * height;
    let radius = 5 + Math.random() * 10;
    let alpha = 0.1 + Math.random() * 0.15;

    let gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, `rgba(30, 15, 0, ${alpha})`);
    gradient.addColorStop(1, 'rgba(30, 15, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

/** Crée une forme papier vieilli avec bord irrégulier */
function drawAgedPaper(ctx, width, height) {
  ctx.fillStyle = '#f5e8d0'; // papier clair
  ctx.strokeStyle = '#cbbf9a'; // bord
  ctx.lineWidth = 4;

  ctx.beginPath();

  // Bord supérieur ondulé
  let yTop = 40;
  ctx.moveTo(20, yTop);
  for (let x = 20; x < width - 20; x += 30) {
    let y = yTop + (Math.sin(x / 30) * 10);
    ctx.lineTo(x, y);
  }
  ctx.lineTo(width - 20, yTop);

  // Bord droit irrégulier
  for (let y = yTop; y < height - 40; y += 40) {
    let x = width - 20 + (Math.random() * 15 - 7);
    ctx.lineTo(x, y);
  }

  // Bord inférieur déchiré (petits zigzags)
  let yBot = height - 40;
  for (let x = width - 20; x > 20; x -= 20) {
    let y = yBot + ((x / 20) % 2 === 0 ? 5 : -5);
    ctx.lineTo(x, y);
  }

  // Bord gauche ondulé
  for (let y = height - 40; y > yTop; y -= 30) {
    let x = 20 + (Math.sin(y / 20) * 8);
    ctx.lineTo(x, y);
  }
  ctx.closePath();

  ctx.fill();
  ctx.stroke();

  // Textures grain papier
  for (let i = 0; i < 2000; i++) {
    ctx.fillStyle = `rgba(200, 180, 140, ${Math.random() * 0.05})`;
    let x = 20 + Math.random() * (width - 40);
    let y = yTop + Math.random() * (height - 80);
    ctx.fillRect(x, y, 1, 1);
  }
}

/** Dessine des punaises avec ombres et reflets */
function drawPins(ctx, width, height) {
  const pinRadius = 15;
  const pins = [
    { x: 40, y: 50 },
    { x: width - 40, y: 50 },
    { x: 40, y: height - 50 },
    { x: width - 40, y: height - 50 }
  ];

  ctx.fillStyle = '#7a4c1c';
  pins.forEach(pin => {
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(pin.x, pin.y, pinRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Reflet ellipse
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.beginPath();
    ctx.ellipse(pin.x - 5, pin.y - 5, 7, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Remet couleur pin
    ctx.fillStyle = '#7a4c1c';
  });
}

/** Dessine texte avec contour pour effet 3D */
function drawText3D(ctx, text, x, y, font, fillColor, strokeColor, lineWidth = 3, shadow = true) {
  ctx.font = font;
  ctx.textAlign = 'center';
  if (shadow) {
    ctx.shadowColor = 'rgba(0,0,0,0.7)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 3;
  }
  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = strokeColor;
  ctx.strokeText(text, x, y);
  ctx.fillStyle = fillColor;
  ctx.fillText(text, x, y);
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
}

/** Dessine cadre décoratif autour de l'avatar */
function drawAvatarFrame(ctx, x, y, size) {
  // Ombre portée large
  ctx.shadowColor = 'rgba(0,0,0,0.7)';
  ctx.shadowBlur = 20;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  // Cadre doré à double contour
  ctx.lineWidth = 12;
  ctx.strokeStyle = '#bfa95c';
  ctx.strokeRect(x - 6, y - 6, size + 12, size + 12);

  ctx.lineWidth = 4;
  ctx.strokeStyle = '#f6e27f';
  ctx.strokeRect(x + 4, y + 4, size - 8, size - 8);

  ctx.shadowBlur = 0;
}

/** Dessine poussière/particules flottantes */
function drawParticles(ctx, width, height) {
  for (let i = 0; i < 100; i++) {
    let x = Math.random() * width;
    let y = Math.random() * height;
    let size = Math.random() * 2 + 1;
    let alpha = Math.random() * 0.15;
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
}

/** Dessine ligne décorative en bas */
function drawDecorativeLine(ctx, width, y) {
  ctx.strokeStyle = '#4a2c0c';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(width / 5, y);
  ctx.bezierCurveTo(width / 2, y - 20, width / 2, y + 20, width * 4 / 5, y);
  ctx.stroke();
}

/** Génère l'affiche WANTED complète */
async function generateWantedCanvas(user, reward, message) {
  const width = 600;
  const height = 800;
  const canvas = Canvas.createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Fond bois texturé
  drawWoodTexture(ctx, width, height);

  // Papier vieilli déchiré
  drawAgedPaper(ctx, width, height);

  // Punaises
  drawPins(ctx, width, height);

  // Texte WANTED avec effet 3D
  drawText3D(ctx, 'WANTED', width / 2, 130, 'bold 80px Arial Black', '#6e3e0a', '#3b1e00', 6);

  // Texte message perso en dessous
  drawText3D(ctx, message.toUpperCase(), width / 2, 180, 'bold 32px Georgia', '#6e3e0a', '#3b1e00', 4);

  // Chargement avatar et conversion PNG
  const avatarURL = user.displayAvatarURL({ format: 'png', size: 512, dynamic: false });
  const res = await fetch(avatarURL);
  if (!res.ok) throw new Error(`Failed to fetch avatar: ${res.status}`);
  const webpBuffer = await res.buffer();
  const pngBuffer = await sharp(webpBuffer).png().toBuffer();
  const avatar = await Canvas.loadImage(pngBuffer);

  // Dessiner avatar centré carré
  const avatarSize = 320;
  const avatarX = (width - avatarSize) / 2;
  const avatarY = 200;
  ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);

  // Cadre décoratif autour de l'avatar
  drawAvatarFrame(ctx, avatarX, avatarY, avatarSize);

  // Texte username sous avatar avec ombre
  drawText3D(ctx, user.username, width / 2, avatarY + avatarSize + 60, 'bold 40px Georgia', '#6e3e0a', '#3b1e00', 4);

  // Texte REWARD en bas
  drawText3D(ctx, 'REWARD', width / 2, height - 160, 'bold 50px Arial Black', '#6e3e0a', '#3b1e00', 5);

  // Montant récompense
  drawText3D(ctx, reward, width / 2, height - 100, 'bold 42px Georgia', '#6e3e0a', '#3b1e00', 4);

  // Ligne décorative en bas
  drawDecorativeLine(ctx, width, height - 80);

  // Particules poussières flottantes
  drawParticles(ctx, width, height);

  return canvas.toBuffer();
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('wanted')
    .setDescription('Génère une affiche WANTED personnalisée.')
    .addUserOption(option =>
      option.setName('utilisateur')
        .setDescription("L'utilisateur à afficher")
        .setRequired(false)
    )
    .addStringOption(option =>
      option.setName('récompense')
        .setDescription("Montant de la récompense (laisser vide pour aléatoire)")
        .setRequired(false)
    )
    .addStringOption(option =>
      option.setName('message')
        .setDescription("Message personnalisé sous la photo")
        .setRequired(false)
    ),

  async execute(interaction) {
    const user = interaction.options.getUser('utilisateur') || interaction.user;

    let reward;
    if (interaction.options.getString('récompense')) {
      reward = interaction.options.getString('récompense');
    } else {
      const randomReward = Math.floor(Math.random() * (100000 - 1000 + 1)) + 1000;
      reward = formatNumber(randomReward) + ' $';
    }

    const message = interaction.options.getString('message') || "DEAD OR ALIVE";

    try {
      const buffer = await generateWantedCanvas(user, reward, message);
      const attachment = new AttachmentBuilder(buffer, { name: 'wanted.png' });
      await interaction.reply({ files: [attachment] });
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: '❌ Une erreur est survenue.', flags: 64 });
    }
  }
};
