<template>
  <div>
    <v-card class="mb-6" elevation="1">
      <v-card-text class="pa-6">
        <div class="d-flex align-center justify-space-between">
          <div>
            <h1 class="text-h4 font-weight-bold mb-2">Ditados</h1>
            <p class="text-body-1 text-grey-darken-1">
              Gerencie os ditados da instituição
            </p>
          </div>
          <v-btn
            color="success"
            size="large"
            prepend-icon="mdi-plus"
            to="/cadastro-ditado"
            class="text-none"
          >
            DITADO
          </v-btn>
        </div>
      </v-card-text>
    </v-card>

    <v-card class="mb-6" elevation="1">
      <v-card-text class="pa-6">
        <v-row class="g-4">
          <v-col cols="12" md="6">
            <v-text-field
              v-model="pesquisa"
              prepend-inner-icon="mdi-magnify"
              placeholder="Filtrar ditados cadastrados"
              variant="outlined"
              density="comfortable"
              @update:model-value="filtrarDitados"
              clearable
              hide-details
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-select
              v-model="filtroCategoria"
              :items="categorias"
              item-title="nome"
              item-value="id"
              placeholder="Filtrar por categorias"
              variant="outlined"
              density="comfortable"
              multiple
              chips
              clearable
              @update:model-value="filtrarDitados"
              hide-details
            />
          </v-col>
        </v-row>
        <v-row v-if="filtroCategoria.length > 0" class="mt-2">
          <v-col cols="12">
            <div class="d-flex gap-2 align-center flex-wrap">
              <span class="text-caption text-grey-darken-1">Categorias selecionadas:</span>
              <v-chip
                v-for="catId in filtroCategoria"
                :key="catId"
                size="small"
                closable
                @click:close="removerFiltroCategoria(catId)"
              >
                {{ getNomeCategoriaById(catId) }}
              </v-chip>
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-card class="mb-6" elevation="1">
      <v-card-title class="bg-blue-grey-lighten-5 pa-4 d-flex align-center">
        <v-icon class="mr-2" color="primary">mdi-calendar-check</v-icon>
        Ditados Atribuídos (Últimos 30 dias)
      </v-card-title>

      <v-data-table
        :headers="headersAtribuidos"
        :items="ditadosAtribuidos"
        :loading="carregandoAtribuidos"
        density="comfortable"
        class="elevation-0"
      >
        <template v-slot:item.turmaNome="{ item }">
          <div class="font-weight-medium text-primary">{{ item.turmaNome }}</div>
        </template>

        <template v-slot:item.ditadoTitulo="{ item }">
          <div class="font-weight-bold">{{ item.ditadoTitulo }}</div>
        </template>

        <template v-slot:item.dataLimite="{ item }">
          <div :class="item.vencido ? 'text-error font-weight-bold' : ''">
            {{ formatarData(item.dataLimite) }}
            <v-icon v-if="item.vencido" size="small" color="error" class="ml-1" title="Prazo encerrado">
              mdi-clock-alert
            </v-icon>
          </div>
        </template>

        <template v-slot:item.vencido="{ item }">
          <v-chip 
            :color="item.vencido ? 'grey' : 'success'" 
            size="small" 
            variant="flat"
          >
            {{ item.vencido ? 'Encerrado' : 'Aberto' }}
          </v-chip>
        </template>

        <template v-slot:item.percentualConclusao="{ item }">
          <div class="d-flex align-center" style="min-width: 140px">
            <v-progress-linear
              :model-value="item.percentualConclusao"
              :color="getCorProgresso(item.percentualConclusao)"
              height="8"
              rounded
              class="mr-2 flex-grow-1"
            ></v-progress-linear>
            <span class="text-caption font-weight-bold" style="min-width: 35px">
              {{ item.percentualConclusao.toFixed(0) }}%
            </span>
          </div>
          <div class="text-caption text-grey text-center mt-1">
             {{ item.alunosQueFizeram }} de {{ item.totalAlunos }} alunos
          </div>
        </template>

        <template v-slot:item.notaMedia="{ item }">
          <v-chip 
            v-if="item.alunosQueFizeram > 0"
            :color="obterCorNota(item.notaMedia)" 
            variant="outlined" 
            size="small"
            class="font-weight-bold"
          >
             {{ item.notaMedia.toFixed(1) }}%
          </v-chip>
          <span v-else class="text-grey text-caption">-</span>
        </template>

        <template v-slot:item.acoes="{ item }">
          <v-btn
            icon="mdi-chart-box-outline"
            size="small"
            variant="text"
            color="primary"
            title="Ver resultados detalhados"
            @click="verResultadosTurma(item)"
          />
        </template>

        <template v-slot:no-data>
          <div class="text-center pa-6 text-grey">
            <v-icon size="40" color="grey-lighten-2" class="mb-2">mdi-school-outline</v-icon>
            <p>Nenhum ditado atribuído nos últimos 30 dias.</p>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <v-card elevation="1">
      <v-card-title class="bg-grey-lighten-5 pa-4">
        <v-icon class="mr-2">mdi-file-document-multiple</v-icon>
        Biblioteca de Ditados Cadastrados
      </v-card-title>

      <v-data-table
        v-if="ditadosFiltrados.length > 0"
        :headers="headers"
        :items="ditadosFiltrados"
        :loading="carregando"
        class="elevation-0"
        density="comfortable"
      >
        <template v-slot:item.titulo="{ item }">
          <div class="font-weight-bold">{{ item.titulo }}</div>
        </template>

        <template v-slot:item.descricao="{ item }">
          <div class="text-truncate" style="max-width: 300px; white-space: normal;">
            {{ item.descricao || '-' }}
          </div>
        </template>

        <template v-slot:item.categorias="{ item }">
          <div v-if="item.categorias && item.categorias.length > 0" class="d-flex gap-1 flex-wrap">
            <v-chip
              v-for="categoria in item.categorias"
              :key="categoria.id"
              size="small"
              variant="outlined"
              color="secondary"
            >
              {{ categoria.nome }}
            </v-chip>
          </div>
          <span v-else class="text-grey-darken-1">-</span>
        </template>

        <template v-slot:item.palavrasOmitidas="{ item }">
          <v-chip color="primary" variant="flat" size="small">
            {{ calcularPalavrasOmitidas(item) }}
          </v-chip>
        </template>

        <template v-slot:item.dataCriacao="{ item }">
          {{ formatarData(item.dataCriacao) }}
        </template>

        <template v-slot:item.acoes="{ item }">
          <div class="d-flex gap-2 justify-end">
            <v-btn
              icon="mdi-school"
              size="small"
              variant="text"
              color="primary"
              title="Atribuir a uma turma"
              @click="abrirDialogAtribuirTurma(item)"
            />
            <v-btn
              icon="mdi-delete"
              size="small"
              variant="text"
              color="error"
              :disabled="!podeDelete(item)"
              @click="deletarDitado(item)"
            />
          </div>
        </template>

        <template v-slot:no-data>
          <v-row class="pa-6">
            <v-col cols="12" class="text-center">
              <v-icon size="64" color="grey-lighten-1" class="mb-4">
                mdi-file-document-outline
              </v-icon>
              <p class="text-h6 text-grey-darken-1 mb-2">Nenhum ditado cadastrado</p>
              <p class="text-body-2 text-grey-darken-2 mb-4">
                Crie seu primeiro ditado clicando no botão acima
              </p>
              <v-btn
                color="primary"
                to="/cadastro-ditado"
                prepend-icon="mdi-plus"
                class="text-none"
              >
                Criar Ditado
              </v-btn>
            </v-col>
          </v-row>
        </template>
      </v-data-table>

      <div v-else class="pa-6 text-center">
        <v-icon size="64" color="grey-lighten-1" class="mb-4">
          mdi-magnify
        </v-icon>
        <p class="text-h6 text-grey-darken-1 mb-2">Nenhum ditado encontrado</p>
        <p class="text-body-2 text-grey-darken-2">
          Tente ajustar os filtros de busca
        </p>
      </div>
    </v-card>

    <v-dialog v-model="dialogAtribuirTurma" max-width="500" persistent>
      <v-card>
        <v-card-title class="bg-primary text-white pa-4">
          <v-icon class="mr-2">mdi-school</v-icon>
          Atribuir Ditado a uma Turma
        </v-card-title>
        <v-card-text class="pa-6">
          <p class="text-body-2 mb-4">
            Ditado: <strong>{{ ditadoSelecionado?.titulo }}</strong>
          </p>
          
          <v-select
            v-model="turmaParaAtribuir"
            :items="turmas"
            item-title="nome"
            item-value="id"
            label="Selecione a turma"
            placeholder="Escolha uma turma"
            variant="outlined"
            density="comfortable"
            hide-details
            class="mb-4"
          />

          <v-text-field
            v-model="dataLimiteAtribuicao"
            type="date"
            label="Data limite para entrega"
            variant="outlined"
            density="comfortable"
            hide-details
          />
        </v-card-text>
        <v-card-actions class="pa-4 bg-grey-lighten-5">
          <v-btn variant="text" @click="fecharDialogAtribuirTurma">
            Cancelar
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            variant="flat"
            :loading="atribuindoTurma"
            :disabled="!turmaParaAtribuir"
            @click="confirmarAtribuicaoTurma"
          >
            Confirmar Atribuição
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3000">
      {{ snackbar.mensagem }}
    </v-snackbar>

    <v-dialog v-model="dialogDelete" max-width="400">
      <v-card>
        <v-card-title class="bg-red-lighten-5 pa-4">
          <v-icon color="error" class="mr-2">mdi-alert</v-icon>
          Confirmar Exclusão
        </v-card-title>
        <v-card-text class="pa-6">
          <p class="text-body-1 mb-2">
            Tem certeza que deseja excluir o ditado <strong>{{ ditadoSelecionado?.titulo }}</strong>?
          </p>
          <p class="text-body-2 text-grey-darken-1">
            Esta ação não pode ser desfeita.
          </p>
        </v-card-text>
        <v-card-actions class="pa-4 bg-grey-lighten-5">
          <v-btn
            variant="text"
            @click="dialogDelete = false"
          >
            Cancelar
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn
            color="error"
            variant="flat"
            :loading="deletando"
            @click="confirmarDelecao"
          >
            Excluir
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ditadoService } from '@/services/ditadoService'
import { categoriaService } from '@/services/categoriaService'
import { turmaService } from '@/services/turmaService'

