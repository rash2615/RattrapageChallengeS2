<template>
  <div class="terms-of-service">
    <div class="terms-header">
      <h1 class="terms-title">Conditions générales d'utilisation</h1>
      <p class="terms-subtitle">Dernière mise à jour : {{ lastUpdated }}</p>
    </div>

    <div class="terms-content">
      <!-- Introduction -->
      <section class="terms-section">
        <h2 class="section-title">1. Objet et champ d'application</h2>
        <p>
          Les présentes conditions générales d'utilisation (CGU) régissent l'utilisation 
          du site web SPARK (www.spark-ecommerce.com) et de tous les services associés.
        </p>
        <p>
          En accédant et en utilisant notre site, vous acceptez d'être lié par ces CGU. 
          Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre site.
        </p>
      </section>

      <!-- Définitions -->
      <section class="terms-section">
        <h2 class="section-title">2. Définitions</h2>
        
        <div class="definitions-grid">
          <div class="definition-item">
            <h4 class="definition-term">Site</h4>
            <p>Le site web SPARK accessible à l'adresse www.spark-ecommerce.com</p>
          </div>
          
          <div class="definition-item">
            <h4 class="definition-term">Utilisateur</h4>
            <p>Toute personne accédant au site, qu'elle soit identifiée ou non</p>
          </div>
          
          <div class="definition-item">
            <h4 class="definition-term">Client</h4>
            <p>Utilisateur ayant créé un compte et effectué au moins une commande</p>
          </div>
          
          <div class="definition-item">
            <h4 class="definition-term">Produits</h4>
            <p>Accessoires téléphoniques vendus sur le site (chargeurs, coques, câbles, etc.)</p>
          </div>
          
          <div class="definition-item">
            <h4 class="definition-term">Commande</h4>
            <p>Contrat de vente conclu entre le client et SPARK</p>
          </div>
          
          <div class="definition-item">
            <h4 class="definition-term">Services</h4>
            <p>L'ensemble des services proposés par SPARK via le site</p>
          </div>
        </div>
      </section>

      <!-- Accès au site -->
      <section class="terms-section">
        <h2 class="section-title">3. Accès au site</h2>
        
        <h3 class="subsection-title">3.1 Disponibilité</h3>
        <p>
          Nous nous efforçons de maintenir le site accessible 24h/24, 7j/7. Cependant, 
          nous ne pouvons garantir une disponibilité ininterrompue en raison de :
        </p>
        <ul class="terms-list">
          <li>Maintenances programmées</li>
          <li>Pannes techniques</li>
          <li>Cas de force majeure</li>
          <li>Attaques informatiques</li>
        </ul>

        <h3 class="subsection-title">3.2 Responsabilités de l'utilisateur</h3>
        <p>L'utilisateur s'engage à :</p>
        <ul class="terms-list">
          <li>Fournir des informations exactes et à jour</li>
          <li>Maintenir la confidentialité de ses identifiants</li>
          <li>Ne pas utiliser le site à des fins illégales</li>
          <li>Respecter les droits de propriété intellectuelle</li>
          <li>Ne pas tenter de compromettre la sécurité du site</li>
        </ul>
      </section>

      <!-- Inscription et compte -->
      <section class="terms-section">
        <h2 class="section-title">4. Inscription et compte utilisateur</h2>
        
        <h3 class="subsection-title">4.1 Création de compte</h3>
        <p>
          L'inscription est gratuite et facultative. Elle permet d'accéder à des services 
          personnalisés et de faciliter les commandes futures.
        </p>
        
        <div class="account-requirements">
          <h4 class="requirements-title">Informations requises :</h4>
          <ul class="requirements-list">
            <li>Nom et prénom</li>
            <li>Adresse e-mail valide</li>
            <li>Mot de passe sécurisé</li>
            <li>Adresse de livraison</li>
            <li>Numéro de téléphone (optionnel)</li>
          </ul>
        </div>

        <h3 class="subsection-title">4.2 Validation du compte</h3>
        <p>
          Un e-mail de confirmation sera envoyé à l'adresse fournie. Le compte sera 
          activé après validation du lien reçu.
        </p>

        <h3 class="subsection-title">4.3 Gestion du compte</h3>
        <p>
          L'utilisateur peut modifier ses informations personnelles à tout moment 
          depuis son espace client. Il est responsable de la mise à jour de ses données.
        </p>
      </section>

      <!-- Produits et commandes -->
      <section class="terms-section">
        <h2 class="section-title">5. Produits et commandes</h2>
        
        <h3 class="subsection-title">5.1 Catalogue de produits</h3>
        <p>
          Nous proposons une sélection d'accessoires téléphoniques de qualité. 
          Les descriptions, images et prix sont fournis à titre indicatif.
        </p>
        
        <div class="product-info">
          <h4 class="info-title">Informations produits :</h4>
          <ul class="info-list">
            <li>Prix TTC en euros</li>
            <li>Disponibilité en temps réel</li>
            <li>Caractéristiques techniques détaillées</li>
            <li>Photos haute qualité</li>
            <li>Avis clients authentiques</li>
          </ul>
        </div>

        <h3 class="subsection-title">5.2 Processus de commande</h3>
        <div class="order-process">
          <div class="process-step">
            <div class="step-number">1</div>
            <div class="step-content">
              <h4 class="step-title">Sélection des produits</h4>
              <p>Ajoutez les produits désirés à votre panier</p>
            </div>
          </div>
          
          <div class="process-step">
            <div class="step-number">2</div>
            <div class="step-content">
              <h4 class="step-title">Validation du panier</h4>
              <p>Vérifiez les articles et quantités sélectionnés</p>
            </div>
          </div>
          
          <div class="process-step">
            <div class="step-number">3</div>
            <div class="step-content">
              <h4 class="step-title">Informations de livraison</h4>
              <p>Renseignez l'adresse et les informations de contact</p>
            </div>
          </div>
          
          <div class="process-step">
            <div class="step-number">4</div>
            <div class="step-content">
              <h4 class="step-title">Paiement</h4>
              <p>Choisissez votre méthode de paiement sécurisée</p>
            </div>
          </div>
          
          <div class="process-step">
            <div class="step-number">5</div>
            <div class="step-content">
              <h4 class="step-title">Confirmation</h4>
              <p>Recevez la confirmation de votre commande par e-mail</p>
            </div>
          </div>
        </div>

        <h3 class="subsection-title">5.3 Prix et disponibilité</h3>
        <p>
          Les prix sont indiqués en euros TTC. Nous nous réservons le droit de modifier 
          les prix à tout moment. Les commandes sont traitées selon la disponibilité 
          des stocks au moment de la commande.
        </p>
      </section>

      <!-- Paiement -->
      <section class="terms-section">
        <h2 class="section-title">6. Paiement</h2>
        
        <h3 class="subsection-title">6.1 Méthodes de paiement acceptées</h3>
        <div class="payment-methods">
          <div class="payment-method">
            <div class="method-icon">💳</div>
            <h4 class="method-name">Carte bancaire</h4>
            <p>Visa, Mastercard, American Express</p>
          </div>
          
          <div class="payment-method">
            <div class="method-icon">🅿️</div>
            <h4 class="method-name">PayPal</h4>
            <p>Paiement sécurisé via PayPal</p>
          </div>
          
          <div class="payment-method">
            <div class="method-icon">🏦</div>
            <h4 class="method-name">Virement bancaire</h4>
            <p>Pour les commandes supérieures à 100€</p>
          </div>
        </div>

        <h3 class="subsection-title">6.2 Sécurité des paiements</h3>
        <p>
          Tous les paiements sont sécurisés par des protocoles de chiffrement SSL. 
          Nous ne stockons pas vos informations de paiement.
        </p>

        <h3 class="subsection-title">6.3 Facturation</h3>
        <p>
          Une facture sera générée automatiquement après validation du paiement 
          et envoyée par e-mail.
        </p>
      </section>

      <!-- Livraison -->
      <section class="terms-section">
        <h2 class="section-title">7. Livraison</h2>
        
        <h3 class="subsection-title">7.1 Zones de livraison</h3>
        <p>Nous livrons dans toute la France métropolitaine et en Europe.</p>
        
        <div class="delivery-zones">
          <div class="zone-item">
            <h4 class="zone-name">France métropolitaine</h4>
            <p>Livraison standard : 2-3 jours ouvrés</p>
            <p>Livraison express : 24h</p>
          </div>
          
          <div class="zone-item">
            <h4 class="zone-name">Europe</h4>
            <p>Livraison standard : 5-7 jours ouvrés</p>
            <p>Frais de port selon le pays</p>
          </div>
        </div>

        <h3 class="subsection-title">7.2 Frais de port</h3>
        <div class="shipping-costs">
          <div class="cost-item">
            <span class="cost-range">0 - 50€</span>
            <span class="cost-price">5,99€</span>
          </div>
          <div class="cost-item">
            <span class="cost-range">50 - 100€</span>
            <span class="cost-price">3,99€</span>
          </div>
          <div class="cost-item">
            <span class="cost-range">100€ et plus</span>
            <span class="cost-price">Gratuit</span>
          </div>
        </div>

        <h3 class="subsection-title">7.3 Suivi de commande</h3>
        <p>
          Un numéro de suivi vous sera communiqué par e-mail dès l'expédition. 
          Vous pourrez suivre votre colis en temps réel.
        </p>
      </section>

      <!-- Retours et remboursements -->
      <section class="terms-section">
        <h2 class="section-title">8. Retours et remboursements</h2>
        
        <h3 class="subsection-title">8.1 Droit de rétractation</h3>
        <p>
          Conformément à la législation française, vous disposez d'un délai de 14 jours 
          pour retourner un produit sans justification.
        </p>
        
        <div class="return-conditions">
          <h4 class="conditions-title">Conditions de retour :</h4>
          <ul class="conditions-list">
            <li>Produit dans son emballage d'origine</li>
            <li>Accessoires et documentation inclus</li>
            <li>Produit non utilisé et en parfait état</li>
            <li>Demande de retour dans les 14 jours</li>
          </ul>
        </div>

        <h3 class="subsection-title">8.2 Processus de retour</h3>
        <div class="return-process">
          <div class="return-step">
            <div class="step-icon">📧</div>
            <div class="step-text">
              <h4>1. Demande de retour</h4>
              <p>Contactez notre service client</p>
            </div>
          </div>
          
          <div class="return-step">
            <div class="step-icon">📦</div>
            <div class="step-text">
              <h4>2. Expédition</h4>
              <p>Retournez le produit à nos frais</p>
            </div>
          </div>
          
          <div class="return-step">
            <div class="step-icon">✅</div>
            <div class="step-text">
              <h4>3. Contrôle</h4>
              <p>Vérification de l'état du produit</p>
            </div>
          </div>
          
          <div class="return-step">
            <div class="step-icon">💰</div>
            <div class="step-text">
              <h4>4. Remboursement</h4>
              <p>Remboursement sous 5 jours ouvrés</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Garanties -->
      <section class="terms-section">
        <h2 class="section-title">9. Garanties et responsabilité</h2>
        
        <h3 class="subsection-title">9.1 Garantie légale</h3>
        <p>
          Tous nos produits bénéficient de la garantie légale de conformité de 2 ans 
          et de la garantie des vices cachés.
        </p>

        <h3 class="subsection-title">9.2 Garantie constructeur</h3>
        <p>
          Les produits bénéficient également de la garantie constructeur selon les 
          conditions spécifiques de chaque marque.
        </p>

        <h3 class="subsection-title">9.3 Limitation de responsabilité</h3>
        <p>
          Notre responsabilité est limitée au montant de la commande. Nous ne saurions 
          être tenus responsables des dommages indirects.
        </p>
      </section>

      <!-- Propriété intellectuelle -->
      <section class="terms-section">
        <h2 class="section-title">10. Propriété intellectuelle</h2>
        
        <p>
          Le site et son contenu (textes, images, logos, design) sont protégés par 
          le droit d'auteur et appartiennent à SPARK ou à ses partenaires.
        </p>
        
        <div class="ip-rights">
          <div class="ip-item">
            <h4 class="ip-title">Contenu du site</h4>
            <p>Textes, images, vidéos, logos</p>
          </div>
          
          <div class="ip-item">
            <h4 class="ip-title">Marque SPARK</h4>
            <p>Nom, logo, identité visuelle</p>
          </div>
          
          <div class="ip-item">
            <h4 class="ip-title">Base de données</h4>
            <p>Catalogue produits, avis clients</p>
          </div>
        </div>

        <p>
          Toute reproduction, même partielle, est interdite sans autorisation écrite 
          préalable.
        </p>
      </section>

      <!-- Protection des données -->
      <section class="terms-section">
        <h2 class="section-title">11. Protection des données personnelles</h2>
        
        <p>
          Le traitement de vos données personnelles est régi par notre 
          <a href="/privacy-policy" class="privacy-link">Politique de confidentialité</a>.
        </p>
        
        <div class="data-protection">
          <h4 class="protection-title">Vos droits :</h4>
          <ul class="protection-list">
            <li>Accès à vos données</li>
            <li>Rectification des informations</li>
            <li>Suppression des données</li>
            <li>Portabilité des données</li>
            <li>Opposition au traitement</li>
          </ul>
        </div>
      </section>

      <!-- Résiliation -->
      <section class="terms-section">
        <h2 class="section-title">12. Résiliation</h2>
        
        <h3 class="subsection-title">12.1 Suspension de compte</h3>
        <p>
          Nous nous réservons le droit de suspendre ou supprimer un compte en cas de :
        </p>
        <ul class="terms-list">
          <li>Violation des présentes CGU</li>
          <li>Comportement frauduleux</li>
          <li>Non-paiement de commandes</li>
          <li>Demande de l'utilisateur</li>
        </ul>

        <h3 class="subsection-title">12.2 Fermeture du site</h3>
        <p>
          En cas de fermeture définitive du site, les utilisateurs seront informés 
          avec un préavis de 30 jours.
        </p>
      </section>

      <!-- Droit applicable -->
      <section class="terms-section">
        <h2 class="section-title">13. Droit applicable et juridiction</h2>
        
        <p>
          Les présentes CGU sont régies par le droit français. En cas de litige, 
          les tribunaux français seront seuls compétents.
        </p>
        
        <div class="legal-info">
          <h4 class="legal-title">Informations légales :</h4>
          <ul class="legal-list">
            <li>Raison sociale : SPARK E-commerce</li>
            <li>Forme juridique : SAS</li>
            <li>Capital social : 50 000€</li>
            <li>RCS : Paris B 123 456 789</li>
            <li>Siège social : 123 Rue de la Paix, 75001 Paris</li>
            <li>Directeur de publication : Jean Dupont</li>
          </ul>
        </div>
      </section>

      <!-- Contact -->
      <section class="terms-section">
        <h2 class="section-title">14. Contact</h2>
        
        <div class="contact-info">
          <div class="contact-item">
            <h4 class="contact-title">Service client</h4>
            <p>Email : contact@spark-ecommerce.com</p>
            <p>Téléphone : +33 1 23 45 67 89</p>
            <p>Horaires : Lun-Ven 9h-18h</p>
          </div>
          
          <div class="contact-item">
            <h4 class="contact-title">Support technique</h4>
            <p>Email : support@spark-ecommerce.com</p>
            <p>Chat en ligne disponible 24h/24</p>
          </div>
        </div>
      </section>

      <!-- Modifications -->
      <section class="terms-section">
        <h2 class="section-title">15. Modifications des CGU</h2>
        <p>
          Nous nous réservons le droit de modifier ces CGU à tout moment. 
          Les modifications seront notifiées aux utilisateurs et prendront effet 
          immédiatement.
        </p>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// État local
