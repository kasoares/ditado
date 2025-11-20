<template>
  <div class="resultado-ditado">
    <!-- Header -->
    <v-app-bar elevation="0" color="white" height="70" class="border-b">
      <v-container class="d-flex align-center justify-space-between">
        <div class="d-flex align-center">
          <v-icon size="24" class="mr-2">mdi-check-circle</v-icon>
          <span class="text-h6 font-weight-bold">Resultado do Ditado</span>
        </div>
        
        <v-btn
          variant="flat"
          color="primary"
          prepend-icon="mdi-home"
          class="text-none"
          @click="voltarParaInicio"
        >
          Voltar ao início
        </v-btn>
      </v-container>
    </v-app-bar>

    <!-- Conteúdo -->
    <v-container class="py-12">
      <!-- Loading -->
      <div v-if="carregando" class="text-center py-12">
        <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
        <p class="text-grey mt-4">Carregando resultado...</p>
      </div>

      <v-card v-else elevation="1" class="text-center pa-12">
        <v-icon size="120" :color="corResultado" class="mb-6">
          {{ iconeResultado }}
        </v-icon>
        
        <h1 class="text-h3 font-weight-bold mb-4">
          {{ pontuacao }}%
        </h1>
        
        <h2 class="text-h5 font-weight-bold mb-6">
          {{ mensagemResultado }}
        </h2>

        <v-row class="mb-8">
          <v-col cols="12" md="4">
            <v-card elevation="2" color="info-lighten-5">
              <v-card-text class="pa-6">
                <v-icon size="48" color="info" class="mb-3">mdi-file-document</v-icon>
                <h3 class="text-h4 font-weight-bold mb-2">{{ totalLacunas }}</h3>
                <p class="text-body-1 mb-0">Total de lacunas</p>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" md="4">
            <v-card elevation="2" color="success-lighten-5">
              <v-card-text class="pa-6">
                <v-icon size="48" color="success" class="mb-3">mdi-check-circle</v-icon>
                <h3 class="text-h4 font-weight-bold mb-2">{{ acertos }}</h3>
                <p class="text-body-1 mb-0">Acertos</p>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" md="4">
            <v-card elevation="2" color="error-lighten-5">
              <v-card-text class="pa-6">
                <v-icon size="48" color="error" class="mb-3">mdi-close-circle</v-icon>
                <h3 class="text-h4 font-weight-bold mb-2">{{ erros }}</h3>
                <p class="text-body-1 mb-0">Erros</p>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <v-btn
          color="primary"
          size="x-large"
          variant="flat"
          prepend-icon="mdi-home"
          class="text-none"
          @click="voltarParaInicio"
        >
          Voltar ao painel
        </v-btn>
      </v-card>

      <!-- Detalhes das Respostas -->
      <v-card v-if="!carregando && detalhes.length > 0" elevation="1" class="mt-6">
        <v-card-title class="pa-6 bg-grey-lighten-5">
          <v-icon class="mr-2">mdi-format-list-bulleted</v-icon>
          Detalhes das Respostas
        </v-card-title>
        <v-card-text class="pa-6">
          <v-list>
            <v-list-item 
              v-for="(detalhe, index) in detalhes" 
              :key="index" 
              class="mb-3 pa-4 rounded"
              :class="detalhe.correto ? 'bg-success-lighten-5' : 'bg-error-lighten-5'"
            >
              <template v-slot:prepend>
                <v-avatar :color="detalhe.correto ? 'success' : 'error'" size="40">
                  <v-icon color="white" size="24">
                    {{ detalhe.correto ? 'mdi-check' : 'mdi-close' }}
                  </v-icon>
                </v-avatar>
              </template>
              
              <v-list-item-title class="mb-2">
                <span class="text-body-2 text-grey-darken-1">Sua resposta:</span>
                <span 
                  class="text-h6 font-weight-bold ml-2" 
                  :class="detalhe.correto ? 'text-success-darken-2' : 'text-error-darken-2'"
                >
                  {{ detalhe.respostaFornecida || '(vazio)' }}
                </span>
              </v-list-item-title>
              
              <v-list-item-subtitle v-if="!detalhe.correto" class="mt-1">
                <span class="text-body-2">Resposta correta:</span>
                <span class="text-h6 font-weight-bold text-success-darken-2 ml-2">
                  {{ detalhe.respostaEsperada }}
                </span>
                <v-chip 
                  v-if="detalhe.tipoErro" 
                  size="small" 
                  color="error" 
                  variant="outlined"
                  class="ml-2"
                >
                  {{ detalhe.tipoErro }}
                </v-chip>
              </v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-card-text>
      </v-card>
    </v-container>

    <!-- Snackbar -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3000">
      {{ snackbar.mensagem }}
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ditadoService } from '@/services/ditadoService'

