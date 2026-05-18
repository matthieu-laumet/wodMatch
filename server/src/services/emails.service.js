const { mailOptions, structureHTML } = require('../emails/emailConfig');
const reinitPwd = require('../emails/reinitPwd');
const pwdUpdated = require('../emails/pwdUpdated');
const inscription = require('../emails/inscription');
const newClubSuggere = require('../emails/newClubSuggere');
const newUser = require('../emails/newUser');
const confirmEmail = require('../emails/confirmEmail');
const userVolunteerEmail = require('../emails/userVolunteerEmail');
const adminVolunteerEmail = require('../emails/adminVolunteerEmail');
const adminEmail = require('../emails/adminEmail');
const adminDeletedEmail = require('../emails/adminDeletedEmail');
const deleteVolunteerEmail = require('../emails/deleteVolunteerEmail');
const contactEmail = require('../emails/contactEmail');
const newAthlete = require('../emails/newAthlete');
const removeAthlete = require('../emails/removeAthlete');
const refund = require('../emails/refund');
const insertQueueDivision = require('../emails/insertQueueDivision');
const openQueueTicket = require('../emails/openQueueTicket');
const updateQueueOrder = require('../emails/updateQueueOrder');
const declinedQueueRegistration = require('../emails/declinedQueueRegistration');
const cancelQueueRegistration = require('../emails/cancelQueueRegistration');
const registerSpectator = require('../emails/registerSpectator');
const registerFreeSpectator = require('../emails/registerFreeSpectator');
const { getOneOrderByPaymentID } = require('../models/orders.model');
const inscriptionFree = require('../emails/inscriptionFree');
const inscriptionFreeInFreeCompetition = require('../emails/inscriptionFreeInFreeCompetition');

const jwt = require('jsonwebtoken');
const { fr } = require('date-fns/locale');
const socketManager = require('../services/socketManager');
const { format, addHours, formatDistanceStrict } = require('date-fns');
const stripe = require('stripe')(process.env.STRIPE_PRIATE_KEY);
const DOMAIN = process.env.MAILGUN_DOMAIN;
const formData = require('form-data');
const Mailgun = require('mailgun.js');
const { getEmailByIdUser, getUserInfoForTokenByEmail, getUserInfoForTokenByIdUser, updateVerifyEmail, updateUserPwd } = require('../models/users.model');
const { generateTokenTicketUtils, prepareAttachments, anonymize, anonymizeEmail } = require('../utils/emails.utils');
const { getAthletesSharedEmail } = require('../models/participants.model');
const bcrypt = require('bcryptjs'); 
const { getOrgaEmail } = require('../models/organisateurs.model');
const mailgun = new Mailgun(formData);
const mg = mailgun.client({
  username: 'api', key: process.env.MAILGUN_API_KEY, url: "https://api.eu.mailgun.net"
});



