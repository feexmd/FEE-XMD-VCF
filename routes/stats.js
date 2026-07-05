const express = require('express');
const router = express.Router();
const fs = require('fs-extra');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../data/contacts.json');

router.get('/dashboard', async (req, res) => {
  try {
    const data = await fs.readJson(DATA_FILE);
    const contacts = data.contacts || [];
    
    const stats = {
      total: contacts.length,
      whatsapp: contacts.filter(c => c.isWhatsApp).length,
      regular: contacts.filter(c => !c.isWhatsApp).length,
      lastUpdated: data.lastUpdated || new Date().toISOString(),
      todayAdded: contacts.filter(c => {
        const today = new Date().toDateString();
        return new Date(c.createdAt).toDateString() === today;
      }).length,
      thisWeek: contacts.filter(c => {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return new Date(c.createdAt) >= weekAgo;
      }).length,
      countries: [...new Set(contacts.map(c => {
        const phone = c.phone.replace(/\s/g, '');
        if (phone.startsWith('+255') || phone.startsWith('0')) return 'Tanzania';
        if (phone.startsWith('+254')) return 'Kenya';
        if (phone.startsWith('+256')) return 'Uganda';
        return 'Other';
      }))]
    };
    
    res.json({ success: true, stats });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