const router = useRouter()
const route = useRoute()

const carregando = ref(true)
const pontuacao = ref(0)
const totalLacunas = ref(0)
const acertos = ref(0)
const erros = ref(0)
const detalhes = ref([])

const snackbar = ref({
  show: false,
  mensagem: '',
  color: 'success'
})

const corResultado = computed(() => {
  if (pontuacao.value >= 80) return 'success'
  if (pontuacao.value >= 60) return 'warning'
  return 'error'
})

const iconeResultado = computed(() => {
  if (pontuacao.value >= 80) return 'mdi-trophy'
  if (pontuacao.value >= 60) return 'mdi-medal'
  return 'mdi-emoticon-sad'
})

const mensagemResultado = computed(() => {
  if (pontuacao.value >= 80) return 'Excelente trabalho!'
  if (pontuacao.value >= 60) return 'Bom trabalho! Continue praticando.'
  return 'Continue praticando!'
})

onMounted(async () => {
  await carregarResultado()
})

async function carregarResultado() {
  carregando.value = true
  try {
    // Tentar obter resultado do state (passado pela tela anterior)
    let resultado = history.state?.resultado
    
    // Se não tiver no state, buscar da API (fallback)
    if (!resultado) {
      const respostaDitadoId = route.params.id
      if (respostaDitadoId && respostaDitadoId !== 'resultado') {
        resultado = await ditadoService.buscarResultado(respostaDitadoId)
      } else {
        throw new Error('Resultado não encontrado')
      }
    }
    
    // Processar detalhes das respostas
    if (resultado.detalhes && Array.isArray(resultado.detalhes)) {
      detalhes.value = resultado.detalhes.map(resp => {
        // Comparar respostas (ignorando case e espaços)
        const respostaFornecida = (resp.respostaFornecida || '').trim().toLowerCase()
        const respostaEsperada = (resp.respostaEsperada || '').trim().toLowerCase()
        const estaCorreto = respostaFornecida === respostaEsperada
        
        return {
          segmentoId: resp.segmentoId,
          respostaFornecida: resp.respostaFornecida,
          respostaEsperada: resp.respostaEsperada,
          correto: estaCorreto,
          tipoErro: !estaCorreto && resp.tipoErro ? resp.tipoErro : null
        }
      })
      
      // Calcular estatísticas no frontend
      totalLacunas.value = detalhes.value.length
      acertos.value = detalhes.value.filter(d => d.correto).length
      erros.value = detalhes.value.filter(d => !d.correto).length
      pontuacao.value = totalLacunas.value > 0 
        ? Math.round((acertos.value / totalLacunas.value) * 100) 
        : 0
    } else {
      // Se API já forneceu os valores calculados, usar eles
      pontuacao.value = resultado.pontuacao || 0
      acertos.value = resultado.acertos || 0
      erros.value = resultado.erros || 0
      totalLacunas.value = resultado.totalLacunas || (acertos.value + erros.value)
    }
  } catch (erro) {
    console.error('Erro ao carregar resultado:', erro)
    mostrarSnackbar('Erro ao carregar resultado do ditado', 'error')
    // Redirecionar de volta após erro
    setTimeout(() => router.push('/aluno'), 3000)
  } finally {
    carregando.value = false
  }
}

function voltarParaInicio() {
  router.push('/aluno')
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
.resultado-ditado {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.border-b {
  border-bottom: 1px solid #e0e0e0;
}
</style>
