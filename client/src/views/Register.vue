<template>
  <div class="register-page">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-md-6 col-lg-5">
          <div class="card">
            <div class="card-body">
              <h2 class="card-title text-center mb-4">Inscription</h2>
              
              <form @submit.prevent="handleSubmit">
                <div class="row">
                  <div class="col-md-6">
                    <div class="form-group mb-3">
                      <label for="firstName" class="form-label">Prénom</label>
                      <input
                        type="text"
                        id="firstName"
                        v-model="form.firstName"
                        class="form-control"
                        :class="{ 'is-invalid': errors.firstName }"
                        required
                      />
                      <div v-if="errors.firstName" class="invalid-feedback">
                        {{ errors.firstName }}
                      </div>
                    </div>
                  </div>
                  
                  <div class="col-md-6">
                    <div class="form-group mb-3">
                      <label for="lastName" class="form-label">Nom</label>
                      <input
                        type="text"
                        id="lastName"
                        v-model="form.lastName"
                        class="form-control"
                        :class="{ 'is-invalid': errors.lastName }"
                        required
                      />
                      <div v-if="errors.lastName" class="invalid-feedback">
                        {{ errors.lastName }}
                      </div>
                    </div>
                  </div>
                </div>
                
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
                
                <div class="form-group mb-3">
                  <div class="form-check">
                    <input
                      type="checkbox"
                      id="acceptTerms"
                      v-model="form.acceptTerms"
                      class="form-check-input"
                      :class="{ 'is-invalid': errors.acceptTerms }"
                      required
                    />
                    <label for="acceptTerms" class="form-check-label">
                      J'accepte les 
                      <a href="#" @click.prevent="showTerms">conditions d'utilisation</a>
                      et la 
                      <a href="#" @click.prevent="showPrivacy">politique de confidentialité</a>
                    </label>
                    <div v-if="errors.acceptTerms" class="invalid-feedback">
                      {{ errors.acceptTerms }}
                    </div>
                  </div>
                </div>
                
                <div v-if="authStore.error" class="alert alert-danger">
                  {{ authStore.error }}
                </div>
                
                <div v-if="successMessage" class="alert alert-success">
                  {{ successMessage }}
                </div>
                
                <button 
                  type="submit" 
                  class="btn btn-primary w-100"
                  :disabled="authStore.loading"
                >
                  <span v-if="authStore.loading" class="spinner-border spinner-border-sm me-2"></span>
                  Créer mon compte
                </button>
              </form>
              
              <hr class="my-4">
              
              <div class="text-center">
                <p class="mb-0">Déjà un compte ?</p>
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
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  acceptTerms: false
})

const errors = ref({})
const successMessage = ref('')

// Schéma de validation
const registerSchema = z.object({
  firstName: z.string().min(1, 'Prénom requis'),
  lastName: z.string().min(1, 'Nom requis'),
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  confirmPassword: z.string(),
  acceptTerms: z.boolean().refine(val => val === true, 'Vous devez accepter les conditions')
}).refine(data => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword']
})

const validateForm = () => {
  try {
    registerSchema.parse(form)
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
  successMessage.value = ''
  
  const result = await authStore.register({
    firstName: form.firstName,
    lastName: form.lastName,
    email: form.email,
    password: form.password
  })
  
  if (result.success) {
    successMessage.value = 'Inscription réussie ! Vérifiez votre email pour activer votre compte.'
    // Réinitialiser le formulaire
    Object.keys(form).forEach(key => {
      if (typeof form[key] === 'boolean') {
        form[key] = false
      } else {
        form[key] = ''
      }
    })
  }
}

const showTerms = () => {
  // TODO: Implémenter l'affichage des CGV
  alert('Conditions d\'utilisation à implémenter')
}

const showPrivacy = () => {
  // TODO: Implémenter l'affichage de la politique de confidentialité
  alert('Politique de confidentialité à implémenter')
}

onMounted(() => {
  authStore.clearError()
})
</script>

<style scoped>
.register-page {
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

.form-check-input:checked {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
}

.form-check-label a {
  color: var(--primary-color);
  text-decoration: none;
}

.form-check-label a:hover {
  text-decoration: underline;
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
