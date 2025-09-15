const nodemailer = require('nodemailer');

// Configuration du transporteur email
const transporter = nodemailer.createTransporter({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // true pour 465, false pour autres ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Vérifier la configuration email
transporter.verify((error, success) => {
  if (error) {
    console.log('❌ Erreur configuration email:', error);
  } else {
    console.log('✅ Serveur email prêt');
  }
});

// Envoyer email de vérification
const sendVerificationEmail = async (email, token) => {
  const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${token}`;
  
  const mailOptions = {
    from: `"E-commerce App" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Vérification de votre compte',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Bienvenue sur notre plateforme e-commerce !</h2>
        <p>Merci de vous être inscrit. Pour activer votre compte, veuillez cliquer sur le lien ci-dessous :</p>
        <a href="${verificationUrl}" style="display: inline-block; background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 20px 0;">
          Vérifier mon compte
        </a>
        <p>Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :</p>
        <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
        <p>Ce lien expire dans 24 heures.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px;">Si vous n'avez pas créé de compte, ignorez cet email.</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Email de vérification envoyé à:', email);
  } catch (error) {
    console.error('❌ Erreur envoi email de vérification:', error);
    throw error;
  }
};

// Envoyer email de réinitialisation de mot de passe
const sendPasswordResetEmail = async (email, token) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;
  
  const mailOptions = {
    from: `"E-commerce App" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Réinitialisation de votre mot de passe',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Réinitialisation de mot de passe</h2>
        <p>Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le lien ci-dessous pour créer un nouveau mot de passe :</p>
        <a href="${resetUrl}" style="display: inline-block; background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 20px 0;">
          Réinitialiser mon mot de passe
        </a>
        <p>Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :</p>
        <p style="word-break: break-all; color: #666;">${resetUrl}</p>
        <p>Ce lien expire dans 1 heure.</p>
        <p style="color: #dc3545;"><strong>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</strong></p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px;">Pour votre sécurité, ne partagez jamais ce lien.</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Email de réinitialisation envoyé à:', email);
  } catch (error) {
    console.error('❌ Erreur envoi email de réinitialisation:', error);
    throw error;
  }
};

// Envoyer email de facture
const sendInvoiceEmail = async (email, order) => {
  const mailOptions = {
    from: `"E-commerce App" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Facture - Commande ${order.orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Merci pour votre commande !</h2>
        <p>Votre commande <strong>${order.orderNumber}</strong> a été confirmée.</p>
        
        <h3>Détails de la commande :</h3>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr style="background-color: #f8f9fa;">
              <th style="border: 1px solid #dee2e6; padding: 12px; text-align: left;">Produit</th>
              <th style="border: 1px solid #dee2e6; padding: 12px; text-align: center;">Quantité</th>
              <th style="border: 1px solid #dee2e6; padding: 12px; text-align: right;">Prix</th>
            </tr>
          </thead>
          <tbody>
            ${order.items.map(item => `
              <tr>
                <td style="border: 1px solid #dee2e6; padding: 12px;">${item.product.name}</td>
                <td style="border: 1px solid #dee2e6; padding: 12px; text-align: center;">${item.quantity}</td>
                <td style="border: 1px solid #dee2e6; padding: 12px; text-align: right;">${item.price.toFixed(2)}€</td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot>
            <tr style="font-weight: bold;">
              <td colspan="2" style="border: 1px solid #dee2e6; padding: 12px; text-align: right;">Total :</td>
              <td style="border: 1px solid #dee2e6; padding: 12px; text-align: right;">${order.total.toFixed(2)}€</td>
            </tr>
          </tfoot>
        </table>
        
        <p>Nous traiterons votre commande dans les plus brefs délais.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px;">Merci de votre confiance !</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Email de facture envoyé à:', email);
  } catch (error) {
    console.error('❌ Erreur envoi email de facture:', error);
    throw error;
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendInvoiceEmail
};
