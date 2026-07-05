const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');
const { generateVCF } = require('../utils/vcfGenerator');
const { validatePhone, validateEmail } = require('../utils/validators');
const { checkWhatsAppNumber } = require('../utils/whatsappChecker');

const DATA_FILE = path.join(__dirname, '../data/contacts.json');
const VCF_FILE = path.join(__dirname, '../data/contacts.vcf');

// Initialize data file
if (!fs.existsSync(DATA_FILE)) {
  fs.writeJsonSync(DATA_FILE, { contacts: [], lastUpdated: new Date().toISOString() });
}

// Get all contacts
exports.getContacts = async (req, res) => {
  try {
    const data = await fs.readJson(DATA_FILE);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const start = (page - 1) * limit;
    const end = page * limit;
    
    const paginatedContacts = data.contacts.slice(start, end);
    
    res.json({
      success: true,
      total: data.contacts.length,
      page,
      limit,
      totalPages: Math.ceil(data.contacts.length / limit),
      data: paginatedContacts
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single contact
exports.getContact = async (req, res) => {
  try {
    const data = await fs.readJson(DATA_FILE);
    const contact = data.contacts.find(c => c.id === parseInt(req.params.id));
    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    res.json({ success: true, data: contact });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add contact with WhatsApp check
exports.addContact = async (req, res) => {
  try {
    const { firstName, lastName, email, phone } = req.body;
    const profilePic = req.file ? req.file.path : '';

    // Validate
    if (!firstName || !lastName || !email || !phone) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    if (!validatePhone(phone)) {
      return res.status(400).json({ error: 'Invalid phone number format' });
    }

    // Check WhatsApp
    const isWhatsApp = await checkWhatsAppNumber(phone);

    const data = await fs.readJson(DATA_FILE);
    
    // Check duplicate
    if (data.contacts.find(c => c.phone === phone)) {
      return res.status(400).json({ error: 'This phone number already exists' });
    }

    // Check limit
    if (data.contacts.length >= parseInt(process.env.MAX_CONTACTS || 500)) {
      // Auto generate VCF and notify
      await exports.generateVCFFile();
      return res.status(400).json({ 
        error: 'Maximum contacts reached! VCF file generated.',
        vcfReady: true,
        downloadUrl: '/api/contacts/generate-vcf'
      });
    }

    const newContact = {
      id: Date.now(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      profilePic: profilePic || '',
      isWhatsApp,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    data.contacts.push(newContact);
    data.lastUpdated = new Date().toISOString();
    await fs.writeJson(DATA_FILE, data, { spaces: 2 });

    // Auto generate VCF if reached limit
    if (data.contacts.length >= parseInt(process.env.MAX_CONTACTS || 500)) {
      await exports.generateVCFFile();
    }

    res.status(201).json({
      success: true,
      data: newContact,
      message: 'Contact added successfully',
      total: data.contacts.length
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Generate VCF file
exports.generateVCFFile = async () => {
  try {
    const data = await fs.readJson(DATA_FILE);
    const vcfContent = generateVCF(data.contacts);
    await fs.writeFile(VCF_FILE, vcfContent);
    return true;
  } catch (error) {
    console.error('VCF generation error:', error);
    return false;
  }
};

// Generate and download VCF
exports.generateVCF = async (req, res) => {
  try {
    const data = await fs.readJson(DATA_FILE);
    
    if (data.contacts.length === 0) {
      return res.status(400).json({ error: 'No contacts to export' });
    }

    const vcfContent = generateVCF(data.contacts);
    
    res.setHeader('Content-Type', 'text/vcard');
    res.setHeader('Content-Disposition', `attachment; filename=contacts_${Date.now()}.vcf`);
    res.send(vcfContent);
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Check WhatsApp number
exports.checkWhatsApp = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!validatePhone(phone)) {
      return res.status(400).json({ error: 'Invalid phone number' });
    }
    
    const isWhatsApp = await checkWhatsAppNumber(phone);
    res.json({ 
      phone, 
      isWhatsApp,
      message: isWhatsApp ? 'Number is on WhatsApp' : 'Number is not on WhatsApp'
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete contact
exports.deleteContact = async (req, res) => {
  try {
    const data = await fs.readJson(DATA_FILE);
    const index = data.contacts.findIndex(c => c.id === parseInt(req.params.id));
    
    if (index === -1) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    
    data.contacts.splice(index, 1);
    data.lastUpdated = new Date().toISOString();
    await fs.writeJson(DATA_FILE, data, { spaces: 2 });
    
    res.json({ success: true, message: 'Contact deleted' });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update contact
exports.updateContact = async (req, res) => {
  try {
    const data = await fs.readJson(DATA_FILE);
    const index = data.contacts.findIndex(c => c.id === parseInt(req.params.id));
    
    if (index === -1) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    
    const { firstName, lastName, email, phone } = req.body;
    
    data.contacts[index] = {
      ...data.contacts[index],
      firstName: firstName || data.contacts[index].firstName,
      lastName: lastName || data.contacts[index].lastName,
      email: email || data.contacts[index].email,
      phone: phone || data.contacts[index].phone,
      updatedAt: new Date().toISOString()
    };
    
    data.lastUpdated = new Date().toISOString();
    await fs.writeJson(DATA_FILE, data, { spaces: 2 });
    
    res.json({ success: true, data: data.contacts[index] });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};