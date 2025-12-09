<template>
  <div>
    <!-- Header -->
    <v-card class="mb-6" elevation="1">
      <v-card-text class="pa-6">
        <div class="d-flex align-center justify-space-between">
          <div>
            <h1 class="text-h4 font-weight-bold mb-2">Minhas Tentativas</h1>
            <p class="text-body-1 text-grey-darken-1">
              Visualize todas as suas tentativas de ditados
            </p>
          </div>
          <v-btn
            variant="flat"
            color="primary"
            prepend-icon="mdi-arrow-left"
            class="text-none"
            @click="voltarParaHome"
          >
            Voltar
          </v-btn>
        </div>
      </v-card-text>
    </v-card>

    <!-- Filtros -->
    <v-card class="mb-6" elevation="1">
      <v-card-text class="pa-6">
        <v-row>
          <v-col cols="12" md="4">
            <v-text-field
              v-model="filtroTitulo"
              prepend-inner-icon="mdi-magnify"
              placeholder="Filtrar por título do ditado"
              variant="outlined"
              density="comfortable"
            />
          </v-col>
          <v-col cols="12" md="4">
            <v-select
              v-model="filtroTurma"
              :items="turmas"
              item-title="nome"
              item-value="id"
              placeholder="Filtrar por turma"
              variant="outlined"
              density="comfortable"
              clearable
            />
          </v-col>
          <v-col cols="12" md="4">
            <v-select
              v-model="filtroCategoria"
              :items="categorias"
              item-title="nome"
              item-value="id"
              placeholder="Filtrar por categoria"
              variant="outlined"
              density="comfortable"
              multiple
              chips
              clearable
            />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Tabela de Tentativas -->
    <v-card elevation="1">
      <v-card-title class="bg-grey-lighten-5 pa-4">
        <v-icon class="mr-2">mdi-history</v-icon>
        Histórico de Tentativas ({{ tentativasFiltradas.length }})
      </v-card-title>

      <v-data-table
        v-if="tentativasFiltradas.length > 0"
        :headers="headers"
        :items="tentativasFiltradas"
        :loading="carregando"
        class="elevation-0"
        density="comfortable"
        @click:row="visualizarDetalhes"
      >
        <template v-slot:item.ditado="{ item }">
          <div class="font-weight-bold">{{ item.ditado?.titulo }}</div>
        </template>

        <template v-slot:item.turma="{ item }">
          <v-chip size="small" variant="outlined">
            {{ item.turma?.nome || '-' }}
          </v-chip>
        </template>

        <template v-slot:item.categorias="{ item }">
          <div v-if="item.ditado?.categoriaIds && item.ditado.categoriaIds.length > 0" class="d-flex gap-1 flex-wrap">
            <v-chip
              v-for="catId in item.ditado.categoriaIds"
              :key="catId"
              size="x-small"
              variant="outlined"
              color="secondary"
            >
              {{ getNomeCategoria(catId) }}
            </v-chip>
          </div>
          <span v-else class="text-grey-darken-1 text-caption">-</span>
        </template>

        <template v-slot:item.nota="{ item }">
          <div class="d-flex align-center gap-2">
            <v-progress-circular
              :value="item.nota"
              :color="corNota(item.nota)"
              size="40"
            >
              {{ item.nota.toFixed(1) }}
            </v-progress-circular>
            <span class="text-caption">{{ item.nota.toFixed(1) }}%</span>
          </div>
        </template>

        <template v-slot:item.resultado="{ item }">
          <div class="d-flex align-center gap-2">
            <v-chip
              :color="item.acertos === item.totalLacunas ? 'success' : 'warning'"
              variant="flat"
              size="small"
            >
              {{ item.acertos }}/{{ item.totalLacunas }}
            </v-chip>
            <span class="text-caption text-grey-darken-1">
              {{ item.acertos }} acertos
            </span>
          </div>
        </template>

        <template v-slot:item.dataRealizacao="{ item }">
          <div class="text-caption">
            {{ formatarDataHora(item.dataRealizacao) }}
          </div>
        </template>

        <template v-slot:item.atrasado="{ item }">
          <v-chip
            :color="item.atrasado ? 'error' : 'success'"
            variant="flat"
            size="small"
          >
            {{ item.atrasado ? 'Atrasado' : 'No prazo' }}
          </v-chip>
        </template>

        <template v-slot:item.acoes="{ item }">
          <v-btn
            icon="mdi-eye"
            size="small"
            variant="text"
            color="primary"
            @click.stop="visualizarDetalhes(item)"
          />
        </template>

        <template v-slot:no-data>
          <v-row class="pa-6">
            <v-col cols="12" class="text-center">
              <v-icon size="64" color="grey-lighten-1" class="mb-4">
                mdi-history
              </v-icon>
              <p class="text-h6 text-grey-darken-1 mb-2">Nenhuma tentativa encontrada</p>
              <p class="text-body-2 text-grey-darken-2">
                Comece a realizar ditados para ver seu histórico aqui
              </p>
            </v-col>
          </v-row>
        </template>
      </v-data-table>

      <div v-else class="pa-6 text-center">
        <v-icon size="64" color="grey-lighten-1" class="mb-4">
          mdi-history
        </v-icon>
        <p class="text-h6 text-grey-darken-1 mb-2">Nenhuma tentativa encontrada</p>
      </div>
    </v-card>

    <!-- Dialog de Detalhes -->
    <v-dialog v-model="dialogDetalhes" max-width="800">
      <v-card>
        <v-card-title class="bg-primary text-white pa-4 d-flex align-center justify-space-between">
          <div class="d-flex align-center gap-2">
            <v-icon>mdi-magnify</v-icon>
            Detalhes da Tentativa
          </div>
          <v-btn
            icon="mdi-close"
            variant="text"
            color="white"
            @click="dialogDetalhes = false"
          />
        </v-card-title>

        <v-card-text class="pa-6" v-if="tentativaSelecionada">
          <!-- Informações Gerais -->
          <v-row class="mb-6">
            <v-col cols="12">
              <h3 class="text-h6 font-weight-bold mb-3">{{ tentativaSelecionada.ditado?.titulo }}</h3>
            </v-col>
          </v-row>

          <v-row class="mb-6">
            <v-col cols="12" md="4">
              <div class="text-caption text-grey-darken-1 font-weight-bold mb-1">
                Nota
              </div>
              <div class="text-h4 font-weight-bold" :style="{ color: corNotaHex(tentativaSelecionada.nota) }">
                {{ tentativaSelecionada.nota.toFixed(1) }}%
              </div>
            </v-col>
            <v-col cols="12" md="4">
              <div class="text-caption text-grey-darken-1 font-weight-bold mb-1">
                Data
              </div>
              <div class="text-body-1">
                {{ formatarDataHora(tentativaSelecionada.dataRealizacao) }}
              </div>
            </v-col>
            <v-col cols="12" md="4">
              <div class="text-caption text-grey-darken-1 font-weight-bold mb-1">
                Status
              </div>
              <v-chip
                :color="tentativaSelecionada.atrasado ? 'error' : 'success'"
                variant="flat"
              >
                {{ tentativaSelecionada.atrasado ? 'Entregue Atrasado' : 'Entregue no Prazo' }}
              </v-chip>
            </v-col>
          </v-row>

          <v-divider class="my-6"></v-divider>

          <!-- Resultado -->
          <v-row class="mb-6">
            <v-col cols="12" md="4">
              <v-card elevation="0" class="bg-grey-lighten-5 pa-4 text-center">
                <div class="text-h5 font-weight-bold text-success mb-2">
                  {{ tentativaSelecionada.acertos }}
                </div>
                <div class="text-caption text-grey-darken-1">Acertos</div>
              </v-card>
            </v-col>
            <v-col cols="12" md="4">
              <v-card elevation="0" class="bg-grey-lighten-5 pa-4 text-center">
                <div class="text-h5 font-weight-bold text-error mb-2">
                  {{ tentativaSelecionada.erros }}
                </div>
                <div class="text-caption text-grey-darken-1">Erros</div>
              </v-card>
            </v-col>
            <v-col cols="12" md="4">
              <v-card elevation="0" class="bg-grey-lighten-5 pa-4 text-center">
                <div class="text-h5 font-weight-bold text-primary mb-2">
                  {{ tentativaSelecionada.totalLacunas }}
                </div>
                <div class="text-caption text-grey-darken-1">Total de Lacunas</div>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions class="pa-4 bg-grey-lighten-5">
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            variant="flat"
            @click="dialogDetalhes = false"
          >
            Fechar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

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
import { alunoService } from '@/services/alunoService'
import { turmaService } from '@/services/turmaService'
import { categoriaService } from '@/services/categoriaService'

