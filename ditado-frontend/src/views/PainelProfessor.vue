<template>
  <div>
    <!-- Header -->
    <v-card class="mb-6" elevation="1">
      <v-card-text class="pa-6">
        <h1 class="text-h4 font-weight-bold mb-2">
          Bem-vindo(a), {{ authStore.usuario?.nome?.split(' ')[0] }}
        </h1>
        <p class="text-body-1 text-grey-darken-1">
          Gerencie textos, turmas, relatórios e ditados passados
        </p>
      </v-card-text>
    </v-card>

    <!-- Estatísticas -->
    <v-row class="mb-6">
      <v-col cols="12" sm="6">
        <v-card elevation="1" class="h-100">
          <v-card-text class="pa-6">
            <div class="d-flex align-center justify-space-between mb-2">
              <v-icon size="40" color="primary">mdi-account-group</v-icon>
              <v-chip v-if="!carregandoEstatisticas" color="primary" variant="flat" size="large">
                {{ estatisticas.turmas }}
              </v-chip>
              <v-progress-circular v-else indeterminate color="primary" size="32"></v-progress-circular>
            </div>
            <h3 class="text-h6 font-weight-bold">Turmas</h3>
            <p class="text-body-2 text-grey-darken-1 mb-0">Turmas cadastradas</p>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6">
        <v-card elevation="1" class="h-100">
          <v-card-text class="pa-6">
            <div class="d-flex align-center justify-space-between mb-2">
              <v-icon size="40" color="info">mdi-headphones</v-icon>
              <v-chip v-if="!carregandoEstatisticas" color="info" variant="flat" size="large">
                {{ estatisticas.ditados }}
              </v-chip>
              <v-progress-circular v-else indeterminate color="info" size="32"></v-progress-circular>
            </div>
            <h3 class="text-h6 font-weight-bold">Ditados</h3>
            <p class="text-body-2 text-grey-darken-1 mb-0">Ditados cadastrados</p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Ações principais -->
    <v-row class="mb-6">
      <v-col cols="12" md="4">
        <v-card elevation="1" class="h-100 action-card" hover @click="irParaCadastroTextos">
          <v-card-text class="pa-6 text-center">
            <v-icon size="64" color="primary" class="mb-4">mdi-file-document-plus</v-icon>
            <h3 class="text-h6 font-weight-bold mb-2">Cadastro de Textos</h3>
            <p class="text-body-2 text-grey-darken-1">
              Crie e organize textos para futuras sessões de ditado.
            </p>
            <v-btn color="primary" variant="flat" prepend-icon="mdi-plus" class="mt-4 text-none">
              Novo texto
            </v-btn>
            <div class="mt-4">
              <v-divider class="mb-3"></v-divider>
              <div class="d-flex flex-column gap-2 text-left text-caption text-grey-darken-1">
                <div class="d-flex align-center">
                  <v-icon size="16" class="mr-2">mdi-pound</v-icon>
                  <span>Etiquete por série, tema e dificuldade</span>
                </div>
                <div class="d-flex align-center">
                  <v-icon size="16" class="mr-2">mdi-book-open</v-icon>
                  <span>Importe .txt ou cole conteúdo</span>
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card elevation="1" class="h-100 action-card" hover @click="irParaGerenciamentoTurmas">
          <v-card-text class="pa-6 text-center">
            <v-icon size="64" color="success" class="mb-4">mdi-school</v-icon>
            <h3 class="text-h6 font-weight-bold mb-2">Gerenciamento de Turma</h3>
            <p class="text-body-2 text-grey-darken-1">
              Adicione alunos, organize grupos e defina sessões.
            </p>
            <v-btn color="success" variant="flat" prepend-icon="mdi-account-plus" class="mt-4 text-none">
              Novo aluno
            </v-btn>
            <div class="mt-4">
              <v-divider class="mb-3"></v-divider>
              <div class="d-flex flex-column gap-2 text-left text-caption text-grey-darken-1">
                <div class="d-flex align-center">
                  <v-icon size="16" class="mr-2">mdi-shield-lock</v-icon>
                  <span>Convites com código seguro</span>
                </div>
                <div class="d-flex align-center">
                  <v-icon size="16" class="mr-2">mdi-calendar</v-icon>
                  <span>Agende ditados por data e tempo</span>
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card elevation="1" class="h-100 action-card" hover @click="irParaRelatorios">
          <v-card-text class="pa-6 text-center">
            <v-icon size="64" color="info" class="mb-4">mdi-chart-line</v-icon>
            <h3 class="text-h6 font-weight-bold mb-2">Relatórios</h3>
            <p class="text-body-2 text-grey-darken-1">
              Acompanhe evolução por aluno, turma e habilidade.
            </p>
            <v-btn color="info" variant="flat" prepend-icon="mdi-chart-box" class="mt-4 text-none">
              Visão geral
            </v-btn>
            <div class="mt-4">
              <v-divider class="mb-3"></v-divider>
              <div class="d-flex flex-column gap-2 text-left text-caption text-grey-darken-1">
                <div class="d-flex align-center">
                  <v-icon size="16" class="mr-2">mdi-percent</v-icon>
                  <span>Taxa de acerto por fonema e acentuação</span>
                </div>
                <div class="d-flex align-center">
                  <v-icon size="16" class="mr-2">mdi-clock-outline</v-icon>
                  <span>Comparativos entre turmas</span>
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Ditados passados -->
    <v-card elevation="1">
      <v-card-title class="pa-6 d-flex align-center border-b">
        <v-icon class="mr-3" color="grey-darken-2">mdi-headphones</v-icon>
        <span class="text-h6 font-weight-bold">Ditados passados</span>
        <v-spacer></v-spacer>
        <v-chip color="warning" variant="flat">
          Últimos 30 dias
        </v-chip>
      </v-card-title>

      <v-card-text class="pa-6">
        <v-row class="mb-4">
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="filtroDitados"
              label="Filtrar por turma"
              placeholder="Digite o nome da turma"
              variant="outlined"
              density="comfortable"
              prepend-inner-icon="mdi-magnify"
              clearable
              hide-details
            />
          </v-col>
          <v-col cols="12" sm="6">
            <v-select
              v-model="filtroSerie"
              label="Série"
              :items="series"
              variant="outlined"
              density="comfortable"
              clearable
              hide-details
            />
          </v-col>
        </v-row>

        <!-- Loading -->
        <div v-if="carregandoDitados" class="text-center py-12">
          <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
          <p class="text-grey mt-4">Carregando ditados...</p>
        </div>

        <!-- Lista vazia -->
        <div v-else-if="ditadosFiltrados.length === 0" class="text-center py-12">
          <v-icon size="64" color="grey-lighten-1">mdi-folder-open-outline</v-icon>
          <p class="text-body-1 text-grey mt-4">Nenhum ditado encontrado</p>
          <v-btn 
            color="primary" 
            variant="flat" 
            prepend-icon="mdi-plus" 
            class="mt-4 text-none"
            @click="irParaCadastroTextos"
          >
            Configure um novo ditado a partir de um texto existente na sua biblioteca
          </v-btn>
        </div>

        <!-- Lista de ditados -->
        <div v-else>
          <v-list class="bg-transparent">
            <v-list-item
              v-for="ditado in ditadosFiltrados"
              :key="ditado.id"
              class="mb-3 rounded border"
              elevation="0"
            >
              <template v-slot:prepend>
                <v-avatar color="primary" size="48">
                  <v-icon color="white">mdi-headphones</v-icon>
                </v-avatar>
              </template>

              <v-list-item-title class="text-h6 font-weight-bold mb-1">
                {{ ditado.titulo }}
              </v-list-item-title>
              
              <v-list-item-subtitle class="text-body-2 mb-2">
                <v-icon size="16" class="mr-1">mdi-calendar</v-icon>
                Realizado em {{ formatarData(ditado.dataCriacao) }}
                <v-icon size="16" class="ml-3 mr-1">mdi-account-multiple</v-icon>
                {{ ditado.alunos || '24' }} alunos
              </v-list-item-subtitle>

              <template v-slot:append>
                <div class="d-flex align-center gap-2">
                  <v-chip 
                    :color="obterCorMedia(ditado.media || 78)" 
                    variant="flat"
                    size="large"
                  >
                    <v-icon start size="18">mdi-check-circle</v-icon>
                    Média {{ ditado.media || '78' }}%
                  </v-chip>
                  <v-btn
                    icon="mdi-open-in-new"
                    size="small"
                    variant="text"
                    color="primary"
                    @click="verDetalhesDitado(ditado)"
                  />
                </div>
              </template>
            </v-list-item>
          </v-list>
        </div>
      </v-card-text>
    </v-card>

    <!-- Snackbar -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3000">
      {{ snackbar.mensagem }}
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ditadoService } from '@/services/ditadoService'

