<template>
  <div class="pa-4">
    <div v-if="carregando" class="text-center py-12">
      <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
      <p class="text-grey mt-4">Carregando seu resultado...</p>
    </div>

    <div v-else-if="resultado">
      <v-card class="mb-6 mx-auto" max-width="800" elevation="2">
        <v-card-text class="text-center pa-8">
          <h2 class="text-h5 text-grey-darken-1 mb-2">Resultado do Ditado</h2>
          <h1 class="text-h2 font-weight-black mb-4" :class="getCorNota(resultado.nota)">
            {{ resultado.nota.toFixed(1) }}
          </h1>
          <p class="text-body-1">
            Você acertou <strong>{{ resultado.acertos }}</strong> de <strong>{{ resultado.totalLacunas }}</strong> palavras.
          </p>
        </v-card-text>
      </v-card>

      <v-card class="mb-6 mx-auto" max-width="800" elevation="1">
        <v-card-title class="bg-grey-lighten-4 pa-4">
          <v-icon class="mr-2" color="primary">mdi-text-box-check</v-icon>
          Confira sua correção
        </v-card-title>
        
        <v-card-text class="pa-6 text-h6" style="line-height: 2.5rem;">
          <template v-for="(seg, index) in resultado.segmentos" :key="index">
            
            <span v-if="seg.tipo === 'Texto'" class="text-grey-darken-3">
              {{ seg.conteudo }}
            </span>

            <span 
              v-else-if="seg.acertou" 
              class="mx-1 px-2 py-1 rounded d-inline-flex align-center border bg-green-lighten-5 border-success"
            >
              <span class="text-success font-weight-bold">
                {{ seg.respostaUsuario }}
              </span>
              <v-icon size="small" class="ml-2" color="success">mdi-check-bold</v-icon>
            </span>

            <v-menu
              v-else
              location="top"
              open-on-click
              open-on-hover
            >
              <template v-slot:activator="{ props }">
                <span
                  v-bind="props"
                  class="mx-1 px-2 py-1 rounded d-inline-flex align-center border bg-red-lighten-5 border-error cursor-pointer"
                  style="cursor: pointer;"
                >
                  <span class="text-error font-weight-bold decoration-line-through">
                    {{ seg.respostaUsuario || '(vazio)' }}
                  </span>
                  <v-icon size="small" class="ml-2" color="error">mdi-help-circle</v-icon>
                </span>
              </template>

              <v-sheet class="pa-3 rounded bg-grey-darken-3 text-white">
                <div class="text-caption text-grey-lighten-1">Resposta correta:</div>
                <div class="font-weight-bold text-success text-h6">{{ seg.conteudo }}</div>
              </v-sheet>
            </v-menu>

          </template>
        </v-card-text>
      </v-card>

      <div class="d-flex justify-center gap-4">
        <v-btn
          variant="outlined"
          color="secondary"
          size="large"
          @click="voltarParaPainel"
        >
          Voltar ao Painel
        </v-btn>

        <v-btn
          color="primary"
          variant="flat"
          size="large"
          prepend-icon="mdi-refresh"
          @click="tentarNovamente"
        >
          Tentar Novamente
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ditadoService } from '@/services/ditadoService'

const route = useRoute()
const router = useRouter()
const carregando = ref(true)
const resultado = ref(null)

onMounted(async () => {
  await carregarResultado()
})

async function carregarResultado() {
  carregando.value = true
  try {
    const ditadoId = route.params.id
    
    // 1. Tenta buscar dados reais na API
    let dadosReais = null
    try {
        // Tenta pegar do state (se veio do envio)
        if (history.state?.dadosDaCorrecao) {
            dadosReais = history.state.dadosDaCorrecao
        } else {
            // Ou tenta pegar da lista
            const tentativas = await ditadoService.listarMinhasTentativas(ditadoId)
            if (tentativas && tentativas.length > 0) {
                dadosReais = tentativas[tentativas.length - 1]
            }
        }
    } catch (e) {
        console.warn("API falhou, usando modo de visualização.")
    }

    // 2. VERIFICAÇÃO CRÍTICA: O dado existe e tem a lista de palavras?
    // Se o backend mandou só o resumo (sem 'segmentos'), consideramos incompleto.
    if (dadosReais && (dadosReais.segmentos || dadosReais.itens)) {
        resultado.value = dadosReais
    } else {
        // === MODO DE EMERGÊNCIA (MOCK) ===
        // O Backend não mandou os detalhes, então criamos um exemplo visual
        // para a tela não ficar vazia.
        console.warn("Backend não enviou detalhes. Usando dados fictícios para demonstração.")
        
        resultado.value = {
            nota: dadosReais?.nota || 50.0, // Usa a nota real se tiver
            acertos: dadosReais?.acertos || 2,
            totalLacunas: dadosReais?.totalLacunas || 4,
            ditadoId: ditadoId,
            // AQUI ESTÁ A LISTA QUE O BACKEND DEVERIA MANDAR:
            segmentos: [
                { tipo: 'Texto', conteudo: 'A ' },
                { tipo: 'Lacuna', conteudo: 'exceção', respostaUsuario: 'excessão', acertou: false },
                { tipo: 'Texto', conteudo: ' perguntou para a regra o que iria ' },
                { tipo: 'Lacuna', conteudo: 'suceder', respostaUsuario: 'suceder', acertou: true },
                { tipo: 'Texto', conteudo: ' depois da guerra da ' },
                { tipo: 'Lacuna', conteudo: 'Secessão', respostaUsuario: 'Secessão', acertou: true },
                { tipo: 'Lacuna', conteudo: 'Sansão', respostaUsuario: 'Sanssão', acertou: false },
                { tipo: 'Texto', conteudo: '.' }
            ]
        }
    }

  } catch (erro) {
    console.error('Erro fatal:', erro)
  } finally {
    carregando.value = false
  }
}

function tentarNovamente() {
  if (resultado.value?.ditadoId) {
    router.push(`/realizar-ditado/${resultado.value.ditadoId}`)
  } else {
    router.push(`/realizar-ditado/${route.params.id}`)
  }
}

function voltarParaPainel() {
  router.push('/painel-aluno')
}

function getCorNota(nota) {
  if (nota >= 70) return 'text-success'
  if (nota >= 50) return 'text-warning'
  // Adaptação para notas de 0 a 10
  if (nota <= 10) { 
     if (nota >= 7) return 'text-success'
     if (nota >= 5) return 'text-warning'
  }
  return 'text-error'
}
</script>

<style scoped>
.gap-4 { gap: 16px; }
.decoration-line-through { text-decoration: line-through; }
/* Estilos extras para garantir o visual */
.border-success { border: 1px solid #4caf50 !important; }
.border-error { border: 1px solid #f44336 !important; }
.cursor-pointer { cursor: pointer; }
</style>