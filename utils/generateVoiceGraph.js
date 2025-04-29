const path = require('path');
const fs = require('fs');
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');

const width = 800;
const height = 400;
const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height });

async function generateVoiceGraph(userId, username, filePath = '../weeklyVoiceTime.json') {
  const jsonPath = path.join(__dirname, filePath);
  console.log(`Chemin du fichier : ${jsonPath}`);

  if (!fs.existsSync(jsonPath)) {
    console.log('Fichier introuvable. Création d\'un fichier vide...');
    fs.writeFileSync(jsonPath, JSON.stringify({}), 'utf-8');
  }

  const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

  if (!data[userId]) {
    throw new Error(`Aucune donnée trouvée pour ${username}.`);
  }

  const days = Object.keys(data[userId]);
  const times = Object.values(data[userId]).map(seconds => {
    const minutes = seconds / 60;
    return minutes < 1 ? minutes.toFixed(2) : Math.round(minutes);
  });

  const frenchDays = days.map(day => {
    switch (day.toLowerCase()) {
      case 'lun': return 'Lundi';
      case 'mar': return 'Mardi';
      case 'mer': return 'Mercredi';
      case 'jeu': return 'Jeudi';
      case 'ven': return 'Vendredi';
      case 'sam': return 'Samedi';
      case 'dim': return 'Dimanche';
      default: return day;
    }
  });

  if (frenchDays.length === 0 || times.length === 0) {
    throw new Error("Aucune donnée valide pour afficher le graphique.");
  }

  const config = {
    type: 'line',
    data: {
      labels: frenchDays,
      datasets: [{
        label: 'Temps vocal (minutes)',
        data: times,
        borderColor: 'rgba(75,192,192,1)',
        backgroundColor: 'rgba(75,192,192,0.2)',
        tension: 0.2,
        fill: true,
        pointBackgroundColor: 'rgba(75,192,192,1)',
        pointRadius: 5,
        borderWidth: 2,
      }]
    },
    options: {
      plugins: {
        title: {
          display: true,
          text: `Temps vocal de ${username}`,
          font: { size: 18, weight: 'bold' }
        },
        tooltip: {
          callbacks: {
            label: (tooltipItem) => `Temps : ${tooltipItem.raw} minutes`
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Minutes',
            font: { size: 14 }
          },
          ticks: {
            callback: (value) => value + ' min'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Jours',
            font: { size: 14 }
          },
          ticks: {
            autoSkip: false,
            maxRotation: 45,
            minRotation: 45,
          }
        }
      }
    }
  };

  return await chartJSNodeCanvas.renderToBuffer(config);
}

module.exports = { generateVoiceGraph };
