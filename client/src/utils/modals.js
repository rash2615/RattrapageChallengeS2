/**
 * Utilitaires pour créer des modales sans librairies externes
 * Remplace SweetAlert2 pour les alertes et confirmations
 */

/**
 * Classe pour gérer les modales
 */
export class ModalManager {
  constructor() {
    this.modals = new Map()
    this.zIndex = 1000
  }
  
  /**
   * Crée une nouvelle modale
   * @param {string} id - ID unique de la modale
   * @param {Object} options - Options de la modale
   * @returns {HTMLElement} - Élément de la modale
   */
  create(id, options = {}) {
    const modal = document.createElement('div')
    modal.id = id
    modal.className = 'modal'
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      display: none;
      justify-content: center;
      align-items: center;
      z-index: ${this.zIndex++};
    `
    
    const modalContent = document.createElement('div')
    modalContent.className = 'modal-content'
    modalContent.style.cssText = `
      background: white;
      border-radius: 8px;
      padding: 0;
      max-width: 500px;
      width: 90%;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
      transform: scale(0.9);
      transition: transform 0.2s ease;
    `
    
    modal.appendChild(modalContent)
    document.body.appendChild(modal)
    
    this.modals.set(id, {
      element: modal,
      content: modalContent,
      options
    })
    
    return modal
  }
  
  /**
   * Affiche une modale
   * @param {string} id - ID de la modale
   */
  show(id) {
    const modal = this.modals.get(id)
    if (modal) {
      modal.element.style.display = 'flex'
      setTimeout(() => {
        modal.content.style.transform = 'scale(1)'
      }, 10)
    }
  }
  
  /**
   * Cache une modale
   * @param {string} id - ID de la modale
   */
  hide(id) {
    const modal = this.modals.get(id)
    if (modal) {
      modal.content.style.transform = 'scale(0.9)'
      setTimeout(() => {
        modal.element.style.display = 'none'
      }, 200)
    }
  }
  
  /**
   * Supprime une modale
   * @param {string} id - ID de la modale
   */
  remove(id) {
    const modal = this.modals.get(id)
    if (modal) {
      document.body.removeChild(modal.element)
      this.modals.delete(id)
    }
  }
}

// Instance globale du gestionnaire de modales
export const modalManager = new ModalManager()

/**
 * Affiche une alerte simple
 * @param {string} message - Message à afficher
 * @param {string} title - Titre de l'alerte
 * @param {string} type - Type d'alerte (success, error, warning, info)
 */
export function alert(message, title = 'Information', type = 'info') {
  const id = `alert-${Date.now()}`
  const modal = modalManager.create(id)
  
  const colors = {
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6'
  }
  
  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  }
  
  modal.querySelector('.modal-content').innerHTML = `
    <div style="padding: 24px;">
      <div style="display: flex; align-items: center; margin-bottom: 16px;">
        <div style="
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background-color: ${colors[type]}20;
          color: ${colors[type]};
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          margin-right: 12px;
        ">
          ${icons[type]}
        </div>
        <h3 style="margin: 0; color: #1f2937; font-size: 18px;">${title}</h3>
      </div>
      <p style="margin: 0 0 24px 0; color: #6b7280; line-height: 1.5;">${message}</p>
      <div style="text-align: right;">
        <button class="modal-btn modal-btn-primary" style="
          background-color: ${colors[type]};
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
        ">
          OK
        </button>
      </div>
    </div>
  `
  
  // Gérer le clic sur OK
  modal.querySelector('.modal-btn').addEventListener('click', () => {
    modalManager.hide(id)
    setTimeout(() => modalManager.remove(id), 300)
  })
  
  // Gérer le clic en dehors de la modale
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modalManager.hide(id)
      setTimeout(() => modalManager.remove(id), 300)
    }
  })
  
  modalManager.show(id)
}

/**
 * Affiche une confirmation
 * @param {string} message - Message de confirmation
 * @param {string} title - Titre de la confirmation
 * @returns {Promise<boolean>} - Résultat de la confirmation
 */
export function confirm(message, title = 'Confirmation') {
  return new Promise((resolve) => {
    const id = `confirm-${Date.now()}`
    const modal = modalManager.create(id)
    
    modal.querySelector('.modal-content').innerHTML = `
      <div style="padding: 24px;">
        <div style="display: flex; align-items: center; margin-bottom: 16px;">
          <div style="
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background-color: #f59e0b20;
            color: #f59e0b;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            margin-right: 12px;
          ">
            ⚠
          </div>
          <h3 style="margin: 0; color: #1f2937; font-size: 18px;">${title}</h3>
        </div>
        <p style="margin: 0 0 24px 0; color: #6b7280; line-height: 1.5;">${message}</p>
        <div style="text-align: right; display: flex; gap: 8px; justify-content: flex-end;">
          <button class="modal-btn modal-btn-cancel" style="
            background-color: #f3f4f6;
            color: #374151;
            border: 1px solid #d1d5db;
            padding: 8px 16px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
          ">
            Annuler
          </button>
          <button class="modal-btn modal-btn-confirm" style="
            background-color: #ef4444;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
          ">
            Confirmer
          </button>
        </div>
      </div>
    `
    
    // Gérer les clics sur les boutons
    modal.querySelector('.modal-btn-cancel').addEventListener('click', () => {
      modalManager.hide(id)
      setTimeout(() => modalManager.remove(id), 300)
      resolve(false)
    })
    
    modal.querySelector('.modal-btn-confirm').addEventListener('click', () => {
      modalManager.hide(id)
      setTimeout(() => modalManager.remove(id), 300)
      resolve(true)
    })
    
    // Gérer le clic en dehors de la modale
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modalManager.hide(id)
        setTimeout(() => modalManager.remove(id), 300)
        resolve(false)
      }
    })
    
    modalManager.show(id)
  })
}

/**
 * Affiche un prompt
 * @param {string} message - Message du prompt
 * @param {string} title - Titre du prompt
 * @param {string} defaultValue - Valeur par défaut
 * @returns {Promise<string|null>} - Valeur saisie ou null si annulé
 */
export function prompt(message, title = 'Saisie', defaultValue = '') {
  return new Promise((resolve) => {
    const id = `prompt-${Date.now()}`
    const modal = modalManager.create(id)
    
    modal.querySelector('.modal-content').innerHTML = `
      <div style="padding: 24px;">
        <div style="display: flex; align-items: center; margin-bottom: 16px;">
          <div style="
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background-color: #3b82f620;
            color: #3b82f6;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            margin-right: 12px;
          ">
            ℹ
          </div>
          <h3 style="margin: 0; color: #1f2937; font-size: 18px;">${title}</h3>
        </div>
        <p style="margin: 0 0 16px 0; color: #6b7280; line-height: 1.5;">${message}</p>
        <input type="text" class="modal-input" value="${defaultValue}" style="
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
          margin-bottom: 24px;
          box-sizing: border-box;
        ">
        <div style="text-align: right; display: flex; gap: 8px; justify-content: flex-end;">
          <button class="modal-btn modal-btn-cancel" style="
            background-color: #f3f4f6;
            color: #374151;
            border: 1px solid #d1d5db;
            padding: 8px 16px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
          ">
            Annuler
          </button>
          <button class="modal-btn modal-btn-confirm" style="
            background-color: #3b82f6;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
          ">
            OK
          </button>
        </div>
      </div>
    `
    
    const input = modal.querySelector('.modal-input')
    input.focus()
    input.select()
    
    // Gérer les clics sur les boutons
    modal.querySelector('.modal-btn-cancel').addEventListener('click', () => {
      modalManager.hide(id)
      setTimeout(() => modalManager.remove(id), 300)
      resolve(null)
    })
    
    modal.querySelector('.modal-btn-confirm').addEventListener('click', () => {
      const value = input.value.trim()
      modalManager.hide(id)
      setTimeout(() => modalManager.remove(id), 300)
      resolve(value)
    })
    
    // Gérer la touche Entrée
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const value = input.value.trim()
        modalManager.hide(id)
        setTimeout(() => modalManager.remove(id), 300)
        resolve(value)
      }
    })
    
    // Gérer le clic en dehors de la modale
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modalManager.hide(id)
        setTimeout(() => modalManager.remove(id), 300)
        resolve(null)
      }
    })
    
    modalManager.show(id)
  })
}

/**
 * Affiche un toast (notification temporaire)
 * @param {string} message - Message du toast
 * @param {string} type - Type du toast (success, error, warning, info)
 * @param {number} duration - Durée d'affichage en ms
 */
export function toast(message, type = 'info', duration = 3000) {
  const toast = document.createElement('div')
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: white;
    border-left: 4px solid ${getToastColor(type)};
    padding: 16px 20px;
    border-radius: 6px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 9999;
    max-width: 400px;
    transform: translateX(100%);
    transition: transform 0.3s ease;
  `
  
  toast.innerHTML = `
    <div style="display: flex; align-items: center;">
      <span style="margin-right: 8px; font-size: 16px;">${getToastIcon(type)}</span>
      <span style="color: #374151; font-size: 14px;">${message}</span>
    </div>
  `
  
  document.body.appendChild(toast)
  
  // Animation d'entrée
  setTimeout(() => {
    toast.style.transform = 'translateX(0)'
  }, 10)
  
  // Suppression automatique
  setTimeout(() => {
    toast.style.transform = 'translateX(100%)'
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast)
      }
    }, 300)
  }, duration)
}

function getToastColor(type) {
  const colors = {
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6'
  }
  return colors[type] || colors.info
}

function getToastIcon(type) {
  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  }
  return icons[type] || icons.info
}
