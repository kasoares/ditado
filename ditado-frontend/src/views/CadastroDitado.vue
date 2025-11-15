<template>
  <div>
    <!-- Header -->
    <v-card class="mb-6" elevation="1">
      <v-card-text class="pa-6">
        <div class="d-flex align-center justify-space-between">
          <div>
            <h1 class="text-h4 font-weight-bold mb-2">Cadastro de Textos</h1>
            <p class="text-body-1 text-grey-darken-1">
              Crie e organize textos para futuras sessões de ditado.
            </p>
          </div>
          <v-btn
            color="primary"
            size="large"
            prepend-icon="mdi-view-list"
            variant="outlined"
            class="text-none"
            @click="voltarParaLista"
          >
            Ver Banco
          </v-btn>
        </div>
      </v-card-text>
    </v-card>

    <!-- Formulário de Cadastro -->
    <v-card elevation="1">
      <v-card-text class="pa-6">
        <v-form ref="formDitado">
          <v-row>
            <!-- Coluna Esquerda - Detalhes da Palavra -->
            <v-col cols="12" md="6">
              <v-card elevation="0" class="border">
                <v-card-title class="bg-grey-lighten-5 pa-4">
                  <v-icon class="mr-2">mdi-text</v-icon>
                  Detalhes do Texto
                </v-card-title>
                <v-card-text class="pa-6">
                  <!-- Título -->
                  <div class="mb-6">
                    <label class="text-body-2 font-weight-bold text-grey-darken-2 mb-2 d-block">
                      Título
                    </label>
                    <v-text-field
                      v-model="formDados.titulo"
                      placeholder="Digite o título do ditado"
                      variant="outlined"
                      density="comfortable"
                      :rules="[regras.obrigatorio]"
                      hide-details="auto"
                    />
                  </div>

                  <!-- Descrição -->
                  <div class="mb-6">
                    <label class="text-body-2 font-weight-bold text-grey-darken-2 mb-2 d-block">
                      Descrição
                    </label>
                    <v-textarea
                      v-model="formDados.descricao"
                      placeholder="Descreva o objetivo ou contexto do ditado"
                      variant="outlined"
                      density="comfortable"
                      rows="3"
                      hide-details="auto"
                    />
                  </div>

                  <!-- Ditado (Texto com Marcações) -->
                  <div class="mb-4">
                    <label class="text-body-2 font-weight-bold text-grey-darken-2 mb-2 d-block">
                      Ditado
                    </label>
                    <v-textarea
                      v-model="formDados.textoComMarcacoes"
                      placeholder="Digite o texto do ditado"
                      variant="outlined"
                      density="comfortable"
                      rows="5"
                      :rules="[regras.obrigatorio]"
                      hide-details="auto"
                    />
                  </div>
                  
                  <!-- Exemplo de uso -->
                  <v-alert type="info" variant="tonal" density="compact">
                    <div class="text-caption">
                      <strong>Como escrever:</strong><br>
                      Use colchetes <code>[ ]</code> para marcar as palavras que serão omitidas.<br>
                      <strong>Exemplo:</strong> O menino foi ao [parque] com seu [cachorro].
                    </div>
                  </v-alert>
                </v-card-text>
              </v-card>
            </v-col>

            <!-- Coluna Direita - Áudio -->
            <v-col cols="12" md="6">
              <v-card elevation="0" class="border">
                <v-card-title class="bg-grey-lighten-5 pa-4">
                  <v-icon class="mr-2">mdi-music</v-icon>
                  Áudio
                </v-card-title>
                <v-card-text class="pa-6">
                  <!-- Upload de áudio -->
                  <div class="mb-6">
                    <v-card
                      elevation="0"
                      class="border-dashed pa-8 text-center"
                      @click="selecionarArquivo"
                      style="cursor: pointer; border: 2px dashed #ccc;"
                    >
                      <v-icon size="64" color="primary" class="mb-4">
                        mdi-file-music-outline
                      </v-icon>
                      <h3 class="text-h6 font-weight-bold mb-2">Upload de áudio (MP3/WAV)</h3>
                      <p class="text-body-2 text-grey-darken-1 mb-4">
                        {{ nomeArquivo || 'Clique para selecionar ou arraste o arquivo aqui' }}
                      </p>
                      <v-btn
                        color="primary"
                        variant="flat"
                        prepend-icon="mdi-upload"
                        class="text-none"
                        @click.stop="selecionarArquivo"
                      >
                        Enviar
                      </v-btn>
                    </v-card>
                    <input
                      ref="inputArquivo"
                      type="file"
                      accept="audio/mp3,audio/wav,audio/mpeg"
                      style="display: none"
                      @change="handleFileUpload"
                    />
                  </div>

                  <!-- Preview do áudio -->
                  <div v-if="audioBase64" class="mb-6">
                    <v-alert type="success" variant="tonal" class="mb-4">
                      <div class="d-flex align-center justify-space-between">
                        <span>Áudio carregado com sucesso!</span>
                        <v-btn
                          icon="mdi-close"
                          size="small"
                          variant="text"
                          @click="removerAudio"
                        />
                      </div>
                    </v-alert>
                    <audio controls class="w-100">
                      <source :src="audioBase64" :type="tipoAudio">
                    </audio>
                  </div>

                  <v-divider class="my-6"></v-divider>

                  <!-- Gravação direta -->
                  <div>
                    <h3 class="text-h6 font-weight-bold mb-4 d-flex align-center">
                      <v-icon class="mr-2">mdi-microphone</v-icon>
                      Gravação direta
                    </h3>
                    <div class="d-flex align-center gap-3 mb-4">
                      <v-btn
                        v-if="!gravando && !audioGravado"
                        color="error"
                        variant="flat"
                        prepend-icon="mdi-microphone"
                        class="text-none"
                        @click="iniciarGravacao"
                      >
                        Iniciar
                      </v-btn>
                      <v-btn
                        v-if="gravando"
                        color="grey"
                        variant="flat"
                        prepend-icon="mdi-stop"
                        class="text-none"
                        @click="pararGravacao"
                      >
                        Parar
                      </v-btn>
                      <v-btn
                        v-if="audioGravado"
                        color="primary"
                        variant="outlined"
                        prepend-icon="mdi-refresh"
                        class="text-none"
                        @click="reiniciarGravacao"
                      >
                        Nova gravação
                      </v-btn>
                      <v-chip v-if="gravando" color="error" variant="flat">
                        <v-icon start>mdi-circle</v-icon>
                        Gravando... {{ tempoGravacao }}s
                      </v-chip>
                    </div>

                    <!-- Audio gravado -->
                    <div v-if="audioGravado">
                      <audio ref="audioGravadoPlayer" controls class="w-100">
                        <source :src="audioGravado" type="audio/webm">
                      </audio>
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <!-- Alerta de erro -->
          <v-alert
            v-if="erroForm"
            type="error"
            class="mt-6"
            variant="tonal"
            closable
            @click:close="erroForm = null"
          >
            {{ erroForm }}
          </v-alert>
        </v-form>
      </v-card-text>

      <v-divider></v-divider>

      <!-- Ações -->
      <v-card-actions class="pa-6 bg-grey-lighten-5">
        <v-btn
          variant="text"
          class="text-none"
          prepend-icon="mdi-close"
          @click="cancelar"
        >
          Cancelar
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          variant="flat"
          size="large"
          class="text-none px-8"
          prepend-icon="mdi-content-save"
          :loading="salvando"
          @click="salvarDitado"
        >
          Salvar Texto
        </v-btn>
      </v-card-actions>
    </v-card>

    <!-- Snackbar -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3000">
      {{ snackbar.mensagem }}
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ditadoService } from '@/services/ditadoService'

