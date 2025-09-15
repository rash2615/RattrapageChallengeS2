<template>
  <div class="reset-password-page">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-md-6 col-lg-4">
          <div class="card">
            <div class="card-body">
              <h2 class="card-title text-center mb-4">Nouveau mot de passe</h2>
              
              <div v-if="!success">
                <p class="text-muted text-center mb-4">
                  Entrez votre nouveau mot de passe ci-dessous.
                </p>
                
                <form @submit.prevent="handleSubmit">
                  <div class="form-group mb-3">
                    <label for="password" class="form-label">Nouveau mot de passe</label>
                    <input
                      type="password"
                      id="password"
                      v-model="form.password"
                      class="form-control"
                      :class="{ 'is-invalid': errors.password }"
                      required
                    />
                    <div v-if="errors.password" class="invalid-feedback">
                      {{ errors.password }}
                    </div>
                    <small class="form-text text-muted">
                      Le mot de passe doit contenir au moins 8 caractères
                    </small>
                  </div>
                  
                  <div class="form-group mb-3">
                    <label for="confirmPassword" class="form-label">Confirmer le mot de passe</label>
                    <input
                      type="password"
                      id="confirmPassword"
                      v-model="form.confirmPassword"
                      class="form-control"
                      :class="{ 'is-invalid': errors.confirmPassword }"
                      required
                    />
                    <div v-if="errors.confirmPassword" class="invalid-feedback">
                      {{ errors.confirmPassword }}
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
                    Réinitialiser le mot de passe
                  </button>
                </form>
              </div>
              
              <div v-else class="text-center">
                <div class="success-icon mb-3">✅</div>
                <h4 class="text-success">Mot de passe réinitialisé !</h4>
                <p>Votre mot de passe a été mis à jour avec succès.</p>
                <router-link to="/login" class="btn btn-primary">
                  Se connecter
                </router-link>
              </div>
              
              <hr class="my-4">
              
              <div class="text-center">
                <router-link to="/login" class="btn btn-outline-primary">
                  Retour à la connexion
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

const props = defineProps({
  token: {
    type: String,
    required: true
  }
})

const authStore = useAuthStore()

const form = reactive({
  password: '',
  confirmPassword: ''
})

const errors = ref({})
const success = ref(false)

// Schéma de validation
const resetPasswordSchema = z.object({
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword']
})

const validateForm = () => {
  try {
    resetPasswordSchema.parse(form)
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
  
  const result = await authStore.resetPassword(props.token, form.password)
  
  if (result.success) {
    success.value = true
  }
}

onMounted(() => {
  authStore.clearError()
})
</script>

<style scoped>
.reset-password-page {
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

.form-text {
  font-size: 0.875rem;
  color: #6c757d;
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
