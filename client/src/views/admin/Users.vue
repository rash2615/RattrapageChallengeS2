<template>
  <div class="admin-users">
    <div class="admin-header">
      <h1 class="page-title">Gestion des utilisateurs</h1>
      <p class="page-subtitle">Administrer les comptes utilisateurs et leurs permissions</p>
    </div>

    <!-- Actions principales -->
    <div class="admin-actions">
      <button class="btn btn-primary" @click="handleAddUser">
        <span class="btn-icon">➕</span>
        Ajouter un utilisateur
      </button>
      <button class="btn btn-outline" @click="handleRefresh">
        <span class="btn-icon">🔄</span>
        Actualiser
      </button>
    </div>

    <!-- Tableau des utilisateurs -->
    <AdvancedTable
      title="Utilisateurs"
      subtitle="Gérez les comptes utilisateurs de la plateforme"
      :data="users"
      :columns="userColumns"
      :actions="userActions"
      :allow-selection="true"
      :allow-delete="true"
      :items-per-page="15"
      row-key="_id"
      @action="handleUserAction"
      @export="handleExportUsers"
      @bulk-delete="handleBulkDeleteUsers"
      @search="handleSearch"
      @sort="handleSort"
    >
      <!-- Colonne avatar -->
      <template #cell-avatar="{ value, row }">
        <div class="user-avatar">
          <img 
            v-if="value" 
            :src="value" 
            :alt="row.firstName"
            class="avatar-image"
          />
          <div v-else class="avatar-placeholder">
            {{ getInitials(row.firstName, row.lastName) }}
          </div>
        </div>
      </template>

      <!-- Colonne nom complet -->
      <template #cell-fullName="{ row }">
        <div class="user-info">
          <h4 class="user-name">{{ row.firstName }} {{ row.lastName }}</h4>
          <p class="user-email">{{ row.email }}</p>
        </div>
      </template>

      <!-- Colonne statut -->
      <template #cell-status="{ value }">
        <span class="status-badge" :class="`status-${value}`">
          {{ getStatusLabel(value) }}
        </span>
      </template>

      <!-- Colonne rôle -->
      <template #cell-role="{ value }">
        <span class="role-badge" :class="`role-${value}`">
          {{ getRoleLabel(value) }}
        </span>
      </template>

      <!-- Colonne dernière connexion -->
      <template #cell-lastLogin="{ value }">
        <span v-if="value" class="last-login">
          {{ formatDate(value) }}
        </span>
        <span v-else class="never-logged">
          Jamais connecté
        </span>
      </template>
    </AdvancedTable>

    <!-- Modal d'ajout/modification d'utilisateur -->
    <div v-if="showUserModal" class="modal-overlay" @click="closeUserModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">
            {{ editingUser ? 'Modifier l\'utilisateur' : 'Ajouter un utilisateur' }}
          </h3>
          <button class="modal-close" @click="closeUserModal">✕</button>
        </div>

        <form @submit.prevent="handleSaveUser" class="modal-form">
          <div class="form-row">
            <div class="form-group">
              <label for="firstName" class="form-label">Prénom *</label>
              <input
                id="firstName"
                v-model="userForm.firstName"
                type="text"
                class="form-input"
                :class="{ 'error': errors.firstName }"
                required
                @blur="validateField('firstName')"
              />
              <div v-if="errors.firstName" class="form-error">{{ errors.firstName }}</div>
            </div>
            <div class="form-group">
              <label for="lastName" class="form-label">Nom *</label>
              <input
                id="lastName"
                v-model="userForm.lastName"
                type="text"
                class="form-input"
                :class="{ 'error': errors.lastName }"
                required
                @blur="validateField('lastName')"
              />
              <div v-if="errors.lastName" class="form-error">{{ errors.lastName }}</div>
            </div>
          </div>

          <div class="form-group">
            <label for="email" class="form-label">Email *</label>
            <input
              id="email"
              v-model="userForm.email"
              type="email"
              class="form-input"
              :class="{ 'error': errors.email }"
              required
              @blur="validateField('email')"
            />
            <div v-if="errors.email" class="form-error">{{ errors.email }}</div>
          </div>

          <div class="form-group">
            <label for="role" class="form-label">Rôle *</label>
            <select
              id="role"
              v-model="userForm.role"
              class="form-select"
              :class="{ 'error': errors.role }"
              required
              @change="validateField('role')"
            >
              <option value="">Sélectionner un rôle</option>
              <option value="user">Utilisateur</option>
              <option value="admin">Administrateur</option>
              <option value="moderator">Modérateur</option>
            </select>
            <div v-if="errors.role" class="form-error">{{ errors.role }}</div>
          </div>

          <div v-if="!editingUser" class="form-group">
            <label for="password" class="form-label">Mot de passe *</label>
            <input
              id="password"
              v-model="userForm.password"
              type="password"
              class="form-input"
              :class="{ 'error': errors.password }"
              :required="!editingUser"
              @blur="validateField('password')"
            />
            <div v-if="errors.password" class="form-error">{{ errors.password }}</div>
          </div>

          <div class="form-group">
            <label class="checkbox-label">
              <input
                v-model="userForm.isActive"
                type="checkbox"
                class="checkbox-input"
              />
              <span class="checkbox-text">Compte actif</span>
            </label>
          </div>

          <div class="form-group">
            <label class="checkbox-label">
              <input
                v-model="userForm.emailVerified"
                type="checkbox"
                class="checkbox-input"
              />
              <span class="checkbox-text">Email vérifié</span>
            </label>
          </div>

          <div class="modal-actions">
            <button type="button" class="btn btn-outline" @click="closeUserModal">
              Annuler
            </button>
            <button type="submit" class="btn btn-primary" :disabled="isSaving">
              <span v-if="isSaving" class="spinner"></span>
              <span v-else>{{ editingUser ? 'Modifier' : 'Créer' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal de confirmation de suppression -->
    <ConfirmModal
      v-if="showDeleteModal"
      :title="'Supprimer l\'utilisateur'"
      :message="`Êtes-vous sûr de vouloir supprimer l'utilisateur ${userToDelete?.firstName} ${userToDelete?.lastName} ?`"
      :confirm-text="'Supprimer'"
      :cancel-text="'Annuler'"
      @confirm="confirmDeleteUser"
      @cancel="cancelDeleteUser"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import AdvancedTable from '../../components/AdvancedTable.vue'
import ConfirmModal from '../../components/ConfirmModal.vue'
import { createValidator, schemas } from '../../utils/validation'

// Router et stores
const router = useRouter()
const authStore = useAuthStore()

// État local
const users = ref([])
const isLoading = ref(false)
const showUserModal = ref(false)
const showDeleteModal = ref(false)
const editingUser = ref(null)
const userToDelete = ref(null)
const isSaving = ref(false)

// Formulaire utilisateur
const userForm = reactive({
  firstName: '',
  lastName: '',
  email: '',
  role: '',
  password: '',
  isActive: true,
  emailVerified: false
})

// Validation
const validator = createValidator(schemas.user)
const errors = reactive({})

// Colonnes du tableau
const userColumns = [
  {
    key: 'avatar',
    title: 'Avatar',
    sortable: false,
    searchable: false,
    className: 'avatar-column'
  },
  {
    key: 'fullName',
    title: 'Nom complet',
    sortable: true,
    searchable: true,
    className: 'name-column'
  },
  {
    key: 'email',
    title: 'Email',
    sortable: true,
    searchable: true,
    className: 'email-column'
  },
  {
    key: 'role',
    title: 'Rôle',
    sortable: true,
    searchable: true,
    className: 'role-column'
  },
  {
    key: 'status',
    title: 'Statut',
    sortable: true,
    searchable: true,
    className: 'status-column'
  },
  {
    key: 'lastLogin',
    title: 'Dernière connexion',
    sortable: true,
    searchable: false,
    type: 'date',
    className: 'date-column'
  },
  {
    key: 'createdAt',
    title: 'Créé le',
    sortable: true,
    searchable: false,
    type: 'date',
    className: 'date-column'
  }
]

// Actions du tableau
const userActions = [
  {
    key: 'view',
    label: 'Voir',
    icon: '👁️',
    className: 'action-view',
    showLabel: false
  },
  {
    key: 'edit',
    label: 'Modifier',
    icon: '✏️',
    className: 'action-edit',
    showLabel: false
  },
  {
    key: 'reset-password',
    label: 'Réinitialiser mot de passe',
    icon: '🔑',
    className: 'action-reset',
    showLabel: false
  },
  {
    key: 'delete',
    label: 'Supprimer',
    icon: '🗑️',
    className: 'action-delete',
    showLabel: false
  }
]

// Fonctions
const loadUsers = async () => {
  try {
    isLoading.value = true
    
    // TODO: Remplacer par l'appel API réel
    // const response = await api.get('/admin/users')
    // users.value = response.data.data
    
    // Données de test
    users.value = generateMockUsers()
    
  } catch (error) {
    console.error('Erreur lors du chargement des utilisateurs:', error)
  } finally {
    isLoading.value = false
  }
}

const generateMockUsers = () => {
  const mockUsers = []
  const roles = ['user', 'admin', 'moderator']
  const statuses = ['active', 'inactive', 'pending', 'suspended']
  const firstNames = ['Marie', 'Pierre', 'Sophie', 'Jean', 'Claire', 'Paul', 'Julie', 'Marc']
  const lastNames = ['Dupont', 'Martin', 'Bernard', 'Thomas', 'Petit', 'Robert', 'Richard', 'Durand']
  
  for (let i = 1; i <= 25; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`
    const role = roles[Math.floor(Math.random() * roles.length)]
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    
    mockUsers.push({
      _id: `user_${i}`,
      firstName,
      lastName,
      email,
      role,
      status,
      avatar: Math.random() > 0.5 ? `https://via.placeholder.com/40x40?text=${firstName[0]}` : null,
      lastLogin: Math.random() > 0.3 ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) : null,
      createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
      isActive: status === 'active',
      emailVerified: Math.random() > 0.2
    })
  }
  
  return mockUsers.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