const router = useRouter()
const authStore = useAuthStore()

const tentativas = ref([])
const turmas = ref([])
const categorias = ref([])
const carregando = ref(false)
const filtroTitulo = ref('')
const filtroTurma = ref(null)
const filtroCategoria = ref([])
const dialogDetalhes = ref(false)
const tentativaSelecionada = ref(null)

const snackbar = ref({
  show: false,
  mensagem: '',
  color: 'success'
})

const headers = [
  { title: 'Ditado', key: 'ditado', sortable: true },
  { title: 'Turma', key: 'turma', sortable: true },
  { title: 'Categorias', key: 'categorias' },
  { title: 'Nota', key: 'nota', align: 'center', sortable: true },
  { title: 'Resultado', key: 'resultado', align: 'center' },
  { title: 'Data', key: 'dataRealizacao', sortable: true },
  { title: 'Status', key: 'atrasado', align: 'center' },
  { title: 'Ações', key: 'acoes', sortable: false, align: 'center' }
]

const tentativasFiltradas = computed(() => {
  return tentativas.value.filter(tentativa => {
    const tituloMatch = !filtroTitulo.value || 
      tentativa.ditado?.titulo?.toLowerCase().includes(filtroTitulo.value.toLowerCase())
    
    const turmaMatch = !filtroTurma.value || 
      tentativa.turma?.id === filtroTurma.value

    const categoriaMatch = !filtroCategoria.value || filtroCategoria.value.length === 0 ||
      tentativa.ditado?.categoriaIds && 
      tentativa.ditado.categoriaIds.some(catId => filtroCategoria.value.includes(catId))
    
    return tituloMatch && turmaMatch && categoriaMatch
  })
})