async function sendEmailService(emailData, cookieConfirmEmail = null) {
  const { 
    email, inputUpdated, competition, division, object, club_name, id, first_name, competName, isAdminMove,
    isNewBox, role, last_name, message, contactObject, team, id_user, gender, 
    division_name, refundedAmount, confirmeAnnulation, positionQueue, pdfBase64, 
    paymentMethodId, paymentIntentId, spectatorData, displayDiscountRemise,
    fileName, clientIP, location, deviceInfo, // Ajoutez ces paramètres
    athlete_goodies, competInfos, paymentIntentFromStripe = null, paymentMethod = null, order = null,
    competitionId, target
  } = emailData;

  const countDown = competInfos && formatDistanceStrict(new Date(competInfos.begin), new Date(), { unit: 'day', locale: fr });
  let lowerEmail = email?.toLowerCase();
  
  if (id_user && id_user !== 'guest') {
    const userEmailRequest = await getEmailByIdUser({ id: id_user });
    lowerEmail = userEmailRequest.email;
  }

  let data, link;
  
  if (object === "new_club_admin") {
    data = mailOptions('laumetmatthieu@hotmail.fr', `Nouveau club suggéré !`, await newClubSuggere(club_name, id));
  } else if (object === "email-contact") {
    const orgaEmail = target === 'organizer' ? await getOrgaEmail({ id_competition: competitionId }) : null;
    let targetName = target === 'organizer' ? `Organisateur - ${competitionId}` : target === 'platform' ? 'Wodzone' : 'Autre';
    const bcc = ['laumetmatthieu@hotmail.fr', orgaEmail].filter(Boolean);
    data = mailOptions(
      '<contact@wodzone.fr>', `Prise de contact`, 
      await contactEmail(first_name, last_name, lowerEmail, contactObject, message, targetName), bcc
    );
  } else if (object === "register_compet") {
    const paymentMethod = paymentMethodId && await stripe.paymentMethods.retrieve(paymentMethodId);
    const paymentIntentFromStripe = paymentIntentId && await stripe.paymentIntents.retrieve(paymentIntentId);
    const attachment = pdfBase64 ? { pdfBase64, fileName: fileName || 'ticket.pdf' } : null;
    const order = paymentIntentId ? await getOneOrderByPaymentID({ sub_id: paymentIntentId }) : null;

    const html = paymentMethodId
      ? await inscription({
          paymentMethod, paymentIntent: paymentIntentFromStripe, spectatorData, order, athlete_goodies,
          competInfos, link: `${process.env.FRONTEND_LINK}/account-settings/compte/payments?action=show-order`, countDown
        })
      : order ?
        await inscriptionFree({
          spectatorData, order, athlete_goodies, paymentIntent: paymentIntentFromStripe,
          competInfos, link: `${process.env.FRONTEND_LINK}/account-settings/compte/payments?action=show-order`, countDown
        })
        : await inscriptionFreeInFreeCompetition({
            competInfos, link: `${process.env.FRONTEND_LINK}/account-settings/compte/payments?action=show-order`, countDown
          })

      data = mailOptions(
        lowerEmail, `Inscrition validée : ${competInfos?.compet_name}`, html, false, attachment
      );
  } else if (object === "register_compet_spectator") {
    const attachment = pdfBase64 ? { pdfBase64, fileName: fileName || 'ticket.pdf' } : null;
    const html = paymentMethodId 
      ? await registerSpectator(paymentMethod, paymentIntentFromStripe, spectatorData, order, displayDiscountRemise, competInfos)
      : await registerFreeSpectator(spectatorData, order, displayDiscountRemise);
    data = mailOptions(
      lowerEmail, `Inscrition validée : ${competInfos?.compet_name}`, html, false, attachment
    );
  } else if (object === "updated_info") {
    data = mailOptions(
      lowerEmail, `Activité du compte : modification du ${inputUpdated}`, 
      await pwdUpdated(inputUpdated, process.env.FRONTEND_LINK, new Date(), location, deviceInfo)
    );
  } else if (object === "update_volunteer_dispo" || object === "insert_volunteer_dispo") {
    const statut = object === "update_volunteer_dispo" ? 'update' : 'insert';
    const objectText = object === "insert_volunteer_dispo"  
      ? `Inscrition au Staff validée : ${competName}` 
      : `Modification des disponibilités : ${competName}`;
    data = mailOptions(
      lowerEmail, objectText, 
      competition.body_email ?? await userVolunteerEmail(statut, competName)
    );
  } else if (object === "new_admin_accepted" || object === "new_admin_rejected") {
    const statut = object === "new_admin_accepted" ? 'accepted' : 'rejected';
    const objectText = object === "new_admin_accepted"  
      ? `Accès administrateur autorisé : ${competName}` 
      : `Accès administrateur refusé : ${competName}`;
    data = mailOptions(
      lowerEmail, objectText, 
      await adminVolunteerEmail(statut, competName, process.env.FRONTEND_LINK)
    );
  } else if (object === "update_admin" || object === "insert_admin") {
    const statut = object === "insert_admin" ? 'insert' : 'update';
    const objectText = object === "insert_admin"  
      ? `Nouvel Accès administrateur : ${competName}` 
      : `Mis à jour de vos accès administrateur : ${competName}`;
    data = mailOptions(
      lowerEmail, objectText, 
      await adminEmail(statut, competName, role, process.env.FRONTEND_LINK)
    );
  } else if (object === "remove_admin") {
    data = mailOptions(
      lowerEmail, 'Accès administrateur supprimé', 
      await adminDeletedEmail(competName, role, process.env.FRONTEND_LINK)
    );
  } else if (object === "delete_volunteer") {
    data = mailOptions(
      lowerEmail, 'Accès au staff refusé', 
      await deleteVolunteerEmail(competName, process.env.FRONTEND_LINK)
    );
  } else if (object === "new_user") {
    link = await generateTokenConfirmEmail(lowerEmail);
    data = mailOptions(
      lowerEmail, `Confirmation de votre email 💌`, 
      await newUser(first_name, link, isNewBox)
    );
  } else if (object === "confirm_email") {
    link = cookieConfirmEmail ?? await generateTokenConfirmEmail(lowerEmail);
    data = mailOptions(
      lowerEmail, `Veuillez confirmer votre adresse e-mail`, 
      await confirmEmail(first_name, link)
    );
  } else if (object === "new_athlete") {
    data = mailOptions(
      lowerEmail, `Prêt${gender === 'F' ? 'e' : ''} à rentrer sur le flooooor ? 🏆`, 
      await newAthlete(team, division_name, competName, isAdminMove)
    );
  } else if (object === "remove_athlete") {
    data = mailOptions(
      lowerEmail, `Le conseil a voté… leur sentence est irrévocable !`, 
      await removeAthlete(team, division_name, competName, isAdminMove)
    );
  } else if (object === "refund") {
    data = mailOptions(
      lowerEmail, `Un remboursement est en cours`, 
      await refund(refundedAmount, confirmeAnnulation)
    );
  } else if (object === "insertionQueue") {
    data = mailOptions(
      lowerEmail, `Inscription liste d'attente – Catégorie ${division_name}`, 
      await insertQueueDivision(division_name, positionQueue)
    );
  } else if (object === "update-queue-order") {
    data = mailOptions(
      lowerEmail, `Mise à jour position dans la liste d'attente`, 
      await updateQueueOrder(first_name, positionQueue)
    );
  } else if (object === "declined-queue-registration") {
    data = mailOptions(
      lowerEmail, `Mise à jour position dans la liste d'attente`, 
      await declinedQueueRegistration(first_name)
    );
  } else if (object === "cancelled-queue-registration") {
    data = mailOptions(
      lowerEmail, `Annulation inscription file d'attente`, 
      await cancelQueueRegistration(first_name)
    );
  }
  
  try {
    const response = await mg.messages.create(DOMAIN, data);
    const toLog = anonymizeEmail(data.to);
    const bccLog = data.bcc ? ` | bcc : ${data.bcc}` : '';
    // const bccLog = data.bcc ? ` | bcc : ${data.bcc.split(', ').map(anonymize).join(', ')}` : '';
    console.log(`[${object}] ${toLog}${bccLog}`);
    return {
      success: true, response,
      cookieData: (object === "new_user" || (object === "confirm_email" && !cookieConfirmEmail)) 
        ? { link, shouldSetCookie: true } 
        : null
    };
  } catch (err) {
    console.error(err);
    throw new Error('Erreur lors de l\'envoi de l\'email');
  }
}