const handleAddUser = () => {
  editingUser.value = null
  resetUserForm()
  showUserModal.value = true
}

const handleRefresh = () => {
  loadUsers()
}

const handleUserAction = ({ action, row }) => {
  switch (action) {
    case 'view':
      handleViewUser(row)
      break
    case 'edit':
      handleEditUser(row)
      break
    case 'reset-password':
      handleResetPassword(row)
      break
    case 'delete':
      handleDeleteUser(row)
      break
  }
}

const handleViewUser = (user) => {
  // TODO: Ouvrir modal de détails utilisateur
  console.log('Voir utilisateur:', user)
}

const handleEditUser = (user) => {
  editingUser.value = user
  userForm.firstName = user.firstName
  userForm.lastName = user.lastName
  userForm.email = user.email
  userForm.role = user.role
  userForm.isActive = user.isActive
  userForm.emailVerified = user.emailVerified
  userForm.password = ''
  showUserModal.value = true
}

const handleResetPassword = async (user) => {
  if (confirm(`Réinitialiser le mot de passe de ${user.firstName} ${user.lastName} ?`)) {
    try {
      // TODO: Appel API pour réinitialiser le mot de passe
      // await api.post(`/admin/users/${user._id}/reset-password`)
      
      console.log('Mot de passe réinitialisé pour:', user.email)
      alert('Email de réinitialisation envoyé')
    } catch (error) {
      console.error('Erreur réinitialisation mot de passe:', error)
      alert('Erreur lors de la réinitialisation')
    }
  }
}