const router = useRouter()
const authStore = useAuthStore()

// --- ESTADOS ---

// Tabela de Ditados Cadastrados
const ditados = ref([])
const ditadosFiltrados = ref([])
const carregando = ref(false)
const pesquisa = ref('')
const filtroCategoria = ref([])
const ditadoSelecionado = ref(null)
const dialogDelete = ref(false)
const deletando = ref(false)

// Tabela de Ditados Atribuídos (NOVO)
const ditadosAtribuidos = ref([])
const carregandoAtribuidos = ref(false)

// Auxiliares
const categorias = ref([])
const turmas = ref([])
const dialogAtribuirTurma = ref(false)
const turmaParaAtribuir = ref(null)
const dataLimiteAtribuicao = ref('')
const atribuindoTurma = ref(false)

const snackbar = ref({
  show: false,
  mensagem: '',
  color: 'success'
})

// --- DEFINIÇÃO DE COLUNAS (HEADERS) ---

const headers = [
  { title: 'Título', key: 'titulo', sortable: true },
  { title: 'Descrição', key: 'descricao' },
  { title: 'Categorias', key: 'categorias' },
  { title: 'Palavras Omitidas', key: 'palavrasOmitidas', align: 'center' },
  { title: 'Data de Criação', key: 'dataCriacao', sortable: true },
  { title: 'Ações', key: 'acoes', align: 'end', sortable: false }
]