onMounted(async () => {
  await Promise.all([
    carregarTentativas(),
    carregarTurmas(),
    carregarCategorias()
  ])
})

async function carregarTentativas() {
  carregando.value = true
  try {
    const meusDitados = await alunoService.listarMeusDitados()
    
    // Buscar tentativas para cada ditado
    const todasAsTentativas = []
    for (const ditado of meusDitados) {
      try {
        const tentativasDoDitado = await alunoService.listarMinhasTentativas(ditado.ditadoId)
        
        // Mapear cada tentativa com informações do ditado e turma
        tentativasDoDitado.forEach(tentativa => {
          todasAsTentativas.push({
            ...tentativa,
            ditado: {
              id: ditado.ditadoId,
              titulo: ditado.titulo
            },
            turma: ditado.turmas?.[0] ? {
              id: ditado.turmas[0].turmaId,
              nome: ditado.turmas[0].turmaNome
            } : null
          })
        })
      } catch (erro) {
        console.error(`Erro ao carregar tentativas do ditado ${ditado.ditadoId}:`, erro)
      }
    }
    
    // Ordenar por data decrescente (mais recentes primeiro)
    tentativas.value = todasAsTentativas.sort((a, b) => 
      new Date(b.dataRealizacao) - new Date(a.dataRealizacao)
    )
  } catch (erro) {
    console.error('Erro ao carregar tentativas:', erro)
    mostrarSnackbar('Erro ao carregar tentativas', 'error')
  } finally {
    carregando.value = false
  }
}

async function carregarTurmas() {
  try {
    const minhasTurmas = await turmaService.listarDosAlunos(authStore.usuario.id)
    turmas.value = minhasTurmas
  } catch (erro) {
    console.error('Erro ao carregar turmas:', erro)
  }
}

async function carregarCategorias() {
  try {
    categorias.value = await categoriaService.listarTodas()
  } catch (erro) {
    console.error('Erro ao carregar categorias:', erro)
  }
}

function formatarDataHora(data) {
  const date = new Date(data)
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function corNota(nota) {
  if (nota >= 80) return 'success'
  if (nota >= 60) return 'warning'
  return 'error'
}

function corNotaHex(nota) {
  if (nota >= 80) return '#4caf50'
  if (nota >= 60) return '#ff9800'
  return '#f44336'
}

function visualizarDetalhes(tentativa) {
  tentativaSelecionada.value = tentativa
  dialogDetalhes.value = true
}

function voltarParaHome() {
  router.push('/aluno')
}

function getNomeCategoria(categoriaId) {
  const categoria = categorias.value.find(c => c.id === categoriaId)
  return categoria ? categoria.nome : 'Desconhecida'
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
.bg-grey-lighten-5 {
  background-color: #fafafa;
}
</style>