const lastUpdated = ref('15 décembre 2024')
</script>

<style scoped>
/* Container principal */
.terms-of-service {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  line-height: 1.6;
  color: #374151;
}

/* Header */
.terms-header {
  text-align: center;
  margin-bottom: 3rem;
  padding-bottom: 2rem;
  border-bottom: 2px solid #e5e7eb;
}

.terms-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
}

.terms-subtitle {
  font-size: 1rem;
  color: #6b7280;
  margin: 0;
}

/* Sections */
.terms-section {
  margin-bottom: 3rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 1rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.subsection-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #374151;
  margin: 1.5rem 0 0.75rem 0;
}

/* Listes */
.terms-list {
  margin: 1rem 0;
  padding-left: 1.5rem;
}

.terms-list li {
  margin-bottom: 0.5rem;
}

/* Grilles */
.definitions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin: 1.5rem 0;
}

.definition-item {
  background: #f9fafb;
  padding: 1.5rem;
  border-radius: 0.75rem;
  border: 1px solid #e5e7eb;
}

.definition-term {
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 0.75rem 0;
}

.definition-item p {
  color: #6b7280;
  margin: 0;
  font-size: 0.875rem;
}

/* Compte */
.account-requirements {
  background: #f0f9ff;
  padding: 1.5rem;
  border-radius: 0.75rem;
  border-left: 4px solid #3b82f6;
  margin: 1.5rem 0;
}

