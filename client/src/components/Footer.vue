<template>
  <footer class="footer">
    <div class="container">
      <div class="row">
        <div class="col-md-4">
          <h5>E-commerce App</h5>
          <p>Votre boutique en ligne de confiance pour tous vos besoins.</p>
        </div>
        
        <div class="col-md-4">
          <h5>Liens utiles</h5>
          <ul class="footer-links">
            <li><router-link to="/products">Produits</router-link></li>
            <li><router-link to="/about">À propos</router-link></li>
            <li><router-link to="/contact">Contact</router-link></li>
            <li><router-link to="/help">Aide</router-link></li>
          </ul>
        </div>
        
        <div class="col-md-4">
          <h5>Informations légales</h5>
          <ul class="footer-links">
            <li><a href="#" @click.prevent="showRGPD">RGPD</a></li>
            <li><a href="#" @click.prevent="showCookies">Cookies</a></li>
            <li><a href="#" @click.prevent="showTerms">CGV</a></li>
            <li><a href="#" @click.prevent="showPrivacy">Confidentialité</a></li>
          </ul>
        </div>
      </div>
      
      <hr>
      
      <div class="footer-bottom">
        <p>&copy; 2024 E-commerce App. Tous droits réservés.</p>
      </div>
    </div>
  </footer>
</template>

<script setup>
const showRGPD = () => {
  // TODO: Implémenter la modale RGPD
  alert('Modal RGPD à implémenter')
}

const showCookies = () => {
  // TODO: Implémenter la modale cookies
  alert('Modal cookies à implémenter')
}

const showTerms = () => {
  // TODO: Implémenter les CGV
  alert('CGV à implémenter')
}

const showPrivacy = () => {
  // TODO: Implémenter la politique de confidentialité
  alert('Politique de confidentialité à implémenter')
}
</script>

<style scoped>
.footer {
  background-color: var(--dark-color);
  color: #fff;
  padding: 2rem 0 1rem;
  margin-top: 3rem;
}

.footer h5 {
  margin-bottom: 1rem;
  color: #fff;
}

.footer-links {
  list-style: none;
  padding: 0;
}

.footer-links li {
  margin-bottom: 0.5rem;
}

.footer-links a {
  color: #ccc;
  text-decoration: none;
  transition: color 0.15s ease-in-out;
}

.footer-links a:hover {
  color: #fff;
}

.footer-bottom {
  text-align: center;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #555;
}

.footer-bottom p {
  margin: 0;
  color: #ccc;
}
</style>
