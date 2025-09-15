/**
 * Service d'envoi d'emails pour SPARK
 * Gestion des emails transactionnels et marketing avec conformité RGPD
 */

const nodemailer = require('nodemailer')

class EmailService {
  constructor() {
    this.transporter = null
    this.initialize()
  }
  
  async initialize() {
    try {
      // Vérifier si les variables d'environnement email sont configurées
      if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log('⚠️  Service email désactivé - Variables d\'environnement manquantes')
        this.transporter = null
        return
      }

      this.transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: process.env.EMAIL_PORT == 465, // true pour 465, false pour autres ports
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        },
        tls: {
          rejectUnauthorized: false
        }
      })
      
      // Vérifier la connexion
      await this.transporter.verify()
      console.log('✅ Service email configuré avec succès')
      
    } catch (error) {
      console.error('❌ Erreur de configuration du service email:', error)
      // Ne pas faire échouer l'application si l'email n'est pas configuré
    }
  }
  
  /**
   * Envoyer un email de vérification d'adresse
   */
  async sendEmailVerification(user, token) {
    const verificationUrl = `${process.env.CORS_ORIGIN}/verify-email?token=${token}`
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'SPARK <noreply@spark.com>',
      to: user.email,
      subject: 'Vérifiez votre adresse email - SPARK',
      html: this.getEmailVerificationTemplate(user, verificationUrl),
      text: this.getEmailVerificationText(user, verificationUrl)
    }
    
    return this.sendEmail(mailOptions)
  }
  
  /**
   * Envoyer un email de réinitialisation de mot de passe
   */
  async sendPasswordReset(user, token) {
    const resetUrl = `${process.env.CORS_ORIGIN}/reset-password?token=${token}`
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'SPARK <noreply@spark.com>',
      to: user.email,
      subject: 'Réinitialisation de votre mot de passe - SPARK',
      html: this.getPasswordResetTemplate(user, resetUrl),
      text: this.getPasswordResetText(user, resetUrl)
    }
    
    return this.sendEmail(mailOptions)
  }
  
  /**
   * Envoyer un email de confirmation de commande
   */
  async sendOrderConfirmation(order) {
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'SPARK <noreply@spark.com>',
      to: order.user.email,
      subject: `Confirmation de commande ${order.orderNumber} - SPARK`,
      html: this.getOrderConfirmationTemplate(order),
      text: this.getOrderConfirmationText(order)
    }
    
    return this.sendEmail(mailOptions)
  }
  
  /**
   * Envoyer un email de mise à jour de statut de commande
   */
  async sendOrderStatusUpdate(order, newStatus) {
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'SPARK <noreply@spark.com>',
      to: order.user.email,
      subject: `Mise à jour de votre commande ${order.orderNumber} - SPARK`,
      html: this.getOrderStatusUpdateTemplate(order, newStatus),
      text: this.getOrderStatusUpdateText(order, newStatus)
    }
    
    return this.sendEmail(mailOptions)
  }
  
  /**
   * Envoyer un email de facture
   */
  async sendInvoice(order) {
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'SPARK <noreply@spark.com>',
      to: order.user.email,
      subject: `Facture ${order.orderNumber} - SPARK`,
      html: this.getInvoiceTemplate(order),
      text: this.getInvoiceText(order),
      attachments: [
        {
          filename: `facture-${order.orderNumber}.pdf`,
          content: 'PDF content here', // À implémenter avec une librairie PDF
          contentType: 'application/pdf'
        }
      ]
    }
    
    return this.sendEmail(mailOptions)
  }
  
  /**
   * Envoyer un email de bienvenue
   */
  async sendWelcomeEmail(user) {
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'SPARK <noreply@spark.com>',
      to: user.email,
      subject: 'Bienvenue chez SPARK !',
      html: this.getWelcomeTemplate(user),
      text: this.getWelcomeText(user)
    }
    
    return this.sendEmail(mailOptions)
  }
  
  /**
   * Envoyer un email de notification admin
   */
  async sendAdminNotification(subject, message, data = {}) {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@spark.com'
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'SPARK <noreply@spark.com>',
      to: adminEmail,
      subject: `[SPARK Admin] ${subject}`,
      html: this.getAdminNotificationTemplate(subject, message, data),
      text: this.getAdminNotificationText(subject, message, data)
    }
    
    return this.sendEmail(mailOptions)
  }
  
  /**
   * Méthode générique d'envoi d'email
   */
  async sendEmail(mailOptions) {
    if (!this.transporter) {
      console.warn('⚠️ Service email non configuré, email non envoyé:', mailOptions.subject)
      return { success: false, error: 'Service email non configuré' }
    }
    
    try {
      const result = await this.transporter.sendMail(mailOptions)
      console.log('✅ Email envoyé:', mailOptions.subject, '→', mailOptions.to)
      return { success: true, messageId: result.messageId }
    } catch (error) {
      console.error('❌ Erreur d\'envoi d\'email:', error)
      return { success: false, error: error.message }
    }
  }
  
  /**
   * Template HTML pour vérification d'email
   */
  getEmailVerificationTemplate(user, verificationUrl) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Vérification d'email - SPARK</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #3b82f6; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚡ SPARK</h1>
            <p>Vérifiez votre adresse email</p>
          </div>
          <div class="content">
            <h2>Bonjour ${user.firstName} !</h2>
            <p>Merci de vous être inscrit sur SPARK. Pour activer votre compte, veuillez cliquer sur le bouton ci-dessous :</p>
            <a href="${verificationUrl}" class="button">Vérifier mon email</a>
            <p>Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :</p>
            <p><a href="${verificationUrl}">${verificationUrl}</a></p>
            <p>Ce lien expire dans 24 heures.</p>
          </div>
          <div class="footer">
            <p>© 2024 SPARK - Accessoires téléphoniques</p>
            <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }
  
  /**
   * Template texte pour vérification d'email
   */
  getEmailVerificationText(user, verificationUrl) {
    return `
      Bonjour ${user.firstName} !
      
      Merci de vous être inscrit sur SPARK. Pour activer votre compte, veuillez cliquer sur le lien ci-dessous :
      
      ${verificationUrl}
      
      Ce lien expire dans 24 heures.
      
      Cordialement,
      L'équipe SPARK
    `
  }
  
  /**
   * Template HTML pour réinitialisation de mot de passe
   */
  getPasswordResetTemplate(user, resetUrl) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Réinitialisation de mot de passe - SPARK</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #ef4444; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .button { display: inline-block; background: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚡ SPARK</h1>
            <p>Réinitialisation de mot de passe</p>
          </div>
          <div class="content">
            <h2>Bonjour ${user.firstName} !</h2>
            <p>Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :</p>
            <a href="${resetUrl}" class="button">Réinitialiser mon mot de passe</a>
            <p>Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :</p>
            <p><a href="${resetUrl}">${resetUrl}</a></p>
            <p>Ce lien expire dans 1 heure.</p>
            <p><strong>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</strong></p>
          </div>
          <div class="footer">
            <p>© 2024 SPARK - Accessoires téléphoniques</p>
            <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }
  
  /**
   * Template texte pour réinitialisation de mot de passe
   */
  getPasswordResetText(user, resetUrl) {
    return `
      Bonjour ${user.firstName} !
      
      Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le lien ci-dessous pour créer un nouveau mot de passe :
      
      ${resetUrl}
      
      Ce lien expire dans 1 heure.
      
      Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
      
      Cordialement,
      L'équipe SPARK
    `
  }
  
  /**
   * Template HTML pour confirmation de commande
   */
  getOrderConfirmationTemplate(order) {
    const itemsHtml = order.items.map(item => `
      <tr>
        <td>${item.name} - ${item.brand}</td>
        <td>${item.quantity}</td>
        <td>${item.price.toFixed(2)}€</td>
        <td>${(item.price * item.quantity).toFixed(2)}€</td>
      </tr>
    `).join('')
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Confirmation de commande - SPARK</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10b981; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
          th { background: #f5f5f5; }
          .total { font-weight: bold; font-size: 18px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚡ SPARK</h1>
            <p>Commande confirmée !</p>
          </div>
          <div class="content">
            <h2>Merci pour votre commande ${order.orderNumber} !</h2>
            <p>Votre commande a été confirmée et sera traitée dans les plus brefs délais.</p>
            
            <h3>Détails de la commande :</h3>
            <table>
              <thead>
                <tr>
                  <th>Produit</th>
                  <th>Quantité</th>
                  <th>Prix unitaire</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
            
            <div class="total">
              <p>Sous-total : ${order.subtotal.toFixed(2)}€</p>
              <p>Livraison : ${order.shippingCost.toFixed(2)}€</p>
              <p>TVA : ${order.tax.toFixed(2)}€</p>
              <p><strong>Total : ${order.total.toFixed(2)}€</strong></p>
            </div>
          </div>
          <div class="footer">
            <p>© 2024 SPARK - Accessoires téléphoniques</p>
            <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }
  
  /**
   * Template texte pour confirmation de commande
   */
  getOrderConfirmationText(order) {
    const itemsText = order.items.map(item => 
      `${item.name} - ${item.brand} x${item.quantity} = ${(item.price * item.quantity).toFixed(2)}€`
    ).join('\n')
    
    return `
      Merci pour votre commande ${order.orderNumber} !
      
      Votre commande a été confirmée et sera traitée dans les plus brefs délais.
      
      Détails de la commande :
      ${itemsText}
      
      Sous-total : ${order.subtotal.toFixed(2)}€
      Livraison : ${order.shippingCost.toFixed(2)}€
      TVA : ${order.tax.toFixed(2)}€
      Total : ${order.total.toFixed(2)}€
      
      Cordialement,
      L'équipe SPARK
    `
  }
  
  /**
   * Template HTML pour mise à jour de statut
   */
  getOrderStatusUpdateTemplate(order, newStatus) {
    const statusMessages = {
      'paid': 'Votre paiement a été confirmé',
      'processing': 'Votre commande est en cours de préparation',
      'shipped': 'Votre commande a été expédiée',
      'delivered': 'Votre commande a été livrée',
      'cancelled': 'Votre commande a été annulée'
    }
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Mise à jour de commande - SPARK</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #3b82f6; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚡ SPARK</h1>
            <p>Mise à jour de commande</p>
          </div>
          <div class="content">
            <h2>Commande ${order.orderNumber}</h2>
            <p>${statusMessages[newStatus] || 'Le statut de votre commande a été mis à jour'}.</p>
            ${order.trackingNumber ? `<p>Numéro de suivi : <strong>${order.trackingNumber}</strong></p>` : ''}
          </div>
          <div class="footer">
            <p>© 2024 SPARK - Accessoires téléphoniques</p>
          </div>
        </div>
      </body>
      </html>
    `
  }
  
  /**
   * Template texte pour mise à jour de statut
   */
  getOrderStatusUpdateText(order, newStatus) {
    const statusMessages = {
      'paid': 'Votre paiement a été confirmé',
      'processing': 'Votre commande est en cours de préparation',
      'shipped': 'Votre commande a été expédiée',
      'delivered': 'Votre commande a été livrée',
      'cancelled': 'Votre commande a été annulée'
    }
    
    return `
      Commande ${order.orderNumber}
      
      ${statusMessages[newStatus] || 'Le statut de votre commande a été mis à jour'}.
      ${order.trackingNumber ? `Numéro de suivi : ${order.trackingNumber}` : ''}
      
      Cordialement,
      L'équipe SPARK
    `
  }
  
  /**
   * Template HTML pour facture
   */
  getInvoiceTemplate(order) {
    return this.getOrderConfirmationTemplate(order) // Même template pour l'instant
  }
  
  /**
   * Template texte pour facture
   */
  getInvoiceText(order) {
    return this.getOrderConfirmationText(order) // Même template pour l'instant
  }
  
  /**
   * Template HTML pour email de bienvenue
   */
  getWelcomeTemplate(user) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Bienvenue chez SPARK</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #3b82f6; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚡ SPARK</h1>
            <p>Bienvenue !</p>
          </div>
          <div class="content">
            <h2>Bonjour ${user.firstName} !</h2>
            <p>Bienvenue chez SPARK, votre boutique spécialisée en accessoires téléphoniques !</p>
            <p>Découvrez notre large gamme de :</p>
            <ul>
              <li>🔌 Chargeurs rapides et sans fil</li>
              <li>📱 Coques de protection</li>
              <li>🔗 Câbles USB-C et Lightning</li>
              <li>🎧 Écouteurs et casques</li>
              <li>📸 Accessoires photo et vidéo</li>
            </ul>
            <a href="${process.env.CORS_ORIGIN}/products" class="button">Découvrir nos produits</a>
          </div>
          <div class="footer">
            <p>© 2024 SPARK - Accessoires téléphoniques</p>
          </div>
        </div>
      </body>
      </html>
    `
  }
  
  /**
   * Template texte pour email de bienvenue
   */
  getWelcomeText(user) {
    return `
      Bonjour ${user.firstName} !
      
      Bienvenue chez SPARK, votre boutique spécialisée en accessoires téléphoniques !
      
      Découvrez notre large gamme de :
      - Chargeurs rapides et sans fil
      - Coques de protection
      - Câbles USB-C et Lightning
      - Écouteurs et casques
      - Accessoires photo et vidéo
      
      Visitez notre boutique : ${process.env.CORS_ORIGIN}/products
      
      Cordialement,
      L'équipe SPARK
    `
  }
  
  /**
   * Template HTML pour notification admin
   */
  getAdminNotificationTemplate(subject, message, data) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Notification Admin - SPARK</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #ef4444; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚡ SPARK Admin</h1>
            <p>${subject}</p>
          </div>
          <div class="content">
            <p>${message}</p>
            ${data ? `<pre>${JSON.stringify(data, null, 2)}</pre>` : ''}
          </div>
          <div class="footer">
            <p>© 2024 SPARK - Accessoires téléphoniques</p>
          </div>
        </div>
      </body>
      </html>
    `
  }
  
  /**
   * Template texte pour notification admin
   */
  getAdminNotificationText(subject, message, data) {
    return `
      ${subject}
      
      ${message}
      
      ${data ? JSON.stringify(data, null, 2) : ''}
      
      SPARK Admin
    `
  }
}

module.exports = new EmailService()
