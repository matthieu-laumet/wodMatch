// require('dotenv').config();
// const { 
//   sendEmailService, sendMailForgotPwdService, sendGroupMailService, verifyTokenResetPwdService, 
//   verifyTokenVerifyEmailService, updatePwdForgotService 
// } = require('../services/emails.service');
// const socketManager = require('../services/socketManager');
// const { getLocationFromIP, getDeviceInfo, getClientIP } = require('../utils/users.utils');
// const { generateTokenTicketUtils } = require('../utils/emails.utils');
// const { isQueueValidData } = require('../models/queues.models')


// async function sendMailForgotPwd (req, res) {
//   try {
//     const { email } = req.body;
//     const response = await sendMailForgotPwdService({ email });
//     return res.status(200).json(response);
//   } catch (error) {
//     console.error('[sendMailForgotPwd]', error);
//     res.status(500).json({ error: 'erreur server' });
//   }
// }

// async function generateTokenTicket (req, res) {
//   try {
//     const { id_user, id_division, id_competition } = req.body;
//     const link = await generateTokenTicketUtils(id_user, id_division, id_competition);
//     res.status(200).send({ link });
//   } catch (error) {
//     console.error('[generateTokenTicket]', error);
//     res.status(500).json({ error: 'erreur server' });
//   }
// }

// async function sendMail(req, res) {
//   try {
//     const emailData = {
//       ...req.body,
//       clientIP: req.body.object === "updated_info" ? getClientIP(req) : undefined,
//       location: req.body.object === "updated_info" ? await getLocationFromIP(getClientIP(req)) : undefined,
//       deviceInfo: req.body.object === "updated_info" ? getDeviceInfo(req) : undefined
//     };
//     const result = await sendEmailService(emailData, req.cookies?.email_confirm);
//     if (result.cookieData?.shouldSetCookie) {
//       res.cookie('email_confirm', result.cookieData.link, {
//         ...(process.env.NODE_ENV === 'production' && { domain: '.wodzone.fr' }),
//         secure: process.env.NODE_ENV === 'production',
//         httpOnly: true,
//         sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
//         maxAge: 24 * 60 * 60 * 1000
//       });
//     }
//     res.status(200).send('Email sent');
//   } catch (err) {
//     console.error(err);
//     res.status(500).send('Erreur serveur');
//   }
// }

// async function sendGroupMails(req, res) {
//   try {
//     const { from, emails, idsList, key, subject, content, competImag, signatureName, attachments, socketId } = req.body;
//     const response = await sendGroupMailService({ 
//       from, emails, idsList, key, subject, content, competImag, signatureName, attachments, socketId
//     });
//     return res.status(200).json(response);
//   } catch (error) {
//     console.error('❌ Erreur envoi emails:', error);
//     if (req.body.socketId) {  // Envoi de l'erreur via socket
//       const io = socketManager.getIO();
//       io.to(req.body.socketId).emit('email_progress', { type: 'error', message: 'Erreur serveur' });
//     }
//     const status = error.status || 500;
//     const message = error.status ? error.message : 'erreur server';
//     return res.status(status).json({ message, success: false, error: 'Erreur serveur'  });
//   }
// }

// async function verifyTokenResetPwd (req, res) {
//   try {
//     const { id, token } = req.params; 
//     const response = await verifyTokenResetPwdService({ id, token });
//     return res.status(200).json(response);
//   } catch (error) {
//     if (error.message === 'invalid signature') {
//       console.log(`verify pwd: JWT invalid signature`);
//     } else {
//       console.log(error);
//     }
//     res.status(500).json({ status: 'expired' });
//   }
// }

// async function verifyTokenOpenQueueTicket (req, res) {
//   try {
//     const { id_division } = req.params; 
//     const id_user = req.id_user; 
//     // Permet de savoir si le token est encore valide. S'il ne l'est pas, son status n'est pas pending mais declined ou done
//     const isValid = await isQueueValidData({ status: 'pending', id_division, id_user });
//     if (isValid.length > 0) {
//       res.json({ id_user, id_division, status: "Verified" });
//     } else {
//       res.json({ status: 'expired' });
//     }
//   } catch (error) {
//     console.log(error.message);
//     res.status(500).json({ status: 'expired' });
//   }
// }

// async function verifyTokenVerifyEmail (req, res) {
//   try {
//     const { id, token } = req.params; 
//     const response = await verifyTokenVerifyEmailService({ id, token });
//     res.clearCookie('email_confirm', {
//       ...(process.env.NODE_ENV === 'production' && { domain: '.wodzone.fr' }),
//       secure: process.env.NODE_ENV === 'production',
//       httpOnly: true,
//       sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
//     });
//     return res.status(200).json(response);
//   } catch (error) {
//     // Vérifier si c'est spécifiquement une erreur de token expiré
//     if (error.name === 'TokenExpiredError') {
//       console.log(`Token expiré pour l'email: `);
//     } else {
//       // Pour les autres erreurs JWT, on peut aussi logger de manière allégée
//       console.log(`Erreur JWT pour l'email : ${error.message}`);
//     }
//     res.status(500).json({ status: 'expired' });
//   }
// }

// async function updatePwdForgot (req, res) {
//   try {
//     const { pwd, pwd_confirm, id, token } = req.body; 
//     const response = await updatePwdForgotService({ pwd, pwd_confirm, id, token });
//     return res.status(200).json(response);
//   } catch (error) {
//     if (error.message === 'invalid signature') {
//       console.log(`verify pwd: JWT invalid signature`);
//     } else {
//       console.log(error);
//     }
//     res.status(500).json({ status: 'expired' });
//   }
// }


// module.exports = {
//   sendMailForgotPwd, verifyTokenResetPwd, updatePwdForgot, sendMail, verifyTokenVerifyEmail, sendGroupMails,
//   verifyTokenOpenQueueTicket, generateTokenTicket,
// }