const generateTokenConfirmEmail = async (email) => {
  const foundUser = await getUserInfoForTokenByEmail({ email });
  if (foundUser?.id) {
    const secret = process.env.JWT_SECRET + foundUser.password + foundUser.email;
    const token = jwt.sign({ email: foundUser.email, id: foundUser.id }, secret, {
      expiresIn: "1d",
    });
    const link = `${process.env.FRONTEND_LINK}/confirm-email/${foundUser.id}/${token}/email`;
    return link
  }
}

async function sendMailForgotPwdService ({ email }) {
  const foundUser = await getUserInfoForTokenByEmail({ email });
  if (foundUser?.id) {
    const secret = process.env.JWT_SECRET + foundUser.password + foundUser.email;
    const token = jwt.sign({ email: foundUser.password, id: foundUser.id }, secret, {
      expiresIn: "30m",
    });
    const link = `${process.env.FRONTEND_LINK}/reset-password/${foundUser.id}/${token}`;
    mg.messages.create(DOMAIN, mailOptions(
      email, 'Réinitialiser votre mot de passe', reinitPwd(foundUser.first_name, link)
    ))
    .then((res) => {
      console.log('send-forgot-pwd' + ' / ' + email);
    })
    .catch((err) => {
      console.error(err);
    });
    return { isUser: true, link }
  } else {
    return { isUser: false }
  }
}

async function verifyTokenResetPwdService ({ id, token }) {
  const foundUser = await getUserInfoForTokenByIdUser({ id_user: id });
  if (foundUser?.id) {
    const secret = process.env.JWT_SECRET + foundUser.password + foundUser.email;
    const verify = jwt.verify(token, secret);
    return { email: verify.email, status: "Verified" };
  } else {
    return { status: "User Not Exists!!" };
  }
}

async function verifyTokenVerifyEmailService ({ id, token }) {
  const foundUser = await getUserInfoForTokenByIdUser({ id_user: id });
  if (foundUser?.id) {
    const secret = process.env.JWT_SECRET + foundUser.password + foundUser.email;
    const verify = jwt.verify(token, secret);
    await updateVerifyEmail({ is_email_verifyed: true, id_user: id });
    return { email: verify.email, status: "Verified" };
  } else {
    return { status: "User Not Exists!!" };
  }
}

