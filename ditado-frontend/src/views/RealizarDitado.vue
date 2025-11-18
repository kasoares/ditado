<template>
  <div class="realizar-ditado">
    <!-- Header -->
    <v-app-bar elevation="0" color="white" height="70" class="border-b">
      <v-container class="d-flex align-center justify-space-between">
        <div class="d-flex align-center">
          <v-icon size="24" class="mr-2">mdi-headphones</v-icon>
          <span class="text-h6 font-weight-bold">Sessão de Ditado • Aluno</span>
        </div>
        
        <div class="d-flex align-center gap-4">
          <v-btn variant="text" class="text-none">Perfis</v-btn>
          <v-btn variant="text" class="text-none">Sessões</v-btn>
          <v-btn variant="text" class="text-none">Resultados</v-btn>
          <v-btn
            variant="text"
            prepend-icon="mdi-exit-to-app"
            color="error"
            class="text-none"
            @click="sairDitado"
          >
            Sair
          </v-btn>
        </div>
      </v-container>
    </v-app-bar>

    <!-- Loading -->
    <v-container v-if="carregando" class="py-12">
      <div class="text-center">
        <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
        <p class="text-grey mt-4">Carregando ditado...</p>
      </div>
    </v-container>

    <!-- Conteúdo Principal -->
    <v-container v-else class="py-8">
      <!-- Título e Informações -->
      <v-card class="mb-6" elevation="1">
        <v-card-text class="pa-6">
          <div class="d-flex align-center justify-between mb-4">
            <div>
              <h1 class="text-h4 font-weight-bold mb-2">{{ ditado?.titulo }}</h1>
              <p class="text-body-1 text-grey-darken-1">
                Ouça as palavras e digite nos espaços vazios. Depois, clique em Submeter.
              </p>
            </div>
            <div class="d-flex align-center gap-4">
              <v-chip color="success" size="large" variant="flat">
                <v-avatar start>
                  <v-icon>mdi-account</v-icon>
                </v-avatar>
                {{ authStore.usuario?.nome?.split(' ')[0] }} • 
                {{ turma || '-' }}
              </v-chip>
              <v-chip color="info" size="large" variant="flat">
                <v-icon start>mdi-clock-outline</v-icon>
                Tempo estimado {{ tempoEstimado || '5-7' }} min
              </v-chip>
            </div>
          </div>
        </v-card-text>
      </v-card>

      <!-- Área de Áudio e Controles -->
      <v-card class="mb-6" elevation="1" color="green-lighten-5">
        <v-card-text class="pa-6">
          <div class="d-flex align-center justify-between">
            <div class="d-flex align-center gap-3">
              <v-icon size="32" color="green-darken-2">mdi-volume-high</v-icon>
              <span class="text-h6 font-weight-bold">Ouça a palavra atual</span>
            </div>
            <div class="d-flex align-center gap-2">
              <v-btn
                color="success"
                variant="flat"
                prepend-icon="mdi-refresh"
                class="text-none"
                @click="tocarAudio"
                :disabled="!audioBase64"
              >
                Repetir
              </v-btn>
            </div>
          </div>
        </v-card-text>
      </v-card>

      <!-- Texto do Ditado -->
      <v-card class="mb-6" elevation="1">
        <v-card-text class="pa-8">
          <div class="text-ditado">
            <template v-for="(segmento, index) in segmentos" :key="index">
              <!-- Texto fixo (segmentos sem segmentoId) -->
              <span v-if="segmento.segmentoId === null || segmento.segmentoId === undefined" class="texto-fixo">
                {{ segmento.conteudo }}
              </span>
              
              <!-- Lacuna para preenchimento (segmentos com segmentoId) -->
              <span v-else class="lacuna-container">
                <input
                  v-model="respostas[segmento.segmentoId]"
                  type="text"
                  class="lacuna-input"
                  :placeholder="`palavra ${segmento.ordem}`"
                  @input="verificarPreenchimento"
                />
              </span>
            </template>
          </div>

          <!-- Info de preenchimento -->
          <v-alert
            v-if="!todasPreenchidas"
            type="info"
            variant="tonal"
            density="compact"
            class="mt-6"
          >
            <v-icon start>mdi-information</v-icon>
            Você pode ouvir quantas vezes precisar.
          </v-alert>
        </v-card-text>
      </v-card>

      <!-- Ações -->
      <v-card elevation="1" class="mb-6">
        <v-card-actions class="pa-6 justify-space-between">
          <v-btn
            color="grey"
            variant="outlined"
            prepend-icon="mdi-eraser"
            class="text-none"
            @click="limparCampos"
          >
            Limpar campos
          </v-btn>
          <v-btn
            color="primary"
            variant="flat"
            size="large"
            prepend-icon="mdi-send"
            class="text-none px-8"
            :disabled="!todasPreenchidas"
            :loading="submetendo"
            @click="submeterRespostas"
          >
            Submeter respostas
          </v-btn>
        </v-card-actions>
      </v-card>

      <!-- Dicas de Ortografia -->
      <v-card v-if="ditado?.descricao" elevation="1">
        <v-card-title class="pa-4 bg-grey-lighten-5">
          <v-icon class="mr-2">mdi-lightbulb-on</v-icon>
          Dicas de ortografia
        </v-card-title>
        <v-card-text class="pa-6">
          <p class="text-body-1 mb-0">{{ ditado.descricao }}</p>
        </v-card-text>
      </v-card>
    </v-container>

    <!-- Áudio oculto -->
    <audio ref="audioPlayer" style="display: none" controls>
      <source v-if="audioBase64" :src="audioBase64" type="audio/mpeg">
      <source v-if="audioBase64" :src="audioBase64" type="audio/wav">
      <source v-if="audioBase64" :src="audioBase64" type="audio/webm">
    </audio>

    <!-- Snackbar -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3000">
      {{ snackbar.mensagem }}
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ditadoService } from '@/services/ditadoService'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const audioPlayer = ref(null)
const ditado = ref(null)
const segmentos = ref([])
const respostas = ref({})
const carregando = ref(false)
const submetendo = ref(false)
const audioBase64 = ref(null)

