<template>
  <v-app-bar elevation="0" color="white" height="70" border="b">
    <v-app-bar-nav-icon 
      @click="emit('toggle-drawer')"
      class="ml-2"
    ></v-app-bar-nav-icon>

    <v-toolbar-title class="text-h6 font-weight-bold text-grey-darken-3">
      {{ tituloPagina }}
    </v-toolbar-title>

    <v-spacer></v-spacer>

    <div class="d-flex align-center gap-3 mr-4">
      <v-btn
        variant="outlined"
        color="primary"
        prepend-icon="mdi-help-circle-outline"
        class="text-none"
      >
        Ajuda
      </v-btn>
    </div>
  </v-app-bar>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const emit = defineEmits(['toggle-drawer'])

const route = useRoute()
const authStore = useAuthStore()

const tituloPagina = computed(() => {
  const titulos = {
    'Home': 'Home',
    'Perfil': 'Editar Perfil',
    'Usuarios': 'Gerenciar Usuários',
    'Ditados': 'Ditados',
    'Turmas': 'Turmas',
    'MinhasTurmas': 'Minhas Turmas',
    'CadastroDitado': 'Cadastro de Ditado'
  }
  return titulos[route.name] || 'Sistema de Gestão'
})
</script>

<style scoped>
.gap-3 {
  gap: 12px;
}
</style>