<template>
  <div class="profile-page">
    <div class="container mx-auto px-4 py-8">
      <!-- En-tête -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Mon Profil</h1>
        <p class="text-gray-600">Gérez vos informations personnelles et vos préférences</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Informations personnelles -->
        <div class="lg:col-span-2">
          <div class="bg-white rounded-lg shadow-md p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-6">Informations personnelles</h2>
            
            <form @submit.prevent="updateProfile" class="space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label for="firstName" class="block text-sm font-medium text-gray-700 mb-2">
                    Prénom
                  </label>
                  <input
                    id="firstName"
                    v-model="profileForm.firstName"
                    type="text"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    :class="{ 'border-red-500': profileErrors.firstName }"
                  />
                  <p v-if="profileErrors.firstName" class="mt-1 text-sm text-red-600">
                    {{ profileErrors.firstName }}
                  </p>
                </div>

                <div>
                  <label for="lastName" class="block text-sm font-medium text-gray-700 mb-2">
                    Nom
                  </label>
                  <input
                    id="lastName"
                    v-model="profileForm.lastName"
                    type="text"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    :class="{ 'border-red-500': profileErrors.lastName }"
                  />
                  <p v-if="profileErrors.lastName" class="mt-1 text-sm text-red-600">
                    {{ profileErrors.lastName }}
                  </p>
                </div>
              </div>

              <div>
                <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  id="email"
                  v-model="profileForm.email"
                  type="email"
                  disabled
                  class="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                />
                <p class="mt-1 text-sm text-gray-500">
                  L'email ne peut pas être modifié
                </p>
              </div>

              <div>
                <label for="phone" class="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone
                </label>
                <input
                  id="phone"
                  v-model="profileForm.phone"
                  type="tel"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  :class="{ 'border-red-500': profileErrors.phone }"
                />
                <p v-if="profileErrors.phone" class="mt-1 text-sm text-red-600">
                  {{ profileErrors.phone }}
                </p>
              </div>

              <div>
                <label for="address" class="block text-sm font-medium text-gray-700 mb-2">
                  Adresse
                </label>
                <textarea
                  id="address"
                  v-model="profileForm.address"
                  rows="3"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  :class="{ 'border-red-500': profileErrors.address }"
                ></textarea>
                <p v-if="profileErrors.address" class="mt-1 text-sm text-red-600">
                  {{ profileErrors.address }}
                </p>
              </div>

              <div class="flex justify-end">
                <button
                  type="submit"
                  :disabled="profileLoading"
                  class="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span v-if="profileLoading">Mise à jour...</span>
                  <span v-else>Mettre à jour</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Actions rapides -->
        <div class="space-y-6">
          <!-- Changer le mot de passe -->
          <div class="bg-white rounded-lg shadow-md p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Sécurité</h3>
            
            <form @submit.prevent="changePassword" class="space-y-4">
              <div>
                <label for="currentPassword" class="block text-sm font-medium text-gray-700 mb-2">
                  Mot de passe actuel
                </label>
                <input
                  id="currentPassword"
                  v-model="passwordForm.currentPassword"
                  type="password"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  :class="{ 'border-red-500': passwordErrors.currentPassword }"
                />
                <p v-if="passwordErrors.currentPassword" class="mt-1 text-sm text-red-600">
                  {{ passwordErrors.currentPassword }}
                </p>
              </div>

              <div>
                <label for="newPassword" class="block text-sm font-medium text-gray-700 mb-2">
                  Nouveau mot de passe
                </label>
                <input
                  id="newPassword"
                  v-model="passwordForm.newPassword"
                  type="password"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  :class="{ 'border-red-500': passwordErrors.newPassword }"
                />
                <p v-if="passwordErrors.newPassword" class="mt-1 text-sm text-red-600">
                  {{ passwordErrors.newPassword }}
                </p>
              </div>

              <div>
                <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-2">
                  Confirmer le mot de passe
                </label>
                <input
                  id="confirmPassword"
                  v-model="passwordForm.confirmPassword"
                  type="password"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  :class="{ 'border-red-500': passwordErrors.confirmPassword }"
                />
                <p v-if="passwordErrors.confirmPassword" class="mt-1 text-sm text-red-600">
                  {{ passwordErrors.confirmPassword }}
                </p>
              </div>

              <button
                type="submit"
                :disabled="passwordLoading"
                class="w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span v-if="passwordLoading">Changement...</span>
                <span v-else>Changer le mot de passe</span>
              </button>
            </form>
          </div>

          <!-- Préférences -->
          <div class="bg-white rounded-lg shadow-md p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Préférences</h3>
            
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <div>
                  <h4 class="text-sm font-medium text-gray-900">Notifications email</h4>
                  <p class="text-sm text-gray-500">Recevoir des notifications par email</p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input
                    v-model="preferences.emailNotifications"
                    type="checkbox"
                    class="sr-only peer"
                  />
                  <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div class="flex items-center justify-between">
                <div>
                  <h4 class="text-sm font-medium text-gray-900">Newsletter</h4>
                  <p class="text-sm text-gray-500">Recevoir notre newsletter</p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input
                    v-model="preferences.newsletter"
                    type="checkbox"
                    class="sr-only peer"
                  />
                  <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>

            <button
              @click="updatePreferences"
              :disabled="preferencesLoading"
              class="w-full mt-4 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="preferencesLoading">Sauvegarde...</span>
              <span v-else>Sauvegarder les préférences</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { showToast } from '../utils/modals'

