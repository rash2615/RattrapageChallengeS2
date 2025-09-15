<template>
  <div v-if="isVisible" class="modal-overlay" @click="handleOverlayClick">
    <div class="modal" @click.stop>
      <div class="modal-header">
        <h3 class="modal-title">{{ title }}</h3>
        <button class="modal-close" @click="closeModal" aria-label="Fermer">
          <span class="close-icon">×</span>
        </button>
      </div>
      
      <div class="modal-body">
        <div class="modal-icon">
          <span class="icon" :class="iconClass">{{ icon }}</span>
        </div>
        <p class="modal-message">{{ message }}</p>
        <div v-if="details" class="modal-details">
          {{ details }}
        </div>
      </div>
      
      <div class="modal-footer">
        <button 
          class="btn btn-secondary" 
          @click="handleCancel"
          :disabled="isLoading"
        >
          {{ cancelText }}
        </button>
        <button 
          class="btn" 
          :class="confirmButtonClass"
          @click="handleConfirm"
          :disabled="isLoading"
        >
          <span v-if="isLoading" class="spinner"></span>
          <span v-else>{{ confirmText }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

// Props
const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: 'Confirmation'
  },
  message: {
    type: String,
    required: true
  },
  details: {
    type: String,
    default: ''
  },
  confirmText: {
    type: String,
    default: 'Confirmer'
  },
  cancelText: {
    type: String,
    default: 'Annuler'
  },
  type: {
    type: String,
    default: 'warning', // warning, danger, info, success
    validator: (value) => ['warning', 'danger', 'info', 'success'].includes(value)
  },
  isLoading: {
    type: Boolean,
    default: false
  },
  closeOnOverlay: {
    type: Boolean,
    default: true
  }
})

// Emits
const emit = defineEmits(['confirm', 'cancel', 'close'])

// État local
const isVisible = ref(props.isVisible)

// Computed
const iconClass = computed(() => `icon-${props.type}`)

const icon = computed(() => {
  switch (props.type) {
    case 'danger':
      return '⚠️'
    case 'warning':
      return '⚠️'
    case 'info':
      return 'ℹ️'
    case 'success':
      return '✅'
    default:
      return '❓'
  }
})

const confirmButtonClass = computed(() => {
  switch (props.type) {
    case 'danger':
      return 'btn-danger'
    case 'warning':
      return 'btn-warning'
    case 'info':
      return 'btn-primary'
    case 'success':
      return 'btn-success'
    default:
      return 'btn-primary'
  }
})

// Watchers
watch(() => props.isVisible, (newValue) => {
  isVisible.value = newValue
  if (newValue) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

// Fonctions
const closeModal = () => {
  isVisible.value = false
  document.body.style.overflow = ''
  emit('close')
}

const handleOverlayClick = () => {
  if (props.closeOnOverlay) {
    closeModal()
  }
}

const handleCancel = () => {
  emit('cancel')
  closeModal()
}

const handleConfirm = () => {
  emit('confirm')
  // Ne pas fermer automatiquement, laisser le composant parent gérer
}

// Gestion des touches
const handleKeydown = (event) => {
  if (!isVisible.value) return
  
  if (event.key === 'Escape') {
    closeModal()
  } else if (event.key === 'Enter' && !props.isLoading) {
    handleConfirm()
  }
}

// Lifecycle
onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = ''
})
</script>

<style scoped>
/* Overlay */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-modal);
  padding: var(--spacing-4);
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Modal */
.modal {
  background-color: var(--white);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-xl);
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Header */
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-6) var(--spacing-6) var(--spacing-4);
  border-bottom: 1px solid var(--gray-200);
}

.modal-title {
  font-size: var(--font-size-xl);
  font-weight: 600;
  color: var(--gray-900);
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  font-size: var(--font-size-2xl);
  color: var(--gray-400);
  cursor: pointer;
  padding: var(--spacing-1);
  border-radius: var(--border-radius);
  transition: all var(--transition-fast);
  line-height: 1;
}

