/**
 * Configuration du routeur Vue pour SPARK
 * Gestion des routes et de la navigation
 */

import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

// Import des vues
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import VerifyEmail from '../views/VerifyEmail.vue'
import ForgotPassword from '../views/ForgotPassword.vue'
import ResetPassword from '../views/ResetPassword.vue'
import Products from '../views/Products.vue'
import ProductDetail from '../views/ProductDetail.vue'
import Cart from '../views/Cart.vue'
import Checkout from '../views/Checkout.vue'
import Orders from '../views/Orders.vue'
import OrderDetail from '../views/OrderDetail.vue'
import Profile from '../views/Profile.vue'
import NotFound from '../views/NotFound.vue'

// Vues d'administration
import AdminDashboard from '../views/admin/Dashboard.vue'
import AdminUsers from '../views/admin/Users.vue'
import AdminProducts from '../views/admin/Products.vue'
import AdminOrders from '../views/admin/Orders.vue'
import AdminAnalytics from '../views/admin/Analytics.vue'

// Configuration des routes
const routes = [
  // Routes publiques
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { title: 'Accueil - SPARK' }
  },
  {
    path: '/products',
    name: 'Products',
    component: Products,
    meta: { title: 'Produits - SPARK' }
  },
  {
    path: '/products/:id',
    name: 'ProductDetail',
    component: ProductDetail,
    meta: { title: 'Détails du produit - SPARK' },
    props: true
  },
  
  // Routes d'authentification
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { 
      title: 'Connexion - SPARK',
      requiresGuest: true 
    }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { 
      title: 'Inscription - SPARK',
      requiresGuest: true 
    }
  },
  {
    path: '/verify-email',
    name: 'VerifyEmail',
    component: VerifyEmail,
    meta: { 
      title: 'Vérification email - SPARK',
      requiresGuest: true 
    }
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: ForgotPassword,
    meta: { 
      title: 'Mot de passe oublié - SPARK',
      requiresGuest: true 
    }
  },
  {
    path: '/reset-password',
    name: 'ResetPassword',
    component: ResetPassword,
    meta: { 
      title: 'Réinitialisation mot de passe - SPARK',
      requiresGuest: true 
    }
  },
  
  // Routes protégées (utilisateur connecté)
  {
    path: '/cart',
    name: 'Cart',
    component: Cart,
    meta: { 
      title: 'Panier - SPARK',
      requiresAuth: true 
    }
  },
  {
    path: '/checkout',
    name: 'Checkout',
    component: Checkout,
    meta: { 
      title: 'Commande - SPARK',
      requiresAuth: true 
    }
  },
  {
    path: '/orders',
    name: 'Orders',
    component: Orders,
    meta: { 
      title: 'Mes commandes - SPARK',
      requiresAuth: true 
    }
  },
  {
    path: '/orders/:id',
    name: 'OrderDetail',
    component: OrderDetail,
    meta: { 
      title: 'Détails de la commande - SPARK',
      requiresAuth: true 
    },
    props: true
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: { 
      title: 'Mon profil - SPARK',
      requiresAuth: true 
    }
  },
  
  // Routes d'administration
  {
    path: '/admin',
    name: 'AdminDashboard',
    component: AdminDashboard,
    meta: { 
      title: 'Administration - SPARK',
      requiresAuth: true,
      requiresAdmin: true 
    }
  },
  {
    path: '/admin/users',
    name: 'AdminUsers',
    component: AdminUsers,
    meta: { 
      title: 'Gestion des utilisateurs - SPARK',
      requiresAuth: true,
      requiresAdmin: true 
    }
  },
  {
    path: '/admin/products',
    name: 'AdminProducts',
    component: AdminProducts,
    meta: { 
      title: 'Gestion des produits - SPARK',
      requiresAuth: true,
      requiresAdmin: true 
    }
  },
  {
    path: '/admin/orders',
    name: 'AdminOrders',
    component: AdminOrders,
    meta: { 
      title: 'Gestion des commandes - SPARK',
      requiresAuth: true,
      requiresAdmin: true 
    }
  },
  {
    path: '/admin/analytics',
    name: 'AdminAnalytics',
    component: AdminAnalytics,
    meta: { 
      title: 'Analytics - SPARK',
      requiresAuth: true,
      requiresAdmin: true 
    }
  },
  
  // Route 404
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound,
    meta: { title: 'Page non trouvée - SPARK' }
  }
]

// Création du routeur
const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // Comportement de défilement lors de la navigation
    if (savedPosition) {
      return savedPosition
    } else if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth'
      }
    } else {
      return { top: 0 }
    }
  }
})

// Gardes de navigation
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // Mettre à jour le titre de la page
  document.title = to.meta.title || 'SPARK - Accessoires téléphoniques'
  
  // Vérifier l'authentification
  if (to.meta.requiresAuth) {
    if (!authStore.isAuthenticated) {
      // Rediriger vers la page de connexion
      next({
        name: 'Login',
        query: { redirect: to.fullPath }
      })
      return
    }
    
    // Vérifier si l'utilisateur est admin pour les routes admin
    if (to.meta.requiresAdmin && !authStore.isAdmin) {
      // Rediriger vers la page d'accueil
      next({ name: 'Home' })
      return
    }
  }
  
  // Vérifier si l'utilisateur est déjà connecté pour les routes guest
  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    // Rediriger vers la page d'accueil
    next({ name: 'Home' })
    return
  }
  
  next()
})

// Gestion des erreurs de navigation
router.onError((error) => {
  console.error('Erreur de navigation:', error)
  
  // Rediriger vers la page 404 en cas d'erreur
  router.push({ name: 'NotFound' })
})

// Gestion des changements de route
router.afterEach((to, from) => {
  // Analytics - tracker les vues de pages
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', 'GA_MEASUREMENT_ID', {
      page_path: to.fullPath
    })
  }
  
  // Nettoyer les modales et overlays
  const modals = document.querySelectorAll('.modal, .overlay')
  modals.forEach(modal => {
    if (modal.classList.contains('show')) {
      modal.classList.remove('show')
    }
  })
})

export default router