.requirements-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e40af;
  margin: 0 0 0.75rem 0;
}

.requirements-list {
  margin: 0;
  padding-left: 1.5rem;
}

.requirements-list li {
  color: #1e3a8a;
  margin-bottom: 0.5rem;
}

/* Processus de commande */
.order-process {
  display: grid;
  gap: 1.5rem;
  margin: 1.5rem 0;
}

.process-step {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: #f9fafb;
  border-radius: 0.75rem;
  border: 1px solid #e5e7eb;
}

.step-number {
  width: 2.5rem;
  height: 2.5rem;
  background: #3b82f6;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1.125rem;
  flex-shrink: 0;
}

.step-content {
  flex: 1;
}

.step-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 0.5rem 0;
}

.step-content p {
  color: #6b7280;
  margin: 0;
}

/* Informations produits */
.product-info {
  background: #f0fdf4;
  padding: 1.5rem;
  border-radius: 0.75rem;
  border-left: 4px solid #10b981;
  margin: 1.5rem 0;
}

.info-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #166534;
  margin: 0 0 0.75rem 0;
}

.info-list {
  margin: 0;
  padding-left: 1.5rem;
}

.info-list li {
  color: #15803d;
  margin-bottom: 0.5rem;
}

/* Méthodes de paiement */
.payment-methods {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin: 1.5rem 0;
}

