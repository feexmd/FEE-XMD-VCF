const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');

const CHANNELS = [
  {
    id: 1,
    name: 'ATLAS MEMES CHANNEL',
    description: 'Memedi na burudani za WhatsApp',
    link: 'https://whatsapp.com/channel/0029Vb7yBSYElagyvG4Yqd0a',
    profile: 'https://via.placeholder.com/100/ff6f00/ffffff?text=ATLAS',
    category: 'Entertainment',
    subscribers: '1.5K+'
  },
  {
    id: 2,
    name: 'FEE-XMD CHANNEL',
    description: 'Teknolojia, vifurushi na huduma za kidijitali',
    link: 'https://whatsapp.com/channel/0029VbBkXG5Dp2Q9Cyhbb02Q',
    profile: 'https://via.placeholder.com/100/6a1b9a/ffffff?text=FEE-XMD',
    category: 'Technology',
    subscribers: '2.3K+'
  }
];

const FOLLOW_DATA = path.join(__dirname, '../data/follows.json');

if (!fs.existsSync(FOLLOW_DATA)) {
  fs.writeJsonSync(FOLLOW_DATA, { follows: [] });
}

exports.getChannels = async (req, res) => {
  try {
    // Add subscriber counts from external API if available
    const channelsWithData = await Promise.all(CHANNELS.map(async (channel) => {
      try {
        // Try to get real subscriber count from WhatsApp API
        // This is a placeholder - WhatsApp doesn't provide public API
        const response = await axios.get(channel.link, { timeout: 3000 });
        return {
          ...channel,
          active: response.status === 200
        };
      } catch {
        return {
          ...channel,
          active: false
        };
      }
    }));
    
    res.json({
      success: true,
      channels: channelsWithData,
      total: channelsWithData.length,
      message: 'Fuata channel zetu ili upate taarifa za VCF na huduma nyingine'
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.followChannel = async (req, res) => {
  try {
    const { channelId, userId, phone } = req.body;
    
    const data = await fs.readJson(FOLLOW_DATA);
    
    const follow = {
      id: Date.now(),
      channelId,
      userId: userId || 'anonymous',
      phone: phone || '',
      followedAt: new Date().toISOString()
    };
    
    data.follows.push(follow);
    await fs.writeJson(FOLLOW_DATA, data, { spaces: 2 });
    
    res.json({
      success: true,
      message: 'Asante kwa kufuata channel yetu!',
      channel: CHANNELS.find(c => c.id === channelId)
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getChannelStats = async (req, res) => {
  try {
    const data = await fs.readJson(FOLLOW_DATA);
    
    const stats = CHANNELS.map(channel => ({
      ...channel,
      followers: data.follows.filter(f => f.channelId === channel.id).length
    }));
    
    res.json({
      success: true,
      stats,
      totalFollowers: data.follows.length
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
