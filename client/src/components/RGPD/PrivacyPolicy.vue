<template>
  <div class="privacy-policy">
    <div class="privacy-header">
      <h1 class="privacy-title">Politique de confidentialité</h1>
      <p class="privacy-subtitle">Dernière mise à jour : {{ lastUpdated }}</p>
    </div>

    <div class="privacy-content">
      <!-- Introduction -->
      <section class="privacy-section">
        <h2 class="section-title">1. Introduction</h2>
        <p>
          SPARK s'engage à protéger votre vie privée et vos données personnelles. 
          Cette politique de confidentialité explique comment nous collectons, 
          utilisons et protégeons vos informations lorsque vous utilisez notre site web.
        </p>
        <p>
          En utilisant notre site, vous acceptez les pratiques décrites dans cette politique.
        </p>
      </section>

      <!-- Collecte des données -->
      <section class="privacy-section">
        <h2 class="section-title">2. Données collectées</h2>
        
        <h3 class="subsection-title">2.1 Données que vous nous fournissez</h3>
        <ul class="privacy-list">
          <li><strong>Informations de compte :</strong> nom, prénom, adresse e-mail, mot de passe</li>
          <li><strong>Informations de commande :</strong> adresse de livraison, informations de facturation</li>
          <li><strong>Communications :</strong> messages, demandes de support</li>
          <li><strong>Préférences :</strong> paramètres de compte, préférences de communication</li>
        </ul>

        <h3 class="subsection-title">2.2 Données collectées automatiquement</h3>
        <ul class="privacy-list">
          <li><strong>Données de navigation :</strong> pages visitées, durée de visite, liens cliqués</li>
          <li><strong>Données techniques :</strong> adresse IP, type de navigateur, système d'exploitation</li>
          <li><strong>Cookies :</strong> fichiers de suivi pour améliorer votre expérience</li>
          <li><strong>Données de localisation :</strong> pays, région (si autorisé)</li>
        </ul>
      </section>

      <!-- Utilisation des données -->
      <section class="privacy-section">
        <h2 class="section-title">3. Utilisation de vos données</h2>
        
        <div class="usage-grid">
          <div class="usage-card">
            <div class="usage-icon">🛒</div>
            <h4 class="usage-title">Traitement des commandes</h4>
            <p>Traiter et expédier vos commandes, gérer les retours et remboursements</p>
          </div>
          
          <div class="usage-card">
            <div class="usage-icon">👤</div>
            <h4 class="usage-title">Gestion du compte</h4>
            <p>Créer et maintenir votre compte utilisateur, authentification</p>
          </div>
          
          <div class="usage-card">
            <div class="usage-icon">📧</div>
            <h4 class="usage-title">Communication</h4>
            <p>Vous contacter concernant vos commandes, promotions, support client</p>
          </div>
          
          <div class="usage-card">
            <div class="usage-icon">📊</div>
            <h4 class="usage-title">Amélioration du service</h4>
            <p>Analyser l'utilisation du site, améliorer nos produits et services</p>
          </div>
          
          <div class="usage-card">
            <div class="usage-icon">🛡️</div>
            <h4 class="usage-title">Sécurité</h4>
            <p>Protéger contre la fraude, détecter les activités suspectes</p>
          </div>
          
          <div class="usage-card">
            <div class="usage-icon">⚖️</div>
            <h4 class="usage-title">Conformité légale</h4>
            <p>Respecter les obligations légales, répondre aux demandes des autorités</p>
          </div>
        </div>
      </section>

      <!-- Base légale -->
      <section class="privacy-section">
        <h2 class="section-title">4. Base légale du traitement</h2>
        
        <div class="legal-basis">
          <div class="basis-item">
            <h4 class="basis-title">Exécution du contrat</h4>
            <p>Pour traiter vos commandes et fournir nos services</p>
          </div>
          
          <div class="basis-item">
            <h4 class="basis-title">Intérêt légitime</h4>
            <p>Pour améliorer nos services et prévenir la fraude</p>
          </div>
          
          <div class="basis-item">
            <h4 class="basis-title">Consentement</h4>
            <p>Pour les communications marketing et les cookies non essentiels</p>
          </div>
          
          <div class="basis-item">
            <h4 class="basis-title">Obligation légale</h4>
            <p>Pour respecter les obligations comptables et fiscales</p>
          </div>
        </div>
      </section>

      <!-- Partage des données -->
      <section class="privacy-section">
        <h2 class="section-title">5. Partage de vos données</h2>
        
        <p>Nous ne vendons jamais vos données personnelles. Nous pouvons partager vos informations avec :</p>
        
        <div class="sharing-list">
          <div class="sharing-item">
            <h4 class="sharing-title">Prestataires de services</h4>
            <p>Partenaires de confiance qui nous aident à fournir nos services (livraison, paiement, support)</p>
          </div>
          
          <div class="sharing-item">
            <h4 class="sharing-title">Autorités légales</h4>
            <p>Lorsque requis par la loi ou pour protéger nos droits légaux</p>
          </div>
          
          <div class="sharing-item">
            <h4 class="sharing-title">Partenaires commerciaux</h4>
            <p>Uniquement avec votre consentement explicite pour des offres personnalisées</p>
          </div>
        </div>
      </section>

      <!-- Conservation des données -->
      <section class="privacy-section">
        <h2 class="section-title">6. Conservation des données</h2>
        
        <div class="retention-table">
          <div class="retention-header">
            <span class="retention-type">Type de données</span>
            <span class="retention-period">Durée de conservation</span>
          </div>
          
          <div class="retention-row">
            <span class="retention-type">Données de compte</span>
            <span class="retention-period">3 ans après la dernière activité</span>
          </div>
          
          <div class="retention-row">
            <span class="retention-type">Données de commande</span>
            <span class="retention-period">10 ans (obligation légale)</span>
          </div>
          
          <div class="retention-row">
            <span class="retention-type">Données de marketing</span>
            <span class="retention-period">Jusqu'au retrait du consentement</span>
          </div>
          
          <div class="retention-row">
            <span class="retention-type">Cookies analytiques</span>
            <span class="retention-period">2 ans maximum</span>
          </div>
        </div>
      </section>

      <!-- Vos droits -->
      <section class="privacy-section">
        <h2 class="section-title">7. Vos droits</h2>
        
        <p>Conformément au RGPD, vous disposez des droits suivants :</p>
        
        <div class="rights-grid">
          <div class="right-card">
            <div class="right-icon">👁️</div>
            <h4 class="right-title">Droit d'accès</h4>
            <p>Obtenir une copie de vos données personnelles</p>
          </div>
          
          <div class="right-card">
            <div class="right-icon">✏️</div>
            <h4 class="right-title">Droit de rectification</h4>
            <p>Corriger des données inexactes ou incomplètes</p>
          </div>
          
          <div class="right-card">
            <div class="right-icon">🗑️</div>
            <h4 class="right-title">Droit à l'effacement</h4>
            <p>Demander la suppression de vos données</p>
          </div>
          
          <div class="right-card">
            <div class="right-icon">⏸️</div>
            <h4 class="right-title">Droit à la limitation</h4>
            <p>Limiter le traitement de vos données</p>
          </div>
          
          <div class="right-card">
            <div class="right-icon">📤</div>
            <h4 class="right-title">Droit à la portabilité</h4>
            <p>Récupérer vos données dans un format structuré</p>
          </div>
          
          <div class="right-card">
            <div class="right-icon">❌</div>
            <h4 class="right-title">Droit d'opposition</h4>
            <p>Vous opposer au traitement de vos données</p>
          </div>
        </div>
        
        <div class="rights-actions">
          <button class="rights-btn" @click="requestDataAccess">
            Demander l'accès à mes données
          </button>
          <button class="rights-btn" @click="requestDataDeletion">
            Demander la suppression de mes données
          </button>
          <button class="rights-btn" @click="downloadData">
            Télécharger mes données
          </button>
        </div>
      </section>

      <!-- Cookies -->
      <section class="privacy-section">
        <h2 class="section-title">8. Cookies et technologies similaires</h2>
        
        <p>Nous utilisons des cookies pour améliorer votre expérience sur notre site :</p>
        
        <div class="cookie-types">
          <div class="cookie-type">
            <h4 class="cookie-type-title">Cookies essentiels</h4>
            <p>Nécessaires au fonctionnement du site (panier, authentification)</p>
            <span class="cookie-status required">Obligatoire</span>
          </div>
          
          <div class="cookie-type">
            <h4 class="cookie-type-title">Cookies analytiques</h4>
            <p>Pour analyser l'utilisation du site et améliorer nos services</p>
            <span class="cookie-status optional">Optionnel</span>
          </div>
          
          <div class="cookie-type">
            <h4 class="cookie-type-title">Cookies marketing</h4>
            <p>Pour personnaliser les publicités et les offres</p>
            <span class="cookie-status optional">Optionnel</span>
          </div>
        </div>
        
        <div class="cookie-actions">
          <button class="cookie-btn" @click="manageCookies">
            Gérer mes préférences de cookies
          </button>
        </div>
      </section>

      <!-- Sécurité -->
      <section class="privacy-section">
        <h2 class="section-title">9. Sécurité des données</h2>
        
        <div class="security-measures">
          <div class="security-item">
            <div class="security-icon">🔒</div>
            <h4 class="security-title">Chiffrement</h4>
            <p>Données chiffrées en transit et au repos</p>
          </div>
          
          <div class="security-item">
            <div class="security-icon">🛡️</div>
            <h4 class="security-title">Accès sécurisé</h4>
            <p>Accès restreint aux données personnelles</p>
          </div>
          
          <div class="security-item">
            <div class="security-icon">🔍</div>
            <h4 class="security-title">Surveillance</h4>
            <p>Monitoring continu des systèmes de sécurité</p>
          </div>
          
          <div class="security-item">
            <div class="security-icon">📋</div>
            <h4 class="security-title">Formation</h4>
            <p>Formation du personnel sur la protection des données</p>
          </div>
        </div>
      </section>

      <!-- Contact -->
      <section class="privacy-section">
        <h2 class="section-title">10. Contact et réclamations</h2>
        
        <div class="contact-info">
          <div class="contact-item">
            <h4 class="contact-title">Délégué à la protection des données (DPO)</h4>
            <p>Email : dpo@spark-ecommerce.com</p>
            <p>Téléphone : +33 1 23 45 67 89</p>
          </div>
          
          <div class="contact-item">
            <h4 class="contact-title">Autorité de contrôle</h4>
            <p>CNIL (Commission Nationale de l'Informatique et des Libertés)</p>
            <p>Site web : <a href="https://www.cnil.fr" target="_blank" rel="noopener">www.cnil.fr</a></p>
          </div>
        </div>
      </section>

      <!-- Modifications -->
      <section class="privacy-section">
        <h2 class="section-title">11. Modifications de cette politique</h2>
        <p>
          Nous pouvons modifier cette politique de confidentialité. Les modifications 
          importantes vous seront notifiées par e-mail ou via une notification sur le site.
        </p>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// État local
const lastUpdated = ref('15 décembre 2024')

// Actions
const requestDataAccess = () => {
  // TODO: Implémenter la demande d'accès aux données
  console.log('Demande d\'accès aux données')
  alert('Fonctionnalité en cours de développement')
}

const requestDataDeletion = () => {
  // TODO: Implémenter la demande de suppression des données
  console.log('Demande de suppression des données')
  alert('Fonctionnalité en cours de développement')
}

const downloadData = () => {
  // TODO: Implémenter le téléchargement des données
  console.log('Téléchargement des données')
  alert('Fonctionnalité en cours de développement')
}

const manageCookies = () => {
  // TODO: Ouvrir le gestionnaire de cookies
  console.log('Gestion des cookies')
  alert('Fonctionnalité en cours de développement')
}
</script>

<style scoped>
/* Container principal */
.privacy-policy {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  line-height: 1.6;
  color: #374151;
}

/* Header */
.privacy-header {
  text-align: center;
  margin-bottom: 3rem;
  padding-bottom: 2rem;
  border-bottom: 2px solid #e5e7eb;
}

.privacy-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
}

