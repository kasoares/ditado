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
          {{ ditadosFiltrados.length }} {{ ditadosFiltrados.length === 1 ? 'ditado' : 'ditados' }}
        </v-chip>
      </v-card-title>

      <v-card-text class="pa-6">
        <!-- Filtro de Categorias -->
        <div class="mb-6">
          <label class="text-body-2 font-weight-bold text-grey-darken-2 mb-2 d-block">
            Filtrar por categoria
          </label>
          <v-select
            v-model="filtroCategoria"
            :items="categorias"
            item-title="nome"
            item-value="id"
            placeholder="Todas as categorias"
            variant="outlined"
            density="comfortable"
            :loading="carregandoCategorias"
            multiple
            chips
            clearable
            hide-details="auto"
            @update:model-value="filtrarDitados"
          />
        </div>

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

        <!-- Nenhum resultado após filtro -->
        <div v-else-if="ditadosFiltrados.length === 0" class="text-center py-12">
          <v-icon size="64" color="grey-lighten-1">mdi-filter-off</v-icon>
          <p class="text-body-1 text-grey mt-4">Nenhum ditado encontrado com essa categoria</p>
        </div>

        <!-- Lista de ditados -->
        <v-row v-else>
          <v-col v-for="ditado in ditadosFiltrados" :key="ditado.ditadoId" cols="12" md="6">
            <v-card elevation="2" class="ditado-card" hover @click="iniciarDitado(ditado.ditadoId)">
              <v-card-text class="pa-6">
                <div class="d-flex align-center mb-4">
                  <v-avatar color="primary" size="56" class="mr-4">
                    <v-icon size="32" color="white">mdi-headphones</v-icon>
                  </v-avatar>
                  <div class="flex-grow-1">
                    <h3 class="text-h6 font-weight-bold mb-1">{{ ditado.titulo }}</h3>
                    <p class="text-body-2 text-grey-darken-1 mb-2">
                      {{ ditado.descricao || 'Clique para iniciar o ditado' }}
                    </p>
                    <!-- Categorias -->
                    <div v-if="ditado.categorias && ditado.categorias.length > 0" class="d-flex gap-1 flex-wrap">
                      <v-chip
                        v-for="categoria in ditado.categorias"
                        :key="categoria.id"
                        size="x-small"
                        variant="outlined"
                        color="secondary"
                      >
                        {{ categoria.nome }}
                      </v-chip>
                    </div>
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
import { alunoService } from '@/services/alunoService'
import { categoriaService } from '@/services/categoriaService'
import { ditadoService } from '@/services/ditadoService'

const router = useRouter()
const authStore = useAuthStore()

const ditados = ref([])
const ditadosFiltrados = ref([])
const carregando = ref(false)
const carregandoCategorias = ref(false)

const categorias = ref([])
const filtroCategoria = ref([])

const snackbar = ref({
  show: false,
  mensagem: '',
  color: 'success'
})

onMounted(() => {
  Promise.all([buscarDitados(), carregarCategorias()])
})

async function carregarCategorias() {
  carregandoCategorias.value = true
  try {
    categorias.value = await categoriaService.listarTodas()
  } catch (erro) {
    console.error('Erro ao carregar categorias:', erro)
  } finally {
    carregandoCategorias.value = false
  }
}

async function buscarDitados() {
  carregando.value = true
  try {
    // TESTE: Usar ditadoService para listar ditados atribuídos ao aluno
    const dados = await ditadoService.listarMeusDitados()
    ditados.value = dados
    filtrarDitados()
  } catch (erro) {
    console.error('Erro ao carregar ditados:', erro)
    mostrarSnackbar('Erro ao carregar ditados', 'error')
  } finally {
    carregando.value = false
  }
}

function filtrarDitados() {
  let resultado = [...ditados.value]

  // Filtrar por categorias se selecionadas
  if (filtroCategoria.value && filtroCategoria.value.length > 0) {
    resultado = resultado.filter(ditado =>
      ditado.categorias && 
      filtroCategoria.value.every(catId => 
        ditado.categorias.some(cat => cat.id === catId)
      )
    )
  }

  ditadosFiltrados.value = resultado
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

function getNomeCategoria(categoriaId) {
  const categoria = categorias.value.find(c => c.id === categoriaId)
  return categoria ? categoria.nome : 'Desconhecida'
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
