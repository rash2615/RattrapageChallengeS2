import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useConfirmModalStore = defineStore('confirmModal', () => {
  const show = ref(false)
  const title = ref('')
  const message = ref('')
  const loading = ref(false)
  const error = ref(null)
  const onConfirm = ref(null)
  const onCancel = ref(null)

  const open = (options) => {
    title.value = options.title || 'Confirmation'
    message.value = options.message || 'Êtes-vous sûr de vouloir continuer ?'
    loading.value = false
    error.value = null
    onConfirm.value = options.onConfirm || (() => {})
    onCancel.value = options.onCancel || (() => {})
    show.value = true
  }

  const close = () => {
    show.value = false
    title.value = ''
    message.value = ''
    loading.value = false
    error.value = null
    onConfirm.value = null
    onCancel.value = null
  }

  const setLoading = (isLoading) => {
    loading.value = isLoading
  }

  const setError = (errorMessage) => {
    error.value = errorMessage
    loading.value = false
  }

  const confirm = async () => {
    if (onConfirm.value) {
      setLoading(true)
      try {
        await onConfirm.value()
        close()
      } catch (err) {
        setError(err.message || 'Une erreur est survenue')
      }
    }
  }

  const cancel = () => {
    if (onCancel.value) {
      onCancel.value()
    }
    close()
  }

  return {
    show,
    title,
    message,
    loading,
    error,
    onConfirm,
    onCancel,
    open,
    close,
    setLoading,
    setError,
    confirm,
    cancel
  }
})
