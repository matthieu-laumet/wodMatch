const jwt = require('jsonwebtoken');
require('dotenv').config();

const verifyJWT = async (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  const publicRoutes = ['/', '/favicon.ico', '/robots.txt'];
  
  if (publicRoutes.includes(req.path)) {
    return next();
  }

  // Ignorer les routes .php sans logs
  const suspiciousPatterns = [
    '.php', '.aspx', '.jsp', 'phpMyAdmin', 'wp-admin', 'wp-login', 'manager', 'modx',
    'backup', '.sql'
  ];
  if (suspiciousPatterns.some(pattern => req.path.includes(pattern))) {
    return res.sendStatus(404);
  }

  // Routes à ne pas logger
  // const silentRoutes = [
  //   /^\/volunteers\/get-volunteer-dispos\/\d+/,
  //   /^\/users\/get-division-from-user\/\d+/
  // ];
  // const shouldLog = !silentRoutes.some(pattern => pattern.test(req.originalUrl));

  // Log si aucun header Authorization
  if (!authHeader) {
    // if (shouldLog) {
    //   console.log('[AUTH] ❌ Aucun header Authorization fourni');
    //   console.log(`[AUTH] Route demandée: ${req.method} ${req.originalUrl}`);
    // }
    return res.sendStatus(401);
  }

  // Log si le format Bearer est incorrect
  if (!authHeader.startsWith('Bearer ')) {
    console.log('[AUTH] ❌ Format Authorization invalide (Bearer manquant)');
    console.log(`[AUTH] Header reçu: ${authHeader.substring(0, 50)}...`);
    console.log(`[AUTH] Route demandée: ${req.method} ${req.originalUrl}`);
    return res.sendStatus(401);
  }

  const token = authHeader.split(' ')[1];
  
  jwt.verify(
    token,
    process.env.ACCESS_TOKEN_SECRET,
    (err, decoded) => {
      if (err) {
        // Logs détaillés selon le type d'erreur
        if (err.name === 'TokenExpiredError') {
          // console.log('[AUTH] ⏰ Token expiré');
          // console.log(`[AUTH] Expiré le: ${err.expiredAt}`);
        } else if (err.name === 'JsonWebTokenError') {
          console.log('[AUTH] ❌ Token invalide');
          console.log(`[AUTH] Raison: ${err.message}`);
          console.log(`[AUTH] Route demandée: ${req.method} ${req.originalUrl}`);
        } else {
          console.log('[AUTH] ❌ Erreur de vérification du token');
          console.log(`[AUTH] Erreur: ${err.message}`);
          console.log(`[AUTH] Route demandée: ${req.method} ${req.originalUrl}`);
        }
        return res.status(403).json({ message: 'Forbidden' });
      }
      
      req.user = decoded.UserInfo.email;
      req.id_user = decoded.UserInfo.id_user;
      next();
    }
  );
};

module.exports = verifyJWT;