const router = useRouter()

const formDitado = ref(null)
const inputArquivo = ref(null)
const audioGravadoPlayer = ref(null)

const formDados = ref({
  titulo: '',
  descricao: '',
  textoComMarcacoes: ''
})

const nomeArquivo = ref('')
const audioBase64 = ref(null)
const tipoAudio = ref('')
const salvando = ref(false)
const erroForm = ref(null)

// Gravação
const gravando = ref(false)
const audioGravado = ref(null)
const tempoGravacao = ref(0)
let mediaRecorder = null
let chunks = []
let intervaloTempo = null

const snackbar = ref({
  show: false,
  mensagem: '',
  color: 'success'
})

const regras = {
  obrigatorio: v => (v !== null && v !== undefined && v !== '') || 'Campo obrigatório'
}

function selecionarArquivo() {
  inputArquivo.value.click()
}

function handleFileUpload(event) {
  const file = event.target.files[0]
  if (!file) return

  // Validar tipo de arquivo
  if (!file.type.match('audio.*')) {
    mostrarSnackbar('Por favor, selecione um arquivo de áudio válido', 'error')
    return
  }

  nomeArquivo.value = file.name
  tipoAudio.value = file.type

  // Converter para base64
  const reader = new FileReader()
  reader.onload = (e) => {
    audioBase64.value = e.target.result
    // Limpar gravação se houver
    audioGravado.value = null
  }
  reader.readAsDataURL(file)
}

