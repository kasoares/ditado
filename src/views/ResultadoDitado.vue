<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <!-- Resumo do Ditado -->
        <v-card elevation="1" class="mb-6">
          <v-card-title class="pa-6 d-flex align-center border-b">
            <v-icon class="mr-3" color="primary">mdi-chart-bar</v-icon>
            <span class="text-h5 font-weight-bold">Resultados do Ditado: {{ resultados.ditadoTitulo }}</span>
            <v-spacer></v-spacer>
            <v-chip color="primary" variant="flat">
              Turma: {{ resultados.turmaNome }}
            </v-chip>
          </v-card-title>
          <v-card-text class="pa-6">
            <v-row>
              <v-col cols="6" sm="4" md="2">
                <v-list-item>
                  <v-list-item-subtitle>Total de Alunos</v-list-item-subtitle>
                  <v-list-item-title class="text-h6">{{ resultados.totalAlunos }}</v-list-item-title>
                </v-list-item>
              </v-col>
              <v-col cols="6" sm="4" md="2">
                <v-list-item>
                  <v-list-item-subtitle>Alunos que Fizeram</v-list-item-subtitle>
                  <v-list-item-title class="text-h6">{{ resultados.alunosQueFizeram }}</v-list-item-title>
                </v-list-item>
              </v-col>
              <v-col cols="6" sm="4" md="2">
                <v-list-item>
                  <v-list-item-subtitle>Percentual de Conclusão</v-list-item-subtitle>
                  <v-list-item-title class="text-h6">{{ resultados.percentualConclusao?.toFixed(1) }}%</v-list-item-title>
                </v-list-item>
              </v-col>
              <v-col cols="6" sm="4" md="2">
                <v-list-item>
                  <v-list-item-subtitle>Nota Média da Turma</v-list-item-subtitle>
                  <v-list-item-title class="text-h6">{{ resultados.notaMedia?.toFixed(1) }}</v-list-item-title>
                </v-list-item>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- Gráfico de Erros por Tipo -->
        <v-card elevation="1" class="mb-6">
          <v-card-title class="pa-6 d-flex align-center border-b">
            <v-icon class="mr-3" color="warning">mdi-alert-circle</v-icon>
            <span class="text-h6 font-weight-bold">Erros por Tipo</span>
          </v-card-title>
          <v-card-text class="pa-6">
            <div v-if="resultados.errosPorTipo && resultados.errosPorTipo.length > 0">
              <div class="erros-chart">
                <div 
                  v-for="erro in errosOrdenados" 
                  :key="erro.tipoErroId" 
                  class="erro-bar-container mb-3"
                >
                  <div class="d-flex justify-space-between align-center mb-1">
                    <span class="text-body-2 font-weight-medium">{{ erro.descricaoCurta }}:</span>
                    <span class="text-body-2 font-weight-bold">{{ erro.quantidade }}</span>
                  </div>
                  <div class="erro-bar-bg">
                    <div 
                      class="erro-bar" 
                      :style="{ width: calcularLarguraBarra(erro.quantidade) + '%' }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-6">
              <v-icon size="48" color="grey-lighten-1">mdi-check-all</v-icon>
              <p class="text-body-1 text-grey mt-2">Nenhum erro registrado para este ditado.</p>
            </div>
          </v-card-text>
        </v-card>

        <!-- Resultados dos Alunos -->
        <v-card elevation="1" class="mb-6">
          <v-card-title class="pa-6 d-flex align-center border-b">
            <v-icon class="mr-3" color="info">mdi-account-multiple</v-icon>
            <span class="text-h6 font-weight-bold">Resultados dos Alunos</span>
          </v-card-title>
          <v-card-text class="pa-0">
            <v-table>
              <thead>
                <tr>
                  <th class="text-left">Nome do Aluno</th>
                  <th class="text-left">Matrícula</th>
                  <th class="text-center">Fez o Ditado</th>
                  <th class="text-center">Data de Entrega</th>
                  <th class="text-center">Nota (1ª Tentativa)</th>
                  <th class="text-left">Erro Mais Comum</th>
                  <th class="text-center">Entregou Atrasado</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="aluno in resultados.alunos" :key="aluno.alunoId">
                  <td>{{ aluno.nome }}</td>
                  <td>{{ aluno.matricula || '-' }}</td>
                  <td class="text-center">
                    <v-icon :color="aluno.fez ? 'success' : 'error'">
                      {{ aluno.fez ? 'mdi-check-circle' : 'mdi-close-circle' }}
                    </v-icon>
                  </td>
                  <td class="text-center">
                    {{ aluno.dataEntrega ? formatarData(aluno.dataEntrega) : '-' }}
                  </td>
                  <td class="text-center">
                    <v-chip
                      v-if="aluno.fez"
                      :color="obterCorNota(aluno.nota)"
                      variant="flat"
                      size="small"
                    >
                      {{ aluno.nota?.toFixed(1) }}%
                    </v-chip>
                    <span v-else>-</span>
                  </td>
                  <td>{{ aluno.erroMaisComum || '-' }}</td>
                  <td class="text-center">
                    <v-icon v-if="aluno.fez" :color="aluno.atrasado ? 'warning' : 'success'">
                      {{ aluno.atrasado ? 'mdi-clock-alert' : 'mdi-check' }}
                    </v-icon>
                    <span v-else>-</span>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3000">
      {{ snackbar.mensagem }}
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { ditadoService } from '@/services/ditadoService';

const route = useRoute();
const resultados = ref({});
const carregando = ref(true);

const snackbar = ref({
  show: false,
  mensagem: '',
  color: 'info',
});

// Erros ordenados por quantidade (maior para menor)
const errosOrdenados = computed(() => {
  if (!resultados.value.errosPorTipo) return [];
  return [...resultados.value.errosPorTipo].sort((a, b) => b.quantidade - a.quantidade);
});

// Calcula a largura da barra baseado no máximo
const maxErros = computed(() => {
  if (!errosOrdenados.value.length) return 1;
  return Math.max(...errosOrdenados.value.map(e => e.quantidade));
});

function calcularLarguraBarra(quantidade) {
  return (quantidade / maxErros.value) * 100;
}

onMounted(async () => {
  const turmaId = route.params.turmaId;
  const ditadoId = route.params.ditadoId;

  if (!turmaId || !ditadoId) {
    mostrarSnackbar('IDs de turma ou ditado não fornecidos.', 'error');
    carregando.value = false;
    return;
  }

  try {
    const response = await ditadoService.buscarResultadosDitadoProfessor(turmaId, ditadoId);
    resultados.value = response;
  } catch (error) {
    console.error('Erro ao carregar resultados do ditado:', error);
    mostrarSnackbar('Erro ao carregar resultados do ditado.', 'error');
  } finally {
    carregando.value = false;
  }
});

function formatarData(data) {
  if (!data) return '-';
  const date = new Date(data);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function obterCorNota(nota) {
  if (nota >= 80) return 'success';
  if (nota >= 60) return 'warning';
  return 'error';
}

function mostrarSnackbar(mensagem, cor = 'info') {
  snackbar.value = {
    show: true,
    mensagem,
    color: cor,
  };
}
</script>

<style scoped>
.border-b {
  border-bottom: 1px solid #e0e0e0;
}

.erros-chart {
  max-width: 500px;
}

.erro-bar-bg {
  background-color: #e0e0e0;
  border-radius: 4px;
  height: 20px;
  overflow: hidden;
}

.erro-bar {
  background: linear-gradient(90deg, #7c4dff, #536dfe);
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
}
</style>
