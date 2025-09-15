<template>
  <div class="not-found-page">
    <div class="container">
      <div class="text-center py-5">
        <div class="error-code">404</div>
        <h1 class="error-title">Page non trouvée</h1>
        <p class="error-message">
          Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        
        <div class="error-actions">
          <router-link to="/" class="btn btn-primary">
            Retour à l'accueil
          </router-link>
          <router-link to="/products" class="btn btn-outline-primary">
            Voir nos produits
          </router-link>
        </div>
        
        <div class="error-suggestions mt-4">
          <h5>Que souhaitez-vous faire ?</h5>
          <div class="suggestions-list">
            <router-link to="/products" class="suggestion-item">
              <span class="suggestion-icon">🛍️</span>
              <span>Découvrir nos produits</span>
            </router-link>
            
            <router-link to="/cart" class="suggestion-item">
              <span class="suggestion-icon">🛒</span>
              <span>Voir mon panier</span>
            </router-link>
            
            <router-link to="/orders" class="suggestion-item">
              <span class="suggestion-icon">📦</span>
              <span>Mes commandes</span>
            </router-link>
            
            <router-link to="/profile" class="suggestion-item">
              <span class="suggestion-icon">👤</span>
              <span>Mon profil</span>
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Pas de logique particulière nécessaire pour cette page
</script>

<style scoped>
.not-found-page {
  min-height: calc(100vh - 200px);
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.error-code {
  font-size: 8rem;
  font-weight: bold;
  color: var(--primary-color);
  line-height: 1;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
}

.error-title {
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 1rem;
  font-weight: 600;
}

.error-message {
  font-size: 1.25rem;
  color: #666;
  margin-bottom: 2rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.error-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 3rem;
}

.error-suggestions h5 {
  color: #333;
  margin-bottom: 1.5rem;
}

.suggestions-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  max-width: 600px;
  margin: 0 auto;
}

.suggestion-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: white;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  color: #333;
  text-decoration: none;
  transition: all 0.2s ease-in-out;
}

.suggestion-item:hover {
  transform: translateY(-2px);
  box-shadow: var(--box-shadow-lg);
  color: var(--primary-color);
}

.suggestion-icon {
  font-size: 1.5rem;
}

@media (max-width: 768px) {
  .error-code {
    font-size: 6rem;
  }
  
  .error-title {
    font-size: 2rem;
  }
  
  .error-message {
    font-size: 1rem;
  }
  
  .error-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .error-actions .btn {
    width: 200px;
  }
  
  .suggestions-list {
    grid-template-columns: 1fr;
  }
}
</style>
