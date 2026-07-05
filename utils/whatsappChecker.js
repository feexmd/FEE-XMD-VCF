const axios = require('axios');

exports.checkWhatsAppNumber = async (phone) => {
  try {
    // Using wa.me API - checks if number exists on WhatsApp
    const response = await axios.get(`https://wa.me/${phone}`, {
      timeout: 5000,
      maxRedirects: 0,
      validateStatus: null
    });
    
    // If response is 200 or redirect, number exists
    return response.status === 200 || response.status === 302;
    
  } catch (error) {
    // Alternative: Use external API like twilio or waha
    console.log('WhatsApp check failed, using fallback');
    return false;
  }
};

// Alternative using external API (if you have Twilio)
exports.checkWhatsAppTwilio = async (phone) => {
  try {
    // Twilio WhatsApp API
    const response = await axios.post(
      `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`,
      new URLSearchParams({
        To: `whatsapp:${phone}`,
        From: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
        Body: 'WhatsApp verification'
      }),
      {
        auth: {
          username: process.env.TWILIO_ACCOUNT_SID,
          password: process.env.TWILIO_AUTH_TOKEN
        }
      }
    );
    return response.status === 201;
  } catch (error) {
    return false;
  }
};
