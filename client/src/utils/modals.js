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
  confirmDelete
}