.privacy-subtitle {
  font-size: 1rem;
  color: #6b7280;
  margin: 0;
}

/* Sections */
.privacy-section {
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
.privacy-list {
  margin: 1rem 0;
  padding-left: 1.5rem;
}

.privacy-list li {
  margin-bottom: 0.5rem;
}

/* Grilles */
.usage-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin: 1.5rem 0;
}

.usage-card {
  background: #f9fafb;
  padding: 1.5rem;
  border-radius: 0.75rem;
  border: 1px solid #e5e7eb;
  text-align: center;
}

.usage-icon {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.usage-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 0.75rem 0;
}

.usage-card p {
  color: #6b7280;
  margin: 0;
  font-size: 0.875rem;
}

/* Base légale */
.legal-basis {
  display: grid;
  gap: 1rem;
  margin: 1.5rem 0;
}

.basis-item {
  background: #f0f9ff;
  padding: 1.5rem;
  border-radius: 0.75rem;
  border-left: 4px solid #3b82f6;
}

.basis-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e40af;
  margin: 0 0 0.5rem 0;
}

.basis-item p {
  color: #1e3a8a;
  margin: 0;
}

/* Partage */
.sharing-list {
  display: grid;
  gap: 1rem;
  margin: 1.5rem 0;
}

.sharing-item {
  background: #fef3c7;
  padding: 1.5rem;
  border-radius: 0.75rem;
  border-left: 4px solid #f59e0b;
}

