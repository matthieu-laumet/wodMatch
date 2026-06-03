const axios = require('axios');

async function sendEmail(emailData) {
  try {
    await axios.post(`${process.env.BACKEND_LINK}/api/email/internal/send-mail`, emailData, {
      headers: {
        'x-service-secret': process.env.SERVICE_SECRET,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('[sendEmail]', error.message);
    throw new Error('Erreur envoi email');
  }
}

module.exports = { sendEmail };