const handleDeleteUser = (user) => {
  userToDelete.value = user
  showDeleteModal.value = true
}

const confirmDeleteUser = async () => {
  if (!userToDelete.value) return
  
  try {
    // TODO: Appel API pour supprimer l'utilisateur
    // await api.delete(`/admin/users/${userToDelete.value._id}`)
    
    // Supprimer de la liste locale
    const index = users.value.findIndex(u => u._id === userToDelete.value._id)
    if (index > -1) {
      users.value.splice(index, 1)
    }
    
    showDeleteModal.value = false
    userToDelete.value = null
  } catch (error) {
    console.error('Erreur suppression utilisateur:', error)
    alert('Erreur lors de la suppression')
  }
}

const cancelDeleteUser = () => {
  showDeleteModal.value = false
  userToDelete.value = null
}

const handleBulkDeleteUsers = async (userIds) => {
  if (confirm(`Supprimer ${userIds.length} utilisateur(s) ?`)) {
    try {
      // TODO: Appel API pour suppression en masse
      // await api.post('/admin/users/bulk-delete', { userIds })
      
      // Supprimer de la liste locale
      users.value = users.value.filter(u => !userIds.includes(u._id))
      
      console.log('Utilisateurs supprimés:', userIds.length)
    } catch (error) {
      console.error('Erreur suppression en masse:', error)
      alert('Erreur lors de la suppression')
    }
  }
}