.sharing-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #92400e;
  margin: 0 0 0.5rem 0;
}

.sharing-item p {
  color: #78350f;
  margin: 0;
}

/* Table de conservation */
.retention-table {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  overflow: hidden;
  margin: 1.5rem 0;
}

.retention-header {
  display: grid;
  grid-template-columns: 1fr 1fr;
  background: #f9fafb;
  font-weight: 600;
  color: #374151;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.retention-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.retention-row:last-child {
  border-bottom: none;
}

.retention-type {
  font-weight: 500;
  color: #374151;
}

.retention-period {
  color: #6b7280;
}

/* Droits */
.rights-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin: 1.5rem 0;
}

.right-card {
  background: #f0fdf4;
  padding: 1.5rem;
  border-radius: 0.75rem;
  border: 1px solid #bbf7d0;
  text-align: center;
}

.right-icon {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.right-title {
  font-size: 1rem;
  font-weight: 600;
  color: #166534;
  margin: 0 0 0.75rem 0;
}

.right-card p {
  color: #15803d;
  margin: 0;
  font-size: 0.875rem;
}

.rights-actions {
  display: flex;
  gap: 1rem;
  margin: 2rem 0;
  flex-wrap: wrap;
}

.rights-btn {
  padding: 0.75rem 1.5rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.rights-btn:hover {
  background: #2563eb;
  transform: translateY(-1px);
}

/* Cookies */
.cookie-types {
  display: grid;
  gap: 1rem;
  margin: 1.5rem 0;
}

.cookie-type {
  background: #f9fafb;
  padding: 1.5rem;
  border-radius: 0.75rem;
  border: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.cookie-type-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 0.5rem 0;
}

.cookie-type p {
  color: #6b7280;
  margin: 0;
}

.cookie-status {
  padding: 0.25rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.cookie-status.required {
  background: #fef3c7;
  color: #92400e;
}

.cookie-status.optional {
  background: #dbeafe;
  color: #1e40af;
}

.cookie-actions {
  margin: 1.5rem 0;
}

.cookie-btn {
  padding: 0.75rem 1.5rem;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cookie-btn:hover {
  background: #059669;
  transform: translateY(-1px);
}

/* Sécurité */
.security-measures {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin: 1.5rem 0;
}

.security-item {
  background: #fef2f2;
  padding: 1.5rem;
  border-radius: 0.75rem;
  border: 1px solid #fecaca;
  text-align: center;
}

.security-icon {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.security-title {
  font-size: 1rem;
  font-weight: 600;
  color: #991b1b;
  margin: 0 0 0.75rem 0;
}

.security-item p {
  color: #b91c1c;
  margin: 0;
  font-size: 0.875rem;
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

.contact-item a {
  color: #0284c7;
  text-decoration: none;
}

.contact-item a:hover {
  text-decoration: underline;
}

/* Responsive */
@media (max-width: 768px) {
  .privacy-policy {
    padding: 1rem;
  }
  
  .privacy-title {
    font-size: 2rem;
  }
  
  .usage-grid,
  .rights-grid,
  .security-measures {
    grid-template-columns: 1fr;
  }
  
  .retention-header,
  .retention-row {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
  
  .cookie-type {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .rights-actions {
    flex-direction: column;
  }
  
  .rights-btn {
    width: 100%;
  }
}
</style>