.modal-close:hover {
  color: var(--gray-600);
  background-color: var(--gray-100);
}

.close-icon {
  display: block;
  width: 20px;
  height: 20px;
  line-height: 1;
}

/* Body */
.modal-body {
  padding: var(--spacing-6);
  text-align: center;
}

.modal-icon {
  margin-bottom: var(--spacing-4);
}

.icon {
  display: inline-block;
  font-size: var(--font-size-4xl);
  line-height: 1;
}

.icon-warning {
  color: var(--warning-color);
}

.icon-danger {
  color: var(--error-color);
}

.icon-info {
  color: var(--info-color);
}

.icon-success {
  color: var(--success-color);
}

.modal-message {
  font-size: var(--font-size-lg);
  color: var(--gray-700);
  margin: 0 0 var(--spacing-4);
  line-height: 1.5;
}

.modal-details {
  font-size: var(--font-size-sm);
  color: var(--gray-500);
  background-color: var(--gray-50);
  padding: var(--spacing-3);
  border-radius: var(--border-radius);
  border-left: 4px solid var(--gray-300);
}

/* Footer */
.modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--spacing-3);
  padding: var(--spacing-4) var(--spacing-6) var(--spacing-6);
  border-top: 1px solid var(--gray-200);
  background-color: var(--gray-50);
}

/* Boutons */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-2);
  padding: var(--spacing-3) var(--spacing-6);
  font-size: var(--font-size-sm);
  font-weight: 500;
  line-height: 1.5;
  border: 1px solid transparent;
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: all var(--transition-fast);
  text-decoration: none;
  white-space: nowrap;
  user-select: none;
  min-width: 100px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: var(--gray-100);
  border-color: var(--gray-300);
  color: var(--gray-700);
}

.btn-secondary:hover:not(:disabled) {
  background-color: var(--gray-200);
  border-color: var(--gray-400);
}

.btn-primary {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
  color: var(--white);
}

.btn-primary:hover:not(:disabled) {
  background-color: var(--primary-dark);
  border-color: var(--primary-dark);
}

.btn-danger {
  background-color: var(--error-color);
  border-color: var(--error-color);
  color: var(--white);
}

.btn-danger:hover:not(:disabled) {
  background-color: #dc2626;
  border-color: #dc2626;
}

.btn-warning {
  background-color: var(--warning-color);
  border-color: var(--warning-color);
  color: var(--white);
}

.btn-warning:hover:not(:disabled) {
  background-color: #d97706;
  border-color: #d97706;
}

.btn-success {
  background-color: var(--success-color);
  border-color: var(--success-color);
  color: var(--white);
}

.btn-success:hover:not(:disabled) {
  background-color: #059669;
  border-color: #059669;
}

/* Spinner */
.spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-radius: 50%;
  border-top-color: currentColor;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Responsive */
@media (max-width: 480px) {
  .modal {
    margin: var(--spacing-2);
    max-width: none;
  }
  
  .modal-header {
    padding: var(--spacing-4) var(--spacing-4) var(--spacing-3);
  }
  
  .modal-body {
    padding: var(--spacing-4);
  }
  
  .modal-footer {
    padding: var(--spacing-3) var(--spacing-4) var(--spacing-4);
    flex-direction: column-reverse;
  }
  
  .btn {
    width: 100%;
    justify-content: center;
  }
  
  .modal-title {
    font-size: var(--font-size-lg);
  }
  
  .modal-message {
    font-size: var(--font-size-base);
  }
}

/* Animations d'entrée/sortie */
.modal-overlay.leaving {
  animation: fadeOut 0.3s ease-in;
}

.modal.leaving {
  animation: slideOut 0.3s ease-in;
}

@keyframes fadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

@keyframes slideOut {
  from {
    transform: translateY(0);
    opacity: 1;
  }
  to {
    transform: translateY(-20px);
    opacity: 0;
  }
}
</style>
