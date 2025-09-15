/**
 * Utilitaires pour les modales
 * Remplacement de SweetAlert2 avec des modales natives
 */

/**
 * Classe de gestion des modales
 */
export class ModalManager {
  constructor() {
    this.modals = new Map()
    this.activeModal = null
    this.zIndex = 1000
  }

  register(id, modal) {
    this.modals.set(id, modal)
  }

  unregister(id) {
    this.modals.delete(id)
  }

  get(id) {
    return this.modals.get(id) || null
  }

  open(id, options = {}) {
    const modal = this.get(id)
    if (modal) {
      this.activeModal = id
      modal.open(options)
    }
  }

  close(id) {
    const modal = this.get(id)
    if (modal) {
      modal.close()
      if (this.activeModal === id) {
        this.activeModal = null
      }
    }
  }

  closeAll() {
    this.modals.forEach(modal => modal.close())
    this.activeModal = null
  }

  getNextZIndex() {
    return ++this.zIndex
  }
}

// Instance globale du gestionnaire de modales
export const modalManager = new ModalManager()

/**
 * Modale d'alerte simple
 * @param {string} message - Message à afficher
 * @param {Object} options - Options de la modale
 * @returns {Promise} Promise qui se résout quand la modale est fermée
 */
export const alert = (message, options = {}) => {
  return new Promise((resolve) => {
    const modal = document.createElement('div')
    modal.className = 'modal-overlay'
    modal.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">${options.title || 'Information'}</h3>
          <button class="modal-close" aria-label="Fermer">×</button>
        </div>
        <div class="modal-body">
          <div class="modal-icon">
            <span class="icon icon-${options.type || 'info'}">${getIcon(options.type)}</span>
          </div>
          <p class="modal-message">${message}</p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-primary modal-confirm">${options.confirmText || 'OK'}</button>
        </div>
      </div>
    `

    // Afficher la modale
    document.body.appendChild(modal)
    document.body.style.overflow = 'hidden'

    // Animation d'entrée
    requestAnimationFrame(() => {
      modal.classList.add('show')
    })

    // Événements
    const closeModal = () => {
      modal.classList.add('leaving')
      setTimeout(() => {
        if (modal.parentNode) {
          modal.parentNode.removeChild(modal)
        }
        document.body.style.overflow = ''
        resolve()
      }, 300)
    }

    modal.querySelector('.modal-close').addEventListener('click', closeModal)
    modal.querySelector('.modal-confirm').addEventListener('click', closeModal)
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal()
      }
    })

    // Focus
    modal.querySelector('.modal-confirm').focus()
  })
}

/**
 * Modale de confirmation
 * @param {string} message - Message à afficher
 * @param {Object} options - Options de la modale
 * @returns {Promise<boolean>} Promise qui se résout avec true si confirmé, false sinon
 */
export const confirm = (message, options = {}) => {
  return new Promise((resolve) => {
    const modal = document.createElement('div')
    modal.className = 'modal-overlay'
    modal.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">${options.title || 'Confirmation'}</h3>
          <button class="modal-close" aria-label="Fermer">×</button>
        </div>
        <div class="modal-body">
          <div class="modal-icon">
            <span class="icon icon-${options.type || 'warning'}">${getIcon(options.type)}</span>
          </div>
          <p class="modal-message">${message}</p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary modal-cancel">${options.cancelText || 'Annuler'}</button>
          <button class="btn ${options.confirmButtonClass || 'btn-danger'} modal-confirm">${options.confirmText || 'Confirmer'}</button>
        </div>
      </div>
    `

    // Afficher la modale
    document.body.appendChild(modal)
    document.body.style.overflow = 'hidden'

    // Animation d'entrée
    requestAnimationFrame(() => {
      modal.classList.add('show')
    })

    // Événements
    const closeModal = (result) => {
      modal.classList.add('leaving')
      setTimeout(() => {
        if (modal.parentNode) {
          modal.parentNode.removeChild(modal)
        }
        document.body.style.overflow = ''
        resolve(result)
      }, 300)
    }

    modal.querySelector('.modal-close').addEventListener('click', () => closeModal(false))
    modal.querySelector('.modal-cancel').addEventListener('click', () => closeModal(false))
    modal.querySelector('.modal-confirm').addEventListener('click', () => closeModal(true))
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal(false)
      }
    })

    // Focus
    modal.querySelector('.modal-confirm').focus()
  })
}

