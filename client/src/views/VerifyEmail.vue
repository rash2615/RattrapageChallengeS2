<template>
  <div class="verify-email-page">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-md-6 col-lg-4">
          <div class="card">
            <div class="card-body text-center">
              <div v-if="loading" class="mb-4">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">Vérification en cours...</span>
                </div>
                <p class="mt-3">Vérification de votre email en cours...</p>
              </div>
              
              <div v-else-if="success" class="mb-4">
                <div class="success-icon">✅</div>
                <h3 class="text-success">Email vérifié !</h3>
                <p>Votre compte a été activé avec succès. Vous pouvez maintenant vous connecter.</p>
                <router-link to="/login" class="btn btn-primary">
                  Se connecter
                </router-link>
              </div>
              
              <div v-else class="mb-4">
                <div class="error-icon">❌</div>
                <h3 class="text-danger">Erreur de vérification</h3>
                <p>{{ errorMessage }}</p>
                <div class="mt-3">
                  <router-link to="/register" class="btn btn-outline-primary me-2">
                    Créer un compte
                  </router-link>
                  <router-link to="/login" class="btn btn-primary">
                    Se connecter
                  </router-link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'

const props = defineProps({
  token: {
    type: String,
    required: true
  }
})

const authStore = useAuthStore()

const loading = ref(true)
const success = ref(false)
const errorMessage = ref('')

const verifyEmail = async () => {
  try {
    loading.value = true
    const result = await authStore.verifyEmail(props.token)
    
    if (result.success) {
      success.value = true
    } else {
      errorMessage.value = result.error || 'Erreur de vérification'
    }
  } catch (error) {
    errorMessage.value = 'Une erreur inattendue s\'est produite'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  verifyEmail()
})
</script>

<style scoped>
.verify-email-page {
  min-height: calc(100vh - 200px);
  display: flex;
  align-items: center;
  padding: 2rem 0;
}

.card {
  border: none;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
}

.success-icon,
.error-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.spinner-border {
  width: 3rem;
  height: 3rem;
  border-width: 0.3rem;
}

@keyframes spinner-border {
  to {
    transform: rotate(360deg);
  }
}

.visually-hidden {
  position: absolute !important;
  width: 1px !important;
  height: 1px !important;
  padding: 0 !important;
  margin: -1px !important;
  overflow: hidden !important;
  clip: rect(0, 0, 0, 0) !important;
  white-space: nowrap !important;
  border: 0 !important;
}
</style>