const headersAtribuidos = [
  { title: 'Turma', key: 'turmaNome' },
  { title: 'Ditado', key: 'ditadoTitulo' },
  { title: 'Prazo', key: 'dataLimite', align: 'center' },
  { title: 'Status', key: 'vencido', align: 'center' },
  { title: 'Engajamento', key: 'percentualConclusao', align: 'center', minWidth: '150px' },
  { title: 'Média da Turma', key: 'notaMedia', align: 'center' },
  { title: 'Detalhes', key: 'acoes', align: 'center', sortable: false }
]

// --- INICIALIZAÇÃO ---

onMounted(async () => {
  await Promise.all([
    carregarDitados(), 
    carregarDitadosAtribuidos(),
    carregarCategorias(), 
    carregarTurmas()
  ])
})

// --- CARREGAMENTO DE DADOS ---

async function carregarCategorias() {
  try {
    categorias.value = await categoriaService.listarTodas()
  } catch (erro) {
    console.error('Erro ao carregar categorias:', erro)
  }
}

async function carregarDitados() {
  carregando.value = true
  try {
    const dados = await ditadoService.listarTodos()
    ditados.value = dados
    filtrarDitados()
  } catch (erro) {
    console.error('Erro ao carregar ditados:', erro)
    mostrarSnackbar('Erro ao carregar ditados', 'error')
  } finally {
    carregando.value = false
  }
}

async function carregarDitadosAtribuidos() {
  carregandoAtribuidos.value = true
  try {
    // Busca apenas os ditados que EU atribuí recentemente
    const dados = await ditadoService.listarMeusDitadosAtribuidos()
    ditadosAtribuidos.value = dados
  } catch (erro) {
    console.error('Erro ao carregar ditados atribuídos:', erro)
  } finally {
    carregandoAtribuidos.value = false
  }
}

async function carregarTurmas() {
  try {
    const dados = await turmaService.listarTodas(true) // apenas ativas
    turmas.value = dados || []
  } catch (erro) {
    console.error('Erro ao carregar turmas:', erro)
    turmas.value = []
  }
}

// --- LÓGICA DE NEGÓCIO ---