/**
 * Modale de succès
 * @param {string} message - Message à afficher
 * @param {Object} options - Options de la modale
 * @returns {Promise} Promise qui se résout quand la modale est fermée
 */
export const success = (message, options = {}) => {
  return alert(message, { ...options, type: 'success', title: 'Succès' })
}

/**
 * Modale d'erreur
 * @param {string} message - Message à afficher
 * @param {Object} options - Options de la modale
 * @returns {Promise} Promise qui se résout quand la modale est fermée
 */
export const error = (message, options = {}) => {
  return alert(message, { ...options, type: 'error', title: 'Erreur' })
}

/**
 * Modale d'information
 * @param {string} message - Message à afficher
 * @param {Object} options - Options de la modale
 * @returns {Promise} Promise qui se résout quand la modale est fermée
 */
export const info = (message, options = {}) => {
  return alert(message, { ...options, type: 'info', title: 'Information' })
}

/**
 * Modale de confirmation de suppression
 * @param {string} itemName - Nom de l'élément à supprimer
 * @param {Object} options - Options de la modale
 * @returns {Promise<boolean>} Promise qui se résout avec true si confirmé, false sinon
 */
export const confirmDelete = (itemName, options = {}) => {
  return confirm(
    `Êtes-vous sûr de vouloir supprimer "${itemName}" ? Cette action est irréversible.`,
    {
      title: 'Confirmer la suppression',
      confirmText: 'Supprimer',
      cancelText: 'Annuler',
      confirmButtonClass: 'btn-danger',
      ...options
    }
  )
}

/**
 * Afficher une notification toast
 * @param {string} message - Message à afficher
 * @param {string} type - Type de notification (success, error, warning, info)
 * @param {Object} options - Options de la notification
 */
export const showToast = (message, type = 'info', options = {}) => {
  // Créer l'élément toast
  const toast = document.createElement('div')
  toast.className = `toast toast-${type}`
  toast.innerHTML = `
    <div class="toast-content">
      <span class="toast-icon">${getIcon(type)}</span>
      <span class="toast-message">${message}</span>
      <button class="toast-close" onclick="this.parentElement.parentElement.remove()">×</button>
    </div>
  `

  // Ajouter les styles si pas déjà présents
  if (!document.querySelector('#toast-styles')) {
    const style = document.createElement('style')
    style.id = 'toast-styles'
    style.textContent = `
      .toast {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        min-width: 300px;
        max-width: 500px;
        padding: 16px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        transform: translateX(100%);
        transition: transform 0.3s ease-in-out;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      
      .toast.show {
        transform: translateX(0);
      }
      
      .toast-success {
        background-color: #10b981;
        color: white;
      }
      
      .toast-error {
        background-color: #ef4444;
        color: white;
      }
      
      .toast-warning {
        background-color: #f59e0b;
        color: white;
      }
      
      .toast-info {
        background-color: #3b82f6;
        color: white;
      }
      
      .toast-content {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      
      .toast-icon {
        font-size: 18px;
        flex-shrink: 0;
      }
      
      .toast-message {
        flex: 1;
        font-size: 14px;
        line-height: 1.4;
      }
      
      .toast-close {
        background: none;
        border: none;
        color: inherit;
        font-size: 20px;
        cursor: pointer;
        padding: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        transition: background-color 0.2s;
      }
      
      .toast-close:hover {
        background-color: rgba(255, 255, 255, 0.2);
      }
    `
    document.head.appendChild(style)
  }

  // Ajouter au DOM
  document.body.appendChild(toast)

  // Afficher avec animation
  setTimeout(() => {
    toast.classList.add('show')
  }, 100)

  // Auto-suppression après 5 secondes
  const duration = options.duration || 5000
  setTimeout(() => {
    toast.classList.remove('show')
    setTimeout(() => {
      if (toast.parentElement) {
        toast.remove()
      }
    }, 300)
  }, duration)

  return toast
}

/**
 * Obtenir l'icône selon le type
 * @param {string} type - Type de modale
 * @returns {string} Icône
 */
function getIcon(type) {
  const icons = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌'
  }
  return icons[type] || icons.info
}

export default {
  ModalManager,
  modalManager,
  alert,
  confirm,
  success,
  error,
  info,
  confirmDelete,
  showToast
}