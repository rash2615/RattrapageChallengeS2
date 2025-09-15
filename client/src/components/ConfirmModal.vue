<template>
  <div v-if="show" class="modal" @click.self="cancel">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">{{ title }}</h5>
          <button type="button" class="btn-close" @click="cancel">
            ×
          </button>
        </div>
        
        <div class="modal-body">
          <p>{{ message }}</p>
          
          <div v-if="loading" class="text-center">
            <div class="spinner-border" role="status">
              <span class="visually-hidden">Chargement...</span>
            </div>
            <p class="mt-2">Traitement en cours...</p>
          </div>
          
          <div v-if="error" class="alert alert-danger">
            {{ error }}
          </div>
        </div>
        
        <div class="modal-footer">
          <button 
            type="button" 
            class="btn btn-secondary" 
            @click="cancel"
            :disabled="loading"
          >
            Annuler
          </button>
          <button 
            type="button" 
            class="btn btn-danger" 
            @click="confirm"
            :disabled="loading"
          >
            <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
            Confirmer
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useConfirmModalStore } from '../stores/confirmModal'

const confirmModal = useConfirmModalStore()

const { show, title, message, loading, error, confirm, cancel } = confirmModal
</script>

<style scoped>
.modal {
  display: block;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #aaa;
}

.btn-close:hover {
  color: #000;
}

.spinner-border {
  display: inline-block;
  width: 2rem;
  height: 2rem;
  border: 0.25rem solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: spinner-border 0.75s linear infinite;
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