const handleExportUsers = (selectedUsers) => {
  const csvContent = generateCSV(selectedUsers)
  downloadCSV(csvContent, 'utilisateurs.csv')
}

const generateCSV = (users) => {
  const headers = ['Nom', 'Prénom', 'Email', 'Rôle', 'Statut', 'Dernière connexion', 'Créé le']
  const rows = users.map(user => [
    user.lastName,
    user.firstName,
    user.email,
    getRoleLabel(user.role),
    getStatusLabel(user.status),
    user.lastLogin ? formatDate(user.lastLogin) : 'Jamais',
    formatDate(user.createdAt)
  ])
  
  return [headers, ...rows].map(row => row.join(',')).join('\n')
}

const downloadCSV = (content, filename) => {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const handleSaveUser = async () => {
  const isValid = validator.validate(userForm)
  if (!isValid) {
    Object.assign(errors, validator.getErrors())
    return
  }

  try {
    isSaving.value = true
    
    if (editingUser.value) {
      // TODO: Appel API pour modifier l'utilisateur
      // await api.put(`/admin/users/${editingUser.value._id}`, userForm)
      
      // Mettre à jour localement
      const index = users.value.findIndex(u => u._id === editingUser.value._id)
      if (index > -1) {
        users.value[index] = { ...users.value[index], ...userForm }
      }
    } else {
      // TODO: Appel API pour créer l'utilisateur
      // const response = await api.post('/admin/users', userForm)
      
      // Ajouter localement
      const newUser = {
        _id: `user_${Date.now()}`,
        ...userForm,
        status: userForm.isActive ? 'active' : 'inactive',
        createdAt: new Date(),
        lastLogin: null
      }
      users.value.unshift(newUser)
    }
    
    closeUserModal()
  } catch (error) {
    console.error('Erreur sauvegarde utilisateur:', error)
    alert('Erreur lors de la sauvegarde')
  } finally {
    isSaving.value = false
  }
}

const closeUserModal = () => {
  showUserModal.value = false
  editingUser.value = null
  resetUserForm()
}

const resetUserForm = () => {
  userForm.firstName = ''
  userForm.lastName = ''
  userForm.email = ''
  userForm.role = ''
  userForm.password = ''
  userForm.isActive = true
  userForm.emailVerified = false
  Object.keys(errors).forEach(key => delete errors[key])
}

const validateField = (field) => {
  const isValid = validator.validateField(field, userForm[field])
  if (!isValid) {
    errors[field] = validator.getFieldError(field)
  } else {
    delete errors[field]
  }
}

const handleSearch = ({ type, value, column }) => {
  console.log('Recherche:', { type, value, column })
}

const handleSort = ({ column, order }) => {
  console.log('Tri:', { column, order })
}

// Fonctions utilitaires
const getInitials = (firstName, lastName) => {
  return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase()
}

const getStatusLabel = (status) => {
  const statusMap = {
    active: 'Actif',
    inactive: 'Inactif',
    pending: 'En attente',
    suspended: 'Suspendu'
  }
  return statusMap[status] || status
}

const getRoleLabel = (role) => {
  const roleMap = {
    user: 'Utilisateur',
    admin: 'Administrateur',
    moderator: 'Modérateur'
  }
  return roleMap[role] || role
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Lifecycle
onMounted(() => {
  // Vérifier les permissions d'administration
  if (!authStore.isAuthenticated || authStore.user.role !== 'admin') {
    router.push('/')
    return
  }
  
  loadUsers()
})
</script>

<style scoped>
/* Page d'administration des utilisateurs */
.admin-users {
  min-height: 100vh;
  background-color: #f8fafc;
  padding: 2rem;
}

/* En-tête */
.admin-header {
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
}

.page-subtitle {
  font-size: 1.125rem;
  color: #6b7280;
  margin: 0;
}

/* Actions principales */
.admin-actions {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  border: none;
  font-size: 0.875rem;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.btn-outline {
  background: white;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-outline:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

.btn-icon {
  font-size: 1rem;
}

/* Colonnes spéciales */
.avatar-column {
  width: 4rem;
}

.name-column {
  min-width: 200px;
}

.email-column {
  min-width: 250px;
}

.role-column {
  width: 8rem;
}

.status-column {
  width: 8rem;
}

.date-column {
  width: 10rem;
}

/* Avatar utilisateur */
.user-avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  font-size: 0.875rem;
  font-weight: 600;
  color: #6b7280;
}

/* Informations utilisateur */
.user-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.user-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin: 0;
}

.user-email {
  font-size: 0.75rem;
  color: #6b7280;
  margin: 0;
}

/* Badges de statut */
.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-active {
  background: #d1fae5;
  color: #059669;
}

.status-inactive {
  background: #f3f4f6;
  color: #6b7280;
}

.status-pending {
  background: #fef3c7;
  color: #d97706;
}

.status-suspended {
  background: #fecaca;
  color: #dc2626;
}

/* Badges de rôle */
.role-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.role-user {
  background: #e0e7ff;
  color: #3730a3;
}

.role-admin {
  background: #fecaca;
  color: #dc2626;
}

.role-moderator {
  background: #fef3c7;
  color: #d97706;
}

/* Dernière connexion */
.last-login {
  font-size: 0.75rem;
  color: #6b7280;
}

.never-logged {
  font-size: 0.75rem;
  color: #9ca3af;
  font-style: italic;
}

/* Actions */
.action-buttons {
  display: flex;
  gap: 0.25rem;
  justify-content: center;
  flex-wrap: wrap;
}

.action-button {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  border: 1px solid #d1d5db;
  background: white;
  color: #374151;
  border-radius: 0.25rem;
  cursor: pointer;
  font-size: 0.75rem;
  transition: all 0.2s ease;
}

.action-button:hover:not(:disabled) {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.action-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-view {
  color: #3b82f6;
  border-color: #3b82f6;
}

.action-edit {
  color: #059669;
  border-color: #059669;
}

.action-reset {
  color: #d97706;
  border-color: #d97706;
}

.action-delete {
  color: #dc2626;
  border-color: #dc2626;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #374151;
  margin: 0;
}

.modal-close {
  width: 2rem;
  height: 2rem;
  border: none;
  background: #f3f4f6;
  color: #6b7280;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  transition: all 0.2s ease;
}

.modal-close:hover {
  background: #e5e7eb;
  color: #374151;
}

.modal-form {
  padding: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.form-input,
.form-select {
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: all 0.2s ease;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-input.error,
.form-select.error {
  border-color: #ef4444;
}

.form-error {
  font-size: 0.75rem;
  color: #ef4444;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.875rem;
  color: #374151;
}

.checkbox-input {
  width: 1rem;
  height: 1rem;
  accent-color: #3b82f6;
}

.checkbox-text {
  user-select: none;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

/* Spinner */
.spinner {
  display: inline-block;
  width: 1rem;
  height: 1rem;
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
@media (max-width: 768px) {
  .admin-users {
    padding: 1rem;
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  .admin-actions {
    flex-direction: column;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .modal-actions {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .admin-users {
    padding: 0.5rem;
  }
  
  .page-title {
    font-size: 1.75rem;
  }
  
  .modal-content {
    margin: 0.5rem;
  }
  
  .modal-header,
  .modal-form {
    padding: 1rem;
  }
}
</style>