function filtrarDitados() {
  let resultado = [...ditados.value]

  // Filtro de Texto
  if (pesquisa.value.trim()) {
    const termo = pesquisa.value.toLowerCase()
    resultado = resultado.filter(d =>
      d.titulo.toLowerCase().includes(termo) ||
      (d.descricao && d.descricao.toLowerCase().includes(termo))
    )
  }

  // Filtro de Categoria
  if (filtroCategoria.value.length > 0) {
    resultado = resultado.filter(ditado =>
      ditado.categorias &&
      filtroCategoria.value.every(catId => 
        ditado.categorias.some(cat => cat.id === catId)
      )
    )
  }

  // Ordenação Padrão (Mais recentes primeiro)
  resultado.sort((a, b) => new Date(b.dataCriacao) - new Date(a.dataCriacao))

  ditadosFiltrados.value = resultado
}

function podeDelete(ditado) {
  if (authStore.ehAdministrador) return true
  return ditado.autorId === authStore.usuario?.id
}

function deletarDitado(ditado) {
  ditadoSelecionado.value = ditado
  dialogDelete.value = true
}

async function confirmarDelecao() {
  deletando.value = true
  try {
    // Em produção: await ditadoService.deletar(ditadoSelecionado.value.id)
    ditados.value = ditados.value.filter(d => d.id !== ditadoSelecionado.value.id)
    filtrarDitados()
    mostrarSnackbar('Ditado excluído com sucesso!', 'success')
    dialogDelete.value = false
  } catch (erro) {
    console.error('Erro ao deletar ditado:', erro)
    mostrarSnackbar('Erro ao excluir ditado', 'error')
  } finally {
    deletando.value = false
    ditadoSelecionado.value = null
  }
}

// --- AUXILIARES VISUAIS ---

function formatarData(data) {
  if (!data) return '-'
  return new Date(data).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

function getNomeCategoriaById(categoriaId) {
  const categoria = categorias.value.find(c => c.id === categoriaId)
  return categoria ? categoria.nome : 'Desconhecida'
}

function removerFiltroCategoria(categoriaId) {
  filtroCategoria.value = filtroCategoria.value.filter(id => id !== categoriaId)
  filtrarDitados()
}

// Contagem de palavras omitidas (Texto ou Descrição)
function calcularPalavrasOmitidas(ditado) {
  const textoParaAnalisar = ditado.textoComMarcacoes || ditado.descricao || '';
  if (!textoParaAnalisar) return ditado.palavrasOmitidas || 0;
  const matches = textoParaAnalisar.match(/\[([^\]]+)\]/g);
  return matches ? matches.length : 0;
}

function obterCorNota(nota) {
  if (nota >= 80) return 'success'
  if (nota >= 60) return 'warning'
  return 'error'
}

function getCorProgresso(percentual) {
  if (percentual >= 80) return 'success'
  if (percentual >= 40) return 'primary'
  return 'warning'
}

function verResultadosTurma(item) {
  router.push({
    name: "ResultadosDitadoProfessor",
    params: {
      turmaId: item.turmaId,
      ditadoId: item.ditadoId,
    },
  });
}

// --- DIALOGS E FEEDBACK ---

function abrirDialogAtribuirTurma(ditado) {
  ditadoSelecionado.value = ditado
  turmaParaAtribuir.value = null
  dataLimiteAtribuicao.value = ''
  dialogAtribuirTurma.value = true
}

function fecharDialogAtribuirTurma() {
  dialogAtribuirTurma.value = false
  ditadoSelecionado.value = null
  turmaParaAtribuir.value = null
  dataLimiteAtribuicao.value = ''
}

async function confirmarAtribuicaoTurma() {
  if (!ditadoSelecionado.value || !turmaParaAtribuir.value) {
    mostrarSnackbar('Selecione um ditado e uma turma', 'warning')
    return
  }

  atribuindoTurma.value = true
  try {
    // Converter data para formato ISO se foi fornecida e não está vazia
    let dataLimite = null
    if (dataLimiteAtribuicao.value && dataLimiteAtribuicao.value.trim() !== '') {
      dataLimite = new Date(dataLimiteAtribuicao.value).toISOString()
    }
    
    await turmaService.atribuirDitado(turmaParaAtribuir.value, ditadoSelecionado.value.id, dataLimite)
    
    // Atualiza a lista de atribuídos na hora
    await carregarDitadosAtribuidos()
    
    mostrarSnackbar(`Ditado atribuído à turma com sucesso`, 'success')
    fecharDialogAtribuirTurma()
  } catch (erro) {
    console.error('Erro ao atribuir ditado à turma:', erro)
    // Extrai mensagem específica do erro
    const mensagem = erro.message || 'Erro ao atribuir ditado à turma'
    mostrarSnackbar(mensagem, 'error')
  } finally {
    atribuindoTurma.value = false
  }
}

function mostrarSnackbar(mensagem, cor = 'success') {
  snackbar.value = { show: true, mensagem, color: cor }
}
</script>

<style scoped>
.gap-2 { gap: 8px; }
.text-truncate { overflow: hidden; text-overflow: ellipsis; }
</style>