.payment-method {
  background: #f9fafb;
  padding: 1.5rem;
  border-radius: 0.75rem;
  border: 1px solid #e5e7eb;
  text-align: center;
}

.method-icon {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.method-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 0.5rem 0;
}

.payment-method p {
  color: #6b7280;
  margin: 0;
  font-size: 0.875rem;
}

/* Zones de livraison */
.delivery-zones {
  display: grid;
  gap: 1.5rem;
  margin: 1.5rem 0;
}

.zone-item {
  background: #fef3c7;
  padding: 1.5rem;
  border-radius: 0.75rem;
  border-left: 4px solid #f59e0b;
}

.zone-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: #92400e;
  margin: 0 0 0.75rem 0;
}

.zone-item p {
  color: #78350f;
  margin: 0 0 0.5rem 0;
}

.zone-item p:last-child {
  margin-bottom: 0;
}

/* Coûts de livraison */
.shipping-costs {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  overflow: hidden;
  margin: 1.5rem 0;
}

.cost-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.cost-item:last-child {
  border-bottom: none;
}

.cost-range {
  font-weight: 500;
  color: #374151;
}

.cost-price {
  color: #6b7280;
  font-weight: 600;
}

/* Retours */
.return-conditions {
  background: #fef2f2;
  padding: 1.5rem;
  border-radius: 0.75rem;
  border-left: 4px solid #ef4444;
  margin: 1.5rem 0;
}