const router = useRouter()
const authStore = useAuthStore()

const estatisticas = ref({
  turmas: 0,
  ditados: 0
})

const ditados = ref([])
const carregandoDitados = ref(false)
const carregandoEstatisticas = ref(false)
const filtroDitados = ref('')
const filtroSerie = ref(null)

const series = [
  '1º ano', '2º ano', '3º ano', '4º ano', '5º ano',
  '6º ano', '7º ano', '8º ano', '9º ano'
]

const snackbar = ref({
  show: false,
  mensagem: '',
  color: 'info'
})

const ditadosFiltrados = computed(() => {
  let resultado = [...ditados.value]

  if (filtroDitados.value && filtroDitados.value.trim() !== '') {
    const busca = filtroDitados.value.toLowerCase().trim()
    resultado = resultado.filter(d => 
      d.titulo?.toLowerCase().includes(busca)
    )
  }

  if (filtroSerie.value) {
    resultado = resultado.filter(d => d.serie === filtroSerie.value)
  }

  return resultado
})

onMounted(() => {
  buscarEstatisticas()
  buscarDitados()
})

async function buscarEstatisticas() {
  carregandoEstatisticas.value = true
  try {
    // Buscar ditados para contar
    const dadosDitados = await ditadoService.listarTodos()
    estatisticas.value.ditados = dadosDitados.length
    
    // TODO: Buscar turmas quando o endpoint estiver disponível
    // const dadosTurmas = await turmaService.listarTodos()
    // estatisticas.value.turmas = dadosTurmas.length
  } catch (erro) {
    console.error('Erro ao carregar estatísticas:', erro)
  } finally {
    carregandoEstatisticas.value = false
  }
}

