require('dotenv').config();

const allowedOrigins = [ 
  'http://localhost:5001', 
  'http://localhost:8081', 
  'http://localhost:8082', 
  'https://www.app.wodzone.fr',
  'https://www.app-back.wodzone.fr',
  'https://www.help.wodzone.fr',
  'https://www.wodzone.fr',
  'https://app.wodzone.fr',
  'https://app-back.wodzone.fr',
  'https://help.wodzone.fr',
  'https://wodzone.fr',
];

module.exports = allowedOrigins