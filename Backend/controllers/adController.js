const fs = require('fs-extra');
const path = require('path');

const AD_FILE = path.join(__dirname, '../data/adTimers.json');

// Initialize
if (!fs.existsSync(AD_FILE)) {
  fs.writeJsonSync(AD_FILE, { users: {} });
}

// Ads data
const ADS = [
  {
    id: 1,
    title: '🚀 BORESHA WHATSAPP YAKO KWA BOT YA KISASA',
    description: 'Pata huduma ya kufungiwa WhatsApp Bot yenye uwezo wa Always Online, Auto View Status, Open View Once, Auto Read Text, Auto Reply na Huduma 24/7',
    price: 'Sh 2000/=',
    contact: '+255752593977',
    image: 'https://via.placeholder.com/300x150/6a1b9a/ffffff?text=WhatsApp+Bot',
    link: 'https://wa.me/255752593977'
  },
  {
    id: 2,
    title: '📱 KARIBU FEE-XMD CHANNEL',
    description: 'Pata taarifa za teknolojia, vifurushi na huduma mpya kila siku',
    contact: '+255752593977',
    image: 'https://via.placeholder.com/300x150/f9a825/ffffff?text=FEE-XMD',
    link: 'https://whatsapp.com/channel/0029VbBkXG5Dp2Q9Cyhbb02Q'
  }
];

exports.shouldShowAd = async (req, res) => {
  try {
    const userId = req.query.userId || 'default';
    const data = await fs.readJson(AD_FILE);
    const now = Date.now();
    const userData = data.users[userId] || { lastSeen: 0, count: 0 };
    
    const interval = parseInt(process.env.AD_INTERVAL) || 600000; // 10 minutes
    
    if (now - userData.lastSeen > interval) {
      // Update timer
      data.users[userId] = {
        lastSeen: now,
        count: (userData.count || 0) + 1
      };
      await fs.writeJson(AD_FILE, data, { spaces: 2 });
      
      // Get random ad
      const ad = ADS[Math.floor(Math.random() * ADS.length)];
      
      res.json({
        show: true,
        ad: ad,
        message: 'New ad available'
      });
    } else {
      res.json({
        show: false,
        nextAdIn: Math.ceil((interval - (now - userData.lastSeen)) / 1000) + ' seconds'
      });
    }
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAds = (req, res) => {
  res.json({ ads: ADS });
};

exports.markAdSeen = async (req, res) => {
  try {
    const { userId, adId } = req.body;
    const data = await fs.readJson(AD_FILE);
    
    if (!data.users[userId]) {
      data.users[userId] = { seenAds: [], lastSeen: 0 };
    }
    
    if (!data.users[userId].seenAds) {
      data.users[userId].seenAds = [];
    }
    
    data.users[userId].seenAds.push(adId);
    await fs.writeJson(AD_FILE, data, { spaces: 2 });
    
    res.json({ success: true });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};