async function buscarDitados() {
  carregandoDitados.value = true
  try {
    const dados = await ditadoService.listarTodos()
    // Filtrar apenas ditados que já foram realizados (exemplo: que têm alguma flag ou data de realização)
    // Como não temos essa informação na API, vamos mostrar uma lista vazia por enquanto
    ditados.value = []
    estatisticas.value.ditados = dados.length
  } catch (erro) {
    console.error('Erro ao carregar ditados:', erro)
    mostrarSnackbar('Erro ao carregar ditados', 'error')
  } finally {
    carregandoDitados.value = false
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

function obterCorMedia(media) {
  if (media >= 80) return 'success'
  if (media >= 60) return 'warning'
  return 'error'
}

function irParaCadastroTextos() {
  router.push('/cadastro-ditado')
}

function irParaGerenciamentoTurmas() {
  mostrarSnackbar('Funcionalidade em desenvolvimento', 'info')
}

function irParaRelatorios() {
  mostrarSnackbar('Funcionalidade em desenvolvimento', 'info')
}

function verDetalhesDitado(ditado) {
  mostrarSnackbar('Funcionalidade em desenvolvimento', 'info')
}

function mostrarSnackbar(mensagem, cor = 'info') {
  snackbar.value = {
    show: true,
    mensagem,
    color: cor
  }
}
</script>

<style scoped>
.gap-2 {
  gap: 8px;
}

.action-card {
  cursor: pointer;
  transition: transform 0.2s ease-in-out;
}

.action-card:hover {
  transform: translateY(-4px);
}

.border-b {
  border-bottom: 1px solid #e0e0e0;
}
</style>
