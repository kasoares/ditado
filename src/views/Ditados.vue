<template>
  <div>
    <!-- Header -->
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

    <!-- Filtro e Busca -->
    <v-card class="mb-6" elevation="1">
      <v-card-text class="pa-6">
            <v-text-field
              v-model="pesquisa"
              prepend-inner-icon="mdi-magnify"
              placeholder="Filtrar ditados"
              variant="outlined"
              density="comfortable"
              @update:model-value="filtrarDitados"
              clearable
              hide-details
            />
      </v-card-text>
    </v-card>

    <!-- Tabela de Ditados -->
    <v-card elevation="1">
      <v-card-title class="bg-grey-lighten-5 pa-4">
        <v-icon class="mr-2">mdi-file-document</v-icon>
        Ditados Cadastrados
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

        <template v-slot:item.palavrasOmitidas="{ item }">
          <v-chip color="primary" variant="flat">
            {{ calcularPalavrasOmitidas(item) }}
          </v-chip>
        </template>

        <template v-slot:item.dataCriacao="{ item }">
          {{ formatarData(item.dataCriacao) }}
        </template>

        <template v-slot:item.acoes="{ item }">
          <div class="d-flex gap-2">
            <v-btn
              icon="mdi-pencil"
              size="small"
              variant="text"
              color="primary"
              @click="editarDitado(item)"
            />
            <v-btn
              icon="mdi-delete"
              size="small"
              variant="text"
              color="error"
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
          mdi-file-document-outline
        </v-icon>
        <p class="text-h6 text-grey-darken-1 mb-2">Nenhum ditado encontrado</p>
        <p class="text-body-2 text-grey-darken-2">
          Nenhum resultado corresponde aos critérios de busca
        </p>
      </div>
    </v-card>

    <!-- Snackbar -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3000">
      {{ snackbar.mensagem }}
    </v-snackbar>

    <!-- Dialog de Confirmação de Exclusão -->
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
import { ditadoService } from '@/services/ditadoService'

const router = useRouter()

const ditados = ref([])
const ditadosFiltrados = ref([])
const carregando = ref(false)
const pesquisa = ref('')
const ordenacao = ref('recentes')
const ditadoSelecionado = ref(null)
const dialogDelete = ref(false)
const deletando = ref(false)

const snackbar = ref({
  show: false,
  mensagem: '',
  color: 'success'
})

const headers = [
  { title: 'Título', key: 'titulo', sortable: true },
  { title: 'Descrição', key: 'descricao' },
  { title: 'Palavras Omitidas', key: 'palavrasOmitidas', align: 'center' },
  { title: 'Data de Criação', key: 'dataCriacao', sortable: true },
  { title: 'Ações', key: 'acoes', sortable: false }
]

const opcoesOrdenacao = [
  { title: 'Mais Recentes', value: 'recentes' },
  { title: 'Mais Antigos', value: 'antigos' },
  { title: 'A-Z', value: 'alfabetico' },
  { title: 'Z-A', value: 'alfabetico-inv' }
]

const computedCarregando = computed(() => carregando.value)

onMounted(async () => {
  await carregarDitados()
})

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

function filtrarDitados() {
  let resultado = [...ditados.value]

  // Aplicar pesquisa
  if (pesquisa.value.trim()) {
    const termo = pesquisa.value.toLowerCase()
    resultado = resultado.filter(d =>
      d.titulo.toLowerCase().includes(termo) ||
      (d.descricao && d.descricao.toLowerCase().includes(termo))
    )
  }

  // Aplicar ordenação
  switch (ordenacao.value) {
    case 'recentes':
      resultado.sort((a, b) => new Date(b.dataCriacao) - new Date(a.dataCriacao))
      break
    case 'antigos':
      resultado.sort((a, b) => new Date(a.dataCriacao) - new Date(b.dataCriacao))
      break
    case 'alfabetico':
      resultado.sort((a, b) => a.titulo.localeCompare(b.titulo))
      break
    case 'alfabetico-inv':
      resultado.sort((a, b) => b.titulo.localeCompare(a.titulo))
      break
  }

  ditadosFiltrados.value = resultado
}

function editarDitado(ditado) {
  // Redirecionar para edição
  router.push(`/editar-ditado/${ditado.id}`)
}

function deletarDitado(ditado) {
  ditadoSelecionado.value = ditado
  dialogDelete.value = true
}

async function confirmarDelecao() {
  deletando.value = true
  try {
    // Chamada ao serviço seria: await ditadoService.deletar(ditadoSelecionado.value.id)
    // Por enquanto, apenas removemos da lista local
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

function formatarData(data) {
  return new Date(data).toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

function calcularPalavrasOmitidas(ditado) {
  if (!ditado.textoComMarcacoes) {
    return ditado.palavrasOmitidas || 0
  }
  // Contar as palavras entre colchetes [palavra]
  const matches = ditado.textoComMarcacoes.match(/\[([^\]]+)\]/g)
  return matches ? matches.length : (ditado.palavrasOmitidas || 0)
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
.gap-2 {
  gap: 8px;
}

.text-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
