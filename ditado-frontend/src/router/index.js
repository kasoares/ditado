import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { requerAutenticacao: false }
  },
  {
    path: '/cadastro',
    name: 'Cadastro',
    component: () => import('@/views/Cadastro.vue'),
    meta: { requerAutenticacao: false }
  },
  {
    path: '/',
    component: () => import('@/layouts/LayoutPrincipal.vue'),
    meta: { requerAutenticacao: true },
    children: [
      {
        path: '',
        name: 'Home',
        component: () => import('@/views/Home.vue')
      },
      {
        path: '/perfil',
        name: 'Perfil',
        component: () => import('@/views/PerfilUsuario.vue')
      },
      {
        path: '/usuarios',
        name: 'Usuarios',
        component: () => import('@/views/Usuarios.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requerAutenticacao && !authStore.estaAutenticado) {
    next('/login')
  } else if (to.path === '/login' && authStore.estaAutenticado) {
    next('/')
  } else {
    next()
  }
})

export default router