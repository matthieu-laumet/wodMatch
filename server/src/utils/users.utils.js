function formatPhoneFR(phoneNumber) {
  if (!phoneNumber) return null;
  
  // Enlever tous les caractères non numériques sauf le +
  const cleaned = phoneNumber.replace(/[^\d+]/g, '');
  
  // Si déjà au bon format international complet (+33XXXXXXXXX)
  if (cleaned.startsWith('+33') && cleaned.length === 12) {
    return cleaned;
  }
  
  // Enlever le + pour traiter les chiffres uniquement
  const numbersOnly = cleaned.replace('+', '');
  
  // Gérer les différents cas
  if (numbersOnly.length === 10 && numbersOnly.startsWith('0')) {
    // Format français standard (0X XX XX XX XX)
    return '+33' + numbersOnly.substring(1);
  } 
  else if (numbersOnly.length === 9) {
    // Numéro sans le 0 initial (6XXXXXXXX)
    return '+33' + numbersOnly;
  } 
  else if (numbersOnly.length === 11 && numbersOnly.startsWith('33')) {
    // Format 33XXXXXXXXX (sans +)
    return '+' + numbersOnly;
  } 
  else if (numbersOnly.length === 12 && numbersOnly.startsWith('330')) {
    // Format 330XXXXXXXXX (avec le 0)
    return '+33' + numbersOnly.substring(3);
  }
  else if (numbersOnly.length === 11 && numbersOnly.startsWith('330')) {
    // Format 330XXXXXXXX (10 chiffres avec 330)
    return '+33' + numbersOnly.substring(3);
  }
  
  // Si le numéro est déjà correct mais sans le +
  if (numbersOnly.length === 11 && numbersOnly.startsWith('33')) {
    return '+' + numbersOnly;
  }
  
  // Si aucun format reconnu, log une erreur et retourner null
  console.warn(`⚠️ Format de téléphone non reconnu: ${phoneNumber}`);
  return null;
}



module.exports = {
  formatPhoneFR
};