.conditions-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #991b1b;
  margin: 0 0 0.75rem 0;
}

.conditions-list {
  margin: 0;
  padding-left: 1.5rem;
}

.conditions-list li {
  color: #b91c1c;
  margin-bottom: 0.5rem;
}

/* Processus de retour */
.return-process {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin: 1.5rem 0;
}

.return-step {
  background: #f9fafb;
  padding: 1.5rem;
  border-radius: 0.75rem;
  border: 1px solid #e5e7eb;
  text-align: center;
}

.step-icon {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.step-text h4 {
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 0.5rem 0;
}

.step-text p {
  color: #6b7280;
  margin: 0;
  font-size: 0.875rem;
}

/* Propriété intellectuelle */
.ip-rights {
  display: grid;
  gap: 1rem;
  margin: 1.5rem 0;
}

.ip-item {
  background: #f0f9ff;
  padding: 1.5rem;
  border-radius: 0.75rem;
  border-left: 4px solid #0ea5e9;
}

.ip-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #0c4a6e;
  margin: 0 0 0.5rem 0;
}

.ip-item p {
  color: #075985;
  margin: 0;
}

.privacy-link {
  color: #3b82f6;
  text-decoration: none;
  font-weight: 500;
}

.privacy-link:hover {
  text-decoration: underline;
}