// Campos opcionais (ainda não implementados no backend)
const turma = ref('')
const tempoEstimado = ref('')

const snackbar = ref({
  show: false,
  mensagem: '',
  color: 'success'
})

const todasPreenchidas = computed(() => {
  const lacunas = segmentos.value.filter(s => s.segmentoId !== null && s.segmentoId !== undefined)
  if (lacunas.length === 0) return false
  
  return lacunas.every(lacuna => {
    const resposta = respostas.value[lacuna.segmentoId]
    return resposta && resposta.trim() !== ''
  })
})

onMounted(() => {
  carregarDitado()
})

onUnmounted(() => {
  // Parar áudio se estiver tocando
  if (audioPlayer.value) {
    audioPlayer.value.pause()
    audioPlayer.value.currentTime = 0
  }
})

async function carregarDitado() {
  carregando.value = true
  try {
    const id = route.params.id
    const dados = await ditadoService.buscarParaRealizar(id)
    
    console.log('Dados do ditado:', dados)
    
    ditado.value = dados
    segmentos.value = dados.segmentos || []
    
    // Converter base64 para data URL se necessário
    if (dados.audioBase64) {
      // Verificar se já tem o prefixo data:
      if (dados.audioBase64.startsWith('data:')) {
        audioBase64.value = dados.audioBase64
      } else {
        // Tentar diferentes formatos de áudio
        audioBase64.value = `data:audio/mpeg;base64,${dados.audioBase64}`
      }
      
      console.log('Áudio configurado, primeiros caracteres:', audioBase64.value.substring(0, 50))
    }
    
    // Inicializar respostas apenas para segmentos com segmentoId
    segmentos.value
      .filter(s => s.segmentoId !== null && s.segmentoId !== undefined)
      .forEach(lacuna => {
        respostas.value[lacuna.segmentoId] = ''
      })
    
    console.log('Segmentos processados:', segmentos.value)
    console.log('Respostas inicializadas:', Object.keys(respostas.value))
  } catch (erro) {
    console.error('Erro ao carregar ditado:', erro)
    mostrarSnackbar('Erro ao carregar ditado', 'error')
    setTimeout(() => router.push('/aluno'), 2000)
  } finally {
    carregando.value = false
  }
}

