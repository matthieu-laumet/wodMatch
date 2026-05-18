const apiKeyMiddleware = (req, res, next) => {
  const origin = req.headers.origin;
  const apiKey = req.headers['x-api-key'];

  // Si pas d'origine (app mobile) → exiger une API key
  if (!origin) {
    if ((apiKey && apiKey === process.env.MOBILE_API_KEY) || process.env.NODE_ENV !== 'production') {
      return next()
    }
    return res.status(403).json({ message: 'API key requise' })
  }

  next()
}

module.exports = apiKeyMiddleware;