function removerAudio() {
  audioBase64.value = null
  nomeArquivo.value = ''
  tipoAudio.value = ''
  if (inputArquivo.value) {
    inputArquivo.value.value = ''
  }
}

async function iniciarGravacao() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    mediaRecorder = new MediaRecorder(stream)
    chunks = []

    mediaRecorder.ondataavailable = (e) => {
      chunks.push(e.data)
    }

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'audio/webm' })
      const reader = new FileReader()
      reader.onload = () => {
        audioGravado.value = reader.result
        // Limpar upload se houver
        removerAudio()
      }
      reader.readAsDataURL(blob)

      // Parar todas as tracks
      stream.getTracks().forEach(track => track.stop())
    }

    mediaRecorder.start()
    gravando.value = true
    tempoGravacao.value = 0

    // Contador de tempo
    intervaloTempo = setInterval(() => {
      tempoGravacao.value++
    }, 1000)
  } catch (erro) {
    console.error('Erro ao acessar microfone:', erro)
    mostrarSnackbar('Erro ao acessar o microfone. Verifique as permissões.', 'error')
  }
}

function pararGravacao() {
  if (mediaRecorder && gravando.value) {
    mediaRecorder.stop()
    gravando.value = false
    clearInterval(intervaloTempo)
  }
}

function reiniciarGravacao() {
  audioGravado.value = null
  tempoGravacao.value = 0
  iniciarGravacao()
}

async function salvarDitado() {
  const { valid } = await formDitado.value.validate()
  if (!valid) {
    mostrarSnackbar('Por favor, preencha todos os campos obrigatórios', 'warning')
    return
  }

  // Validar campos obrigatórios manualmente
  if (!formDados.value.titulo || !formDados.value.textoComMarcacoes) {
    mostrarSnackbar('Por favor, preencha o título e o ditado', 'warning')
    return
  }

  // Validar se há áudio
  if (!audioBase64.value && !audioGravado.value) {
    mostrarSnackbar('Por favor, adicione um áudio (upload ou gravação)', 'warning')
    return
  }

  salvando.value = true
  erroForm.value = null

  try {
    // Preparar dados para envio
    const audioParaEnviar = audioGravado.value || audioBase64.value
    
    // Extrair apenas a string base64 (remover o prefixo data:audio/...)
    const base64Audio = audioParaEnviar.split(',')[1]

    const dados = {
      titulo: formDados.value.titulo,
      descricao: formDados.value.descricao || '',
      textoComMarcacoes: formDados.value.textoComMarcacoes,
      audioBase64: base64Audio
    }

    await ditadoService.criar(dados)
    mostrarSnackbar('Ditado cadastrado com sucesso!', 'success')
    
    setTimeout(() => {
      voltarParaLista()
    }, 1500)
  } catch (erro) {
    console.error('Erro ao salvar ditado:', erro.response?.data || erro)
    
    if (erro.response?.data?.errors) {
      const erros = erro.response.data.errors
      const mensagensErro = Object.values(erros).flat().join(', ')
      erroForm.value = mensagensErro
    } else {
      erroForm.value = erro.response?.data?.message || erro.response?.data?.title || 'Erro ao salvar ditado'
    }
    
    mostrarSnackbar('Erro ao salvar ditado', 'error')
  } finally {
    salvando.value = false
  }
}

function cancelar() {
  if (confirm('Deseja realmente cancelar? Todas as alterações serão perdidas.')) {
    voltarParaLista()
  }
}

function voltarParaLista() {
  router.push('/professor')
}

function mostrarSnackbar(mensagem, cor = 'success') {
  snackbar.value = {
    show: true,
    mensagem,
    color: cor
  }
}

// Cleanup
onUnmounted(() => {
  if (gravando.value) {
    pararGravacao()
  }
  if (intervaloTempo) {
    clearInterval(intervaloTempo)
  }
})
</script>

<style scoped>
.gap-3 {
  gap: 12px;
}

.border {
  border: 1px solid #e0e0e0;
}

.border-dashed {
  border-style: dashed !important;
}

.w-100 {
  width: 100%;
}
</style>