function tocarAudio() {
  if (audioPlayer.value && audioBase64.value) {
    console.log('Tentando tocar áudio...')
    audioPlayer.value.load() // Recarregar o áudio
    audioPlayer.value.play()
      .then(() => {
        console.log('Áudio tocando com sucesso')
      })
      .catch(erro => {
        console.error('Erro ao tocar áudio:', erro)
        mostrarSnackbar('Erro ao reproduzir áudio. Verifique se o formato é válido.', 'error')
      })
  } else {
    console.error('Player ou áudio não disponível')
    mostrarSnackbar('Áudio não disponível', 'error')
  }
}

function verificarPreenchimento() {
  // Método chamado a cada digitação para atualizar o estado
}

function limparCampos() {
  Object.keys(respostas.value).forEach(key => {
    respostas.value[key] = ''
  })
  mostrarSnackbar('Campos limpos', 'info')
}

async function submeterRespostas() {
  if (!todasPreenchidas.value) {
    mostrarSnackbar('Por favor, preencha todas as lacunas', 'warning')
    return
  }

  submetendo.value = true
  try {
    const id = route.params.id
    
    // Preparar respostas no formato esperado pela API
    const respostasArray = Object.entries(respostas.value).map(([segmentoId, resposta]) => ({
      segmentoId: parseInt(segmentoId),
      resposta: resposta.trim()
    }))

    const resultado = await ditadoService.submeterResposta(id, respostasArray)
    
    mostrarSnackbar('Respostas submetidas com sucesso!', 'success')
    
    // Redirecionar para página de resultado (a ser criada)
    setTimeout(() => {
      router.push({
        name: 'ResultadoDitado',
        params: { id: resultado.respostaDitadoId }
      })
    }, 1500)
  } catch (erro) {
    console.error('Erro ao submeter respostas:', erro)
    
    if (erro.response?.data?.errors) {
      const erros = erro.response.data.errors
      const mensagensErro = Object.values(erros).flat().join(', ')
      mostrarSnackbar(mensagensErro, 'error')
    } else {
      mostrarSnackbar('Erro ao submeter respostas', 'error')
    }
  } finally {
    submetendo.value = false
  }
}

function sairDitado() {
  if (confirm('Deseja realmente sair? Seu progresso será perdido.')) {
    router.push('/aluno')
  }
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
.realizar-ditado {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.border-b {
  border-bottom: 1px solid #e0e0e0;
}

.gap-4 {
  gap: 16px;
}

.gap-3 {
  gap: 12px;
}

.gap-2 {
  gap: 8px;
}

.text-ditado {
  font-size: 1.25rem;
  line-height: 2.5;
  color: #424242;
  font-weight: 400;
}

.texto-fixo {
  color: #616161;
}

.lacuna-container {
  display: inline-block;
  margin: 0 4px;
}

.lacuna-input {
  border: none;
  border-bottom: 2px solid #1976d2;
  background-color: transparent;
  padding: 4px 8px;
  font-size: 1.25rem;
  font-weight: 500;
  color: #000;
  min-width: 120px;
  text-align: center;
  outline: none;
  transition: border-color 0.3s;
}

.lacuna-input:focus {
  border-bottom-color: #1565c0;
  background-color: #e3f2fd;
}

.lacuna-input::placeholder {
  color: #9e9e9e;
  font-weight: 400;
  font-size: 1rem;
}
</style>