async function updatePwdForgotService ({ pwd, pwd_confirm, id, token }) {
  const foundUser = await getUserInfoForTokenByIdUser({ id_user: id });
  if (foundUser?.id) {
    const secret = process.env.JWT_SECRET + foundUser.password + foundUser.email;
    jwt.verify(token, secret);
    if (pwd !== pwd_confirm) return {'message': 'Les mots de passe sont différents.', status: 400 }; 
    const hashedPwd = await bcrypt.hash(pwd, 10);
    await updateUserPwd({ password: hashedPwd, id });
    return { email: foundUser.email, message: "Mot de passe updated", status: "Verified" };
  } else {
    return { message: "User Not Exists!!", status: 400  };
  }
}


async function sendMailOpenQueueTicketLogic({ email, id_user, id_division, first_name, id_competition }) {
  const link = await generateTokenTicketUtils(id_user, id_division, id_competition);
  let expirationDate = addHours(new Date(), 24);  
  const formattedExpiration = format(expirationDate, "eeee d MMMM yyyy 'à' HH:mm", { locale: fr });
  await mg.messages.create(DOMAIN, mailOptions(
    email, 'Ouverture inscription compétition', await openQueueTicket(first_name, link, formattedExpiration)
  ));
  console.log('open-queue-ticket-registration' + ' / ' + email);
  return { isUser: true, link };
}



async function sendGroupMailService ({ 
  from, emails, idsList, key, subject, content, competImag, signatureName, attachments, socketId 
}) {
  const io = socketManager.getIO();
  let emailsList;
  if (key === 'athletes') {
    const emailsBDD = await getAthletesSharedEmail({ idsList });
    emailsList = emailsBDD.map(item => item.email);
  } else {
    emailsList = emails;
  }
  emailsList.push('contact@wodzone.fr');
  emailsList.push(from);
  // emailsList = Array.from({ length: 1000 }, (_, i) => `test${i + 1}@wodzone-test.fr`);
  if (!emailsList || emailsList.length === 0) {
    throw Object.assign(new Error('Aucun destinataire trouvé'), { status: 400 });
  }
  io.to(socketId).emit('email_progress', { type: 'start', total: emailsList.length });
  const htmlContent = await structureHTML(content, competImag, signatureName, true, from);
  let preparedAttachments = [];
  if (attachments && attachments.length > 0) {
    preparedAttachments = await prepareAttachments(attachments);
  }

  const results = [];
  const failedEmails = [];
  for (let i = 0; i < emailsList.length; i++) {
    try {
      const messageData = {
        from: 'contact@wodzone.fr', to: emailsList[i], // ✅ Un seul destinataire à la fois
        subject, html: htmlContent, 'o:tracking-clicks': 'no',
      };
      if (preparedAttachments.length > 0) {
        messageData.attachment = preparedAttachments;
      }
      const result = await mg.messages.create(DOMAIN, messageData);
      results.push(result);

      // // 🧪 Simuler l'envoi avec un délai aléatoire
      // await new Promise(resolve => setTimeout(resolve, Math.random() * 50 + 10)); // 10-60ms
      // // 🧪 Simuler des échecs aléatoires (5% d'échec)
      // if (Math.random() < 0.05) {
      //   throw new Error('Erreur simulée');
      // }
      // results.push({ id: `simulated-${i}`, message: 'Queued' }); // 🧪 Résultat simulé
      
      if ((i + 1) % 10 === 0 || i === emailsList.length - 1) {
        io.to(socketId).emit('email_progress', {
          type: 'progress', sent: i + 1, total: emailsList.length, 
          percentage: Math.round(((i + 1) / emailsList.length) * 100), failed: failedEmails.length
        });
      }
      if ((i + 1) % 100 === 0 && i < emailsList.length - 1) {
        console.log(`✅ ${i + 1}/${emailsList.length} emails envoyés`);
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    } catch (error) {
      // Continue malgré l'erreur pour envoyer aux autres
      console.error(`❌ Erreur pour ${emailsList[i]}:`, error.message);
      failedEmails.push(emailsList[i]);
    }
  }
  console.log(`🎉 ${results.length}/${emailsList.length} emails envoyés avec succès`);
  io.to(socketId).emit('email_progress', {
    type: 'complete', success: true, emailsSent: results.length, emailsFailed: failedEmails.length, failedList: failedEmails
  });
  if (failedEmails.length > 0) {
    return { success: true, partial: true, message: 'Envoi terminé avec quelques erreurs', emailsSent: results.length, 
      emailsFailed: failedEmails.length, failedList: failedEmails
    };
  }
  return { success: true, message: 'Tous les emails ont été envoyés avec succès', emailsSent: results.length };
}




module.exports = { 
  sendEmailService, generateTokenConfirmEmail, sendMailForgotPwdService, sendMailOpenQueueTicketLogic,
  sendGroupMailService, verifyTokenResetPwdService, verifyTokenVerifyEmailService, updatePwdForgotService
};