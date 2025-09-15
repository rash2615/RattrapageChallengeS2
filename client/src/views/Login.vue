<template>
  <div class="login-page">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-md-6 col-lg-4">
          <div class="card">
            <div class="card-body">
              <h2 class="card-title text-center mb-4">Connexion</h2>
              
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
                
                <div class="form-group mb-3">
                  <label for="password" class="form-label">Mot de passe</label>
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
                  Se connecter
                </button>
              </form>
              
              <div class="text-center mt-3">
                <router-link to="/forgot-password" class="text-decoration-none">
                  Mot de passe oublié ?
                </router-link>
              </div>
              
              <hr class="my-4">
              
              <div class="text-center">
                <p class="mb-0">Pas encore de compte ?</p>
                <router-link to="/register" class="btn btn-outline-primary">
                  Créer un compte
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
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { z } from 'zod'

const router = useRouter()
const authStore = useAuthStore()

const form = reactive({
  email: '',
  password: ''
})

const errors = ref({})

// Schéma de validation
const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis')
})

const validateForm = () => {
  try {
    loginSchema.parse(form)
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
  
  const result = await authStore.login(form)
  
  if (result.success) {
    // Redirection gérée par le store
  } else {
    // L'erreur est déjà gérée par le store
  }
}

onMounted(() => {
  // Effacer les erreurs au montage
  authStore.clearError()
})
</script>

<style scoped>
.login-page {
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

.w-100 {
  width: 100%;
}

.text-decoration-none {
  text-decoration: none;
  color: var(--primary-color);
}

.text-decoration-none:hover {
  text-decoration: underline;
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
