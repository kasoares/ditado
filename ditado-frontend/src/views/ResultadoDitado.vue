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
      <v-card elevation="1" class="text-center pa-12">
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

      <!-- Detalhes (implementação futura) -->
      <v-card v-if="detalhes.length > 0" elevation="1" class="mt-6">
        <v-card-title class="pa-6 bg-grey-lighten-5">
          <v-icon class="mr-2">mdi-format-list-bulleted</v-icon>
          Detalhes das Respostas
        </v-card-title>
        <v-card-text class="pa-6">
          <v-list>
            <v-list-item v-for="(detalhe, index) in detalhes" :key="index" class="mb-2">
              <template v-slot:prepend>
                <v-icon :color="detalhe.correto ? 'success' : 'error'">
                  {{ detalhe.correto ? 'mdi-check-circle' : 'mdi-close-circle' }}
                </v-icon>
              </template>
              <v-list-item-title>
                Sua resposta: <strong>{{ detalhe.respostaFornecida }}</strong>
              </v-list-item-title>
              <v-list-item-subtitle v-if="!detalhe.correto">
                Resposta correta: <strong>{{ detalhe.respostaEsperada }}</strong>
                <v-chip v-if="detalhe.tipoErro" size="small" class="ml-2">
                  {{ detalhe.tipoErro }}
                </v-chip>
              </v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-card-text>
      </v-card>
    </v-container>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// Dados mockados - em produção viriam da API
const pontuacao = ref(78)
const totalLacunas = ref(6)
const acertos = ref(5)
const erros = ref(1)
const detalhes = ref([])

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

onMounted(() => {
  // TODO: Buscar resultado real da API
  console.log('ID da resposta:', route.params.id)
})

function voltarParaInicio() {
  router.push('/aluno')
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