/* Protection des données */
.data-protection {
  background: #f0fdf4;
  padding: 1.5rem;
  border-radius: 0.75rem;
  border-left: 4px solid #10b981;
  margin: 1.5rem 0;
}

.protection-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #166534;
  margin: 0 0 0.75rem 0;
}

.protection-list {
  margin: 0;
  padding-left: 1.5rem;
}

.protection-list li {
  color: #15803d;
  margin-bottom: 0.5rem;
}

/* Informations légales */
.legal-info {
  background: #f9fafb;
  padding: 1.5rem;
  border-radius: 0.75rem;
  border: 1px solid #e5e7eb;
  margin: 1.5rem 0;
}

.legal-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 0.75rem 0;
}

.legal-list {
  margin: 0;
  padding-left: 1.5rem;
}

.legal-list li {
  color: #6b7280;
  margin-bottom: 0.5rem;
}

/* Contact */
.contact-info {
  display: grid;
  gap: 1.5rem;
  margin: 1.5rem 0;
}

.contact-item {
  background: #f0f9ff;
  padding: 1.5rem;
  border-radius: 0.75rem;
  border-left: 4px solid #0ea5e9;
}

.contact-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #0c4a6e;
  margin: 0 0 0.75rem 0;
}

.contact-item p {
  color: #075985;
  margin: 0 0 0.5rem 0;
}

.contact-item p:last-child {
  margin-bottom: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .terms-of-service {
    padding: 1rem;
  }
  
  .terms-title {
    font-size: 2rem;
  }
  
  .definitions-grid,
  .payment-methods,
  .return-process {
    grid-template-columns: 1fr;
  }
  
  .process-step {
    flex-direction: column;
    text-align: center;
  }
  
  .step-number {
    margin-bottom: 1rem;
  }
}
</style>
