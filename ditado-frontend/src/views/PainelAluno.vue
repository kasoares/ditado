<template>
  <div>
    <!-- Header -->
    <v-card class="mb-6" elevation="1">
      <v-card-text class="pa-6">
        <h1 class="text-h4 font-weight-bold mb-2">
          Bem-vindo(a), {{ authStore.usuario?.nome?.split(' ')[0] }}
        </h1>
        <p class="text-body-1 text-grey-darken-1">
          Pratique ditados e acompanhe seu progresso
        </p>
      </v-card-text>
    </v-card>

    <!-- Lista de Ditados Disponíveis -->
    <v-card elevation="1">
      <v-card-title class="pa-6 d-flex align-center border-b">
        <v-icon class="mr-3" color="grey-darken-2">mdi-headphones</v-icon>
        <span class="text-h6 font-weight-bold">Ditados Disponíveis</span>
        <v-spacer></v-spacer>
        <v-chip color="primary" variant="flat">
          {{ ditados.length }} {{ ditados.length === 1 ? 'ditado' : 'ditados' }}
        </v-chip>
      </v-card-title>

      <v-card-text class="pa-6">
        <!-- Loading -->
        <div v-if="carregando" class="text-center py-12">
          <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
          <p class="text-grey mt-4">Carregando ditados...</p>
        </div>

        <!-- Lista vazia -->
        <div v-else-if="ditados.length === 0" class="text-center py-12">
          <v-icon size="64" color="grey-lighten-1">mdi-folder-open-outline</v-icon>
          <p class="text-body-1 text-grey mt-4">Nenhum ditado disponível no momento</p>
        </div>

        <!-- Lista de ditados -->
        <v-row v-else>
          <v-col v-for="ditado in ditados" :key="ditado.id" cols="12" md="6">
            <v-card elevation="2" class="ditado-card" hover @click="iniciarDitado(ditado.id)">
              <v-card-text class="pa-6">
                <div class="d-flex align-center mb-4">
                  <v-avatar color="primary" size="56" class="mr-4">
                    <v-icon size="32" color="white">mdi-headphones</v-icon>
                  </v-avatar>
                  <div class="flex-grow-1">
                    <h3 class="text-h6 font-weight-bold mb-1">{{ ditado.titulo }}</h3>
                    <p class="text-body-2 text-grey-darken-1 mb-0">
                      {{ ditado.descricao || 'Clique para iniciar o ditado' }}
                    </p>
                  </div>
                </div>
                <v-divider class="my-3"></v-divider>
                <div class="d-flex align-center justify-space-between">
                  <div class="text-caption text-grey-darken-1">
                    <v-icon size="16" class="mr-1">mdi-calendar</v-icon>
                    Criado em {{ formatarData(ditado.dataCriacao) }}
                  </div>
                  <v-btn
                    color="primary"
                    variant="flat"
                    size="small"
                    prepend-icon="mdi-play"
                    class="text-none"
                  >
                    Iniciar
                  </v-btn>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Snackbar -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3000">
      {{ snackbar.mensagem }}
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ditadoService } from '@/services/ditadoService'

const router = useRouter()
const authStore = useAuthStore()

const ditados = ref([])
const carregando = ref(false)

const snackbar = ref({
  show: false,
  mensagem: '',
  color: 'success'
})

onMounted(() => {
  buscarDitados()
})

async function buscarDitados() {
  carregando.value = true
  try {
    const dados = await ditadoService.listarTodos()
    ditados.value = dados
  } catch (erro) {
    console.error('Erro ao carregar ditados:', erro)
    mostrarSnackbar('Erro ao carregar ditados', 'error')
  } finally {
    carregando.value = false
  }
}

function formatarData(data) {
  const date = new Date(data)
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

function iniciarDitado(id) {
  router.push(`/realizar-ditado/${id}`)
}

function mostrarSnackbar(mensagem, cor = 'success') {
  snackbar.value = {
    show: true,
    mensagem,
    color: cor
  }
}
</script>

<style scoped>
.border-b {
  border-bottom: 1px solid #e0e0e0;
}

.ditado-card {
  cursor: pointer;
  transition: transform 0.2s ease-in-out;
}

.ditado-card:hover {
  transform: translateY(-4px);
}
</style>

