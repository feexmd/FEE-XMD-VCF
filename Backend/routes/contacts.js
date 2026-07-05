const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const contactController = require('../controllers/contactController');

// Add contact with WhatsApp check
router.post('/add', upload.single('profilePic'), contactController.addContact);

// Get all contacts (paginated)
router.get('/', contactController.getContacts);

// Get single contact
router.get('/:id', contactController.getContact);

// Generate VCF
router.get('/generate-vcf', contactController.generateVCF);

// Check WhatsApp number
router.post('/check-whatsapp', contactController.checkWhatsApp);

// Delete contact
router.delete('/:id', contactController.deleteContact);

// Update contact
router.put('/:id', contactController.updateContact);

module.exports = router;