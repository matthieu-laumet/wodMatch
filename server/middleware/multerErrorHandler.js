const multer = require('multer');

function multerErrorHandler(err, req, res, next) {
  console.error('Erreur Multer:', err.message); // Pour le débogage
  console.error('User: ', req.id_user); // Pour le débogage
  
  if (err instanceof multer.MulterError) {
    // Erreurs Multer spécifiques
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ 
        isMulterError: true, 
        error: 'Fichier trop volumineux. Taille maximum : 3 Mo' 
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ 
        isMulterError: true, 
        error: 'Trop de fichiers envoyés' 
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ 
        isMulterError: true, 
        error: 'Champ de fichier inattendu' 
      });
    }
    // Autres erreurs Multer
    return res.status(400).json({ 
      isMulterError: true, 
      error: err.message 
    });
  } else if (err) {
    // Erreurs personnalisées (comme le fileFilter)
    return res.status(400).json({ 
      error: err.message || 'Erreur lors du traitement du fichier' 
    });
  }
  
  // Pas d'erreur, continuer
  next();
}

module.exports = multerErrorHandler;