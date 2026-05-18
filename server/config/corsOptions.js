const allowedOrigins = require('./allowedOrigins')

const silentBlockedOrigins = ['https://wodzone.onrender.com', 'https://wodzone-help.onrender.com'];

const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true)
    } else if (silentBlockedOrigins.includes(origin)) {
      // Rejette silencieusement, sans Error → pas de log
      callback(null, false)
    } else {
      console.warn(`[CORS] Origin bloquée : "${origin}"`)
      callback(new Error(`Not allowed by CORS: ${origin}`))
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
}

module.exports = corsOptions;