const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Import routes
const contactRoutes = require('./routes/contacts');
const adRoutes = require('./routes/ads');
const channelRoutes = require('./routes/channels');
const statsRoutes = require('./routes/stats');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api/', limiter);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use('/data', express.static(path.join(__dirname, 'data')));

// Routes
app.use('/api/contacts', contactRoutes);
app.use('/api/ads', adRoutes);
app.use('/api/channels', channelRoutes);
app.use('/api/stats', statsRoutes);

// Auto set date - Tanzania time
app.get('/api/date', (req, res) => {
  const now = new Date();
  const options = { 
    timeZone: 'Africa/Dar_es_Salaam',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  res.json({ 
    date: now.toLocaleDateString('sw-TZ', options),
    timestamp: now.getTime()
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK',
    developer: 'Fredi Elibarick Ezra',
    location: 'Arusha, Tanzania',
    year: 2026
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📍 Location: Arusha, Tanzania`);
  console.log(`👨‍💻 Developer: Fredi Elibarick Ezra`);
});