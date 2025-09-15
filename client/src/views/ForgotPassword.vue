<template>
  <div class="forgot-password-page">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-md-6 col-lg-4">
          <div class="card">
            <div class="card-body">
              <h2 class="card-title text-center mb-4">Mot de passe oublié</h2>
              
              <div v-if="!emailSent">
                <p class="text-muted text-center mb-4">
                  Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
                </p>
                
                <form @submit.prevent="handleSubmit">
                  <div class="form-group mb-3">
                    <label for="email" class="form-label">Email</label>
                    <input
                      type="email"
                      id="email"
                      v-model="form.email"
                      class="form-control"
                      :class="{ 'is-invalid': errors.email }"
                      required
                    />
                    <div v-if="errors.email" class="invalid-feedback">
                      {{ errors.email }}
                    </div>
                  </div>
                  
                  <div v-if="authStore.error" class="alert alert-danger">
                    {{ authStore.error }}
                  </div>
                  
                  <button 
                    type="submit" 
                    class="btn btn-primary w-100"
                    :disabled="authStore.loading"
                  >
                    <span v-if="authStore.loading" class="spinner-border spinner-border-sm me-2"></span>
                    Envoyer le lien
                  </button>
                </form>
              </div>
              
              <div v-else class="text-center">
                <div class="success-icon mb-3">📧</div>
                <h4 class="text-success">Email envoyé !</h4>
                <p>Nous avons envoyé un lien de réinitialisation à <strong>{{ form.email }}</strong></p>
                <p class="text-muted">Vérifiez votre boîte de réception et suivez les instructions.</p>
                
                <div class="mt-4">
                  <button @click="resetForm" class="btn btn-outline-primary me-2">
                    Réessayer
                  </button>
                  <router-link to="/login" class="btn btn-primary">
                    Retour à la connexion
                  </router-link>
                </div>
              </div>
              
              <hr class="my-4">
              
              <div class="text-center">
                <p class="mb-0">Vous vous souvenez de votre mot de passe ?</p>
                <router-link to="/login" class="btn btn-outline-primary">
                  Se connecter
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { z } from 'zod'

const authStore = useAuthStore()

const form = reactive({
  email: ''
})

const errors = ref({})
const emailSent = ref(false)

// Schéma de validation
const forgotPasswordSchema = z.object({
  email: z.string().email('Email invalide')
})

const validateForm = () => {
  try {
    forgotPasswordSchema.parse(form)
    errors.value = {}
    return true
  } catch (error) {
    const newErrors = {}
    error.errors.forEach(err => {
      newErrors[err.path[0]] = err.message
    })
    errors.value = newErrors
    return false
  }
}

const handleSubmit = async () => {
  if (!validateForm()) return
  
  authStore.clearError()
  
  const result = await authStore.forgotPassword(form.email)
  
  if (result.success) {
    emailSent.value = true
  }
}

const resetForm = () => {
  emailSent.value = false
  form.email = ''
  authStore.clearError()
  errors.value = {}
}

onMounted(() => {
  authStore.clearError()
})
</script>

<style scoped>
.forgot-password-page {
  min-height: calc(100vh - 200px);
  display: flex;
  align-items: center;
  padding: 2rem 0;
}

.card {
  border: none;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
}

.card-title {
  color: var(--primary-color);
  font-weight: 600;
}

.success-icon {
  font-size: 3rem;
}

.w-100 {
  width: 100%;
}

.spinner-border-sm {
  width: 1rem;
  height: 1rem;
  border-width: 0.125rem;
}

@keyframes spinner-border {
  to {
    transform: rotate(360deg);
  }
}

.spinner-border {
  display: inline-block;
  width: 1rem;
  height: 1rem;
  border: 0.125rem solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: spinner-border 0.75s linear infinite;
}
</style>