// Store
const authStore = useAuthStore()

// État réactif
const profileLoading = ref(false)
const passwordLoading = ref(false)
const preferencesLoading = ref(false)

// Formulaires
const profileForm = reactive({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: ''
})

const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const preferences = reactive({
  emailNotifications: true,
  newsletter: false
})

// Erreurs
const profileErrors = reactive({})
const passwordErrors = reactive({})

// Charger les données du profil
onMounted(() => {
  if (authStore.user) {
    profileForm.firstName = authStore.user.firstName || ''
    profileForm.lastName = authStore.user.lastName || ''
    profileForm.email = authStore.user.email || ''
    profileForm.phone = authStore.user.phone || ''
    profileForm.address = authStore.user.address || ''
    
    preferences.emailNotifications = authStore.user.preferences?.emailNotifications ?? true
    preferences.newsletter = authStore.user.preferences?.newsletter ?? false
  }
})

// Mettre à jour le profil
const updateProfile = async () => {
  profileLoading.value = true
  profileErrors.value = {}

  try {
    const result = await authStore.updateProfile(profileForm)
    
    if (result.success) {
      showToast('Profil mis à jour avec succès', 'success')
    } else {
      if (result.errors) {
        Object.assign(profileErrors.value, result.errors)
      } else {
        showToast(result.error || 'Erreur lors de la mise à jour du profil', 'error')
      }
    }
  } catch (error) {
    showToast('Erreur lors de la mise à jour du profil', 'error')
  } finally {
    profileLoading.value = false
  }
}

// Changer le mot de passe
const changePassword = async () => {
  passwordLoading.value = true
  passwordErrors.value = {}

  // Validation côté client
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    passwordErrors.value.confirmPassword = 'Les mots de passe ne correspondent pas'
    passwordLoading.value = false
    return
  }

  if (passwordForm.newPassword.length < 8) {
    passwordErrors.value.newPassword = 'Le mot de passe doit contenir au moins 8 caractères'
    passwordLoading.value = false
    return
  }

  try {
    const result = await authStore.changePassword({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword
    })
    
    if (result.success) {
      showToast('Mot de passe changé avec succès', 'success')
      // Réinitialiser le formulaire
      passwordForm.currentPassword = ''
      passwordForm.newPassword = ''
      passwordForm.confirmPassword = ''
    } else {
      if (result.errors) {
        Object.assign(passwordErrors.value, result.errors)
      } else {
        showToast(result.error || 'Erreur lors du changement de mot de passe', 'error')
      }
    }
  } catch (error) {
    showToast('Erreur lors du changement de mot de passe', 'error')
  } finally {
    passwordLoading.value = false
  }
}

// Mettre à jour les préférences
const updatePreferences = async () => {
  preferencesLoading.value = true

  try {
    const result = await authStore.updatePreferences(preferences)
    
    if (result.success) {
      showToast('Préférences mises à jour avec succès', 'success')
    } else {
      showToast(result.error || 'Erreur lors de la mise à jour des préférences', 'error')
    }
  } catch (error) {
    showToast('Erreur lors de la mise à jour des préférences', 'error')
  } finally {
    preferencesLoading.value = false
  }
}
</script>

<style scoped>
.profile-page {
  min-height: calc(100vh - 200px);
}
</style>
