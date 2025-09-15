<template>
  <div class="not-found-page">
    <div class="container mx-auto px-4 py-16 text-center">
      <!-- Illustration -->
      <div class="mb-8">
        <div class="text-9xl font-bold text-gray-200 mb-4">404</div>
        <div class="text-6xl mb-4">🔍</div>
      </div>

      <!-- Message -->
      <div class="max-w-md mx-auto">
        <h1 class="text-3xl font-bold text-gray-900 mb-4">
          Page non trouvée
        </h1>
        <p class="text-lg text-gray-600 mb-8">
          Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
        </p>

        <!-- Actions -->
        <div class="space-y-4">
          <router-link
            to="/"
            class="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            🏠 Retour à l'accueil
          </router-link>
          
          <div class="text-sm text-gray-500">
            ou
          </div>
          
          <button
            @click="goBack"
            class="inline-block bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
          >
            ← Page précédente
          </button>
        </div>

        <!-- Suggestions -->
        <div class="mt-12 text-left">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">
            Pages populaires
          </h3>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <router-link
              to="/products"
              class="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <div class="flex items-center">
                <div class="text-2xl mr-3">📱</div>
                <div>
                  <div class="font-medium text-gray-900">Produits</div>
                  <div class="text-sm text-gray-500">Découvrir nos accessoires</div>
                </div>
              </div>
            </router-link>

            <router-link
              to="/cart"
              class="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <div class="flex items-center">
                <div class="text-2xl mr-3">🛒</div>
                <div>
                  <div class="font-medium text-gray-900">Panier</div>
                  <div class="text-sm text-gray-500">Voir vos articles</div>
                </div>
              </div>
            </router-link>

            <router-link
              to="/orders"
              class="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <div class="flex items-center">
                <div class="text-2xl mr-3">📦</div>
                <div>
                  <div class="font-medium text-gray-900">Mes commandes</div>
                  <div class="text-sm text-gray-500">Suivre vos commandes</div>
                </div>
              </div>
            </router-link>

            <router-link
              to="/login"
              class="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <div class="flex items-center">
                <div class="text-2xl mr-3">👤</div>
                <div>
                  <div class="font-medium text-gray-900">Connexion</div>
                  <div class="text-sm text-gray-500">Accéder à votre compte</div>
                </div>
              </div>
            </router-link>
          </div>
        </div>

        <!-- Aide -->
        <div class="mt-12 p-6 bg-gray-50 rounded-lg">
          <h3 class="text-lg font-semibold text-gray-900 mb-2">
            Besoin d'aide ?
          </h3>
          <p class="text-gray-600 mb-4">
            Si vous pensez qu'il s'agit d'une erreur, n'hésitez pas à nous contacter.
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:support@spark-ecommerce.com"
              class="inline-flex items-center text-blue-600 hover:text-blue-800"
            >
              📧 support@spark-ecommerce.com
            </a>
            <a
              href="tel:+33123456789"
              class="inline-flex items-center text-blue-600 hover:text-blue-800"
            >
              📞 01 23 45 67 89
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

// Retourner à la page précédente
const goBack = () => {
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    router.push('/')
  }
}
</script>

<style scoped>
.not-found-page {
  min-height: calc(100vh - 200px);
}
</style>
