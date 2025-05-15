const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../userMap.json');

let userMap = {};
if (fs.existsSync(filePath)) {
  try {
    userMap = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (err) {
    console.error('Erreur chargement userMap.json:', err);
  }
}

function updateUserMap(user) {
  if (!user || !user.id) return;

  if (!userMap[user.id]) {
    userMap[user.id] = {
      username: user.username,
      avatar: user.avatar,
    };
    fs.writeFileSync(filePath, JSON.stringify(userMap, null, 2), 'utf8');
  }
}

function getUserMap() {
  return userMap;
}

module.exports = { updateUserMap, getUserMap };
