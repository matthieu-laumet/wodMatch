// const jwt = require('jsonwebtoken');

// async function generateTokenTicketUtils (id_user, id_division, id_competition) {
//   const secret = process.env.JWT_SECRET + id_user + id_division;
//   const token = jwt.sign({ id_user, id_division }, secret, {
//     expiresIn: "1d",
//   });
//   const link = `${process.env.FRONTEND_LINK}/open-queue-ticket/${id_competition}/${id_division}/${token}`;
//   console.log(link);
//   return link
// }

// async function prepareAttachments(attachments) {
//   if (!attachments || !Array.isArray(attachments)) return [];
//   return attachments.map(attachment => {
//     // Si c'est déjà un Buffer
//     if (Buffer.isBuffer(attachment.data)) {
//       return {
//         data: attachment.data, filename: attachment.fileName || attachment.filename || 'file',
//         contentType: attachment.contentType || getContentType(attachment.fileName || attachment.filename)
//       };
//     }
//     // Si c'est en base64
//     if (attachment.base64 || attachment.data) {
//       const base64Data = attachment.base64 || attachment.data;
//       const buffer = Buffer.from(base64Data, 'base64');
//       return {
//         data: buffer, filename: attachment.fileName || attachment.filename || 'file',
//         contentType: attachment.contentType || getContentType(attachment.fileName || attachment.filename)
//       };
//     }
//     // Si c'est un chemin de fichier
//     if (attachment.path) {
//       return { filename: attachment.fileName || attachment.filename || 'file', data: attachment.path  };
//     }
//     throw new Error('Format de pièce jointe non supporté');
//   });
// }

// function getContentType(fileName) {
//   if (!fileName) return 'application/octet-stream';
//   const ext = fileName.toLowerCase().split('.').pop();
//   const mimeTypes = {
//     // Documents
//     'pdf': 'application/pdf',
//     'doc': 'application/msword',
//     'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
//     'xls': 'application/vnd.ms-excel',
//     'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
//     'ppt': 'application/vnd.ms-powerpoint',
//     'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
//     'txt': 'text/plain',
//     'csv': 'text/csv',
    
//     // Images
//     'jpg': 'image/jpeg',
//     'JPG': 'image/JPEG',
//     'jpeg': 'image/jpeg',
//     'JPEG': 'image/JPEG',
//     'png': 'image/png',
//     'PNG': 'image/PNG',
//     'gif': 'image/gif',
//     'bmp': 'image/bmp',
//     'webp': 'image/webp',
//     'svg': 'image/svg+xml'
//   };
//   return mimeTypes[ext] || 'application/octet-stream';
// }

// const anonymize = (email) => {
//   if (!email || !email.includes('@')) return email;
//   const [user, domain] = email.split('@');
//   return `${user.slice(0, 4)}••••••••@${domain}`;
// };

// const anonymizeEmail = (str) => {
//   if (!str) return str;
//   // Format <email@domain.fr>
//   if (str.includes('<') && str.includes('>')) {
//     return str.replace(/<(.+)>/, (_, e) => `<${anonymize(e)}>`);
//   }
//   // Format nu email@domain.fr
//   return anonymize(str);
// };

// module.exports = { 
//   generateTokenTicketUtils, prepareAttachments, getContentType, anonymize, anonymizeEmail
// };