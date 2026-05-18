const { getImageAsBase64 } = require('../services/leevia.service');


require('dotenv').config();

const mailOptions = (to, subject, html, bcc, attachment = null) => {
  const options = { 
    from: 'Wodzone <contact@wodzone.fr>', 
    to, 
    subject,
    html,
    'o:tracking-clicks': 'no',
  };
  
  if (bcc) {
    options.bcc = Array.isArray(bcc) ? bcc.join(', ') : bcc;
  }

  if (attachment && attachment.pdfBase64) {
    const clean = attachment.pdfBase64.replace(/^data:[^;]+;base64,/, ''); // ← ajouter ça
    const pdfBuffer = Buffer.from(clean, 'base64');

    options.attachment = {
      data: pdfBuffer,
      filename: attachment.fileName || 'ticket.pdf',
      contentType: 'application/pdf'
    };
  }

  return options;
};

const structureHTML = async (body, img, signatureName, footer, from) => {
  const defaultImage = 'https://res.cloudinary.com/dkz9knsgj/image/upload/v1708697111/wq1sx6mw5awrzzsb3nhr.png';
  let imageUrl = defaultImage; // Par défaut, on utilise le logo WodZone
    
  if (img) {
    if (img.startsWith('http')) {
      // Image publique, on l'utilise directement
      imageUrl = img;
    } else {
      // Image privée, on tente de la récupérer en base64
      const base64Image = await getImageAsBase64(img);
      // Si la récupération a réussi, on l'utilise, sinon on garde le logo par défaut
      if (base64Image) {
        imageUrl = base64Image;
      } else {
        console.warn(`⚠️ Impossible de charger l'image ${img}, utilisation du logo par défaut`);
      }
    }
  }

  return (
    `<!DOCTYPE html>
        <html lang="fr">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>@import url(https://fonts.googleapis.com/css2?family=Montserrat:wght@200;300;400;500;600;700;800;900&family=Permanent+Marker&display=swap);</style>
            <style>
              body {
                font-family: Arial, sans-serif;
                font-size: 16px;
              }
              .container {
                border-radius: 10px;
                width: 70% !important;
                margin: 0 auto;
                padding: 50px;
                border: 1px solid #A9A9A9;
              }
              .container-paiement {
                border-radius: 10px;
                width: 50%;
                margin: 0 auto;
                padding: 50px;
                border: 1px solid #A9A9A9;
              }
              .rounded-border {
                border-radius: 8px;
                border: 1px solid #808080;
                overflow: hidden;
              }
              .btn {
                display: inline-block;
                padding: 16px 28px;
                margin: 20px 0;
                text-decoration: none;
                background-color: #df0000;
                color: white;
                border-radius: 5px;
              }
              .mt-4 {margin-top: 4px;}
              .mt-8 {margin-top: 8px;}
              .mt-16 {margin-top: 16px;}
              .mt-24 {margin-top: 24px;}
              .mb-8 {margin-bottom: 8px;}
              .section {
                display: inline-block;
                padding-top: 20px;
                width: 100%;
                padding-bottom: 20px;
                border-top: 1px solid #A9A9A9;
              }
              p, h1, h3, h4 {
                font-family: "Montserrat", sans-serif;
                margin: 0;
              }
              h1 {
                font-size: 24px;
                font-weight: 600;
                margin-top: 20px;
                margin-bottom: 12px;
              }
              h3 {
                margin: 0;
                margin-bottom: 16px;
                font-weight: 600;
                margin-top: 40px;
              }
              h4 {
                margin: 0;
                margin-bottom: 4px;
              }
              p {
                font-size: 16px;
                font-weight: 500;
                line-height: 25px;
                margin-top: 0 !important;
                margin-bottom: 0 !important;
              }
              .bold {
                font-weight: 700;
              }
              .sql {
                font-size: 14px;
                font-weight: 300;
                font-style: italic;
                opacity: 0.7;
                line-height: 25px;
              }
              .border-top {
                margin-top: 16px;
                padding-top: 28px;
                border-top: 1px solid #b6b6b6ff;
              }
              .card {
                  background-color: white;
                  margin-bottom: 24px;
                  border-bottom: 1px solid #b6b6b6ff;
              }

              .receipt-header {
                  display: flex;
                  justify-content: space-between;
                  align-items: flex-start;
                  margin-bottom: 16px;
                  padding-bottom: 28px;
                  border-bottom: 1px solid #b6b6b6ff;
              }

              .receipt-title {
                  font-size: 14px;
                  color: #666;
                  font-weight: 400;
                  margin-bottom: 6px;
              }

              .amount {
                  font-size: 28px;
                  font-weight: 600;
                  color: #000;
                  line-height: 1;
                  margin-bottom: 12px;
              }

              .date {
                  font-size: 14px;
                  color: #666;
                  font-weight: 400;
              }

              .receipt-icon {
                  width: 48px;
                  height: 48px;
                  background-color: #f5f5f5;
                  border-radius: 8px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
              }

              .receipt-icon-lines {
                  display: flex;
                  flex-direction: column;
                  gap: 4px;
              }

              .receipt-icon-line {
                  width: 20px;
                  height: 3px;
                  background-color: #ccc;
                  border-radius: 2px;
              }

              .receipt-icon-line.short {
                  width: 14px;
              }

              .downloads {
                  display: flex;
                  gap: 24px;
                  margin-bottom: 32px;
                  padding-bottom: 32px;
                  border-bottom: 1px solid #e5e5e5;
              }

              .download-link {
                  display: flex;
                  align-items: center;
                  gap: 8px;
                  color: #666;
                  text-decoration: none;
                  font-size: 15px;
                  font-weight: 400;
              }

              .download-link svg {
                  width: 16px;
                  height: 16px;
                  fill: #666;
              }

              .info-row {
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  margin-bottom: 16px;
              }

              .info-label {
                  font-size: 13px;
                  color: #666;
                  font-weight: 400;
              }

              .info-value {
                  font-size: 13px;
                  color: #000;
                  font-weight: 500;
              }

              .payment-method {
                  display: flex;
                  align-items: center;
                  gap: 8px;
              }

              .card-icon {
                  width: 24px;
                  height: 24px;
                  background: linear-gradient(135deg, #333 50%, #999 50%);
                  border-radius: 4px;
              }

              .receipt-details {
                  padding-top: 8px;
              }

              .receipt-number {
                  font-size: 15px;
                  font-weight: 600;
                  color: #000;
                  margin-bottom: 32px;
              }

              .line-item {
                  margin-bottom: 16px;
              }

              .line-item-header {
                  display: flex;
                  justify-content: space-between;
                  align-items: flex-start;
                  margin-bottom: 4px;
              }

              .line-item-name {
                  font-size: 13px;
                  color: #000;
                  font-weight: 400;
                  flex: 1;
              }

              .line-item-price {
                  font-size: 13px;
                  color: #000;
                  font-weight: 400;
                  margin-left: 20px;
              }

              .line-item-qty {
                  font-size: 12px;
                  color: #999;
                  font-weight: 400;
              }

              .divider {
                  height: 1px;
                  background-color: #e5e5e5;
                  margin: 32px 0;
              }

              .total-row {
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
              }

              .total-label {
                  font-size: 15px;
                  color: #000;
                  font-weight: 600;
                  margin-bottom: 4px;
              }

              .total-value {
                  font-size: 16px;
                  color: #000;
                  font-weight: 600;
              }

              .footer {
                  font-size: 14px;
                  color: #999;
                  margin-top: 40px;
                  margin-bottom: 32px;
              }

              .footer a {
                  color: #c20505;
                  text-decoration: none;
              }

              .footer a:hover {
                  text-decoration: underline;
              }
              @media only screen and (max-width: 600px) {
                .container {
                  padding: 24px;
                  width: 90% !important;
                }
              }
            </style>
          </head>
          <body>
            <div class="container" style="max-width:750px;">
              <img 
                src="${imageUrl}" 
                alt="Image" 
                class="${imageUrl && !imageUrl?.includes('cloudinary') ? 'rounded-border' : ''}"
                style="width:100%; max-width:130px; height:auto;"
              />
              <br/><br/>
              ${body}
              <br/><br/>
              ${!signatureName ? '<p>L\'équipe WodZone</p>' : ''}
              ${footer 
                ? `<div style="background-color:#f8f8f8;padding:20px 30px;text-align:center;border-top:1px solid #eee;">
                      <p style="margin:15px 0 0;font-size:10px;font-weight:700;">
                        <a href="https://www.wodzone.fr" target="_blank" style="color:#ff3d3d;text-decoration:none;">Propulsé par WodZone</a>
                      </p>
                      ${from 
                        ? `
                            <p style="margin:15px 0 0;font-size:10px;font-weight:700;">
                              <a href="https://www.wodzone.fr" target="_blank" style="color:#1466b8;text-decoration:none;">Envoyé par : ${from}</a>
                            </p>
                          `
                        : ''
                      }
                      
                  </div>` 
                : ''}
            </div>
          </body>
      </html>
    `
  )
}

module.exports = { mailOptions, structureHTML };