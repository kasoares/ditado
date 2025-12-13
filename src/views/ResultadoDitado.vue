<template>
  <v-container>
    <v-row>
      <v-col cols="12">
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
              <v-col cols="12" md="4">
                <v-list-item>
                  <v-list-item-subtitle>Total de Alunos</v-list-item-subtitle>
                  <v-list-item-title class="text-h6">{{ resultados.totalAlunos }}</v-list-item-title>
                </v-list-item>
              </v-col>
              <v-col cols="12" md="4">
                <v-list-item>
                  <v-list-item-subtitle>Alunos que Fizeram</v-list-item-subtitle>
                  <v-list-item-title class="text-h6">{{ resultados.alunosQueFizeram }}</v-list-item-title>
                </v-list-item>
              </v-col>
              <v-col cols="12" md="4">
                <v-list-item>
                  <v-list-item-subtitle>Percentual de Conclusão</v-list-item-subtitle>
                  <v-list-item-title class="text-h6">{{ resultados.percentualConclusao }}%</v-list-item-title>
                </v-list-item>
              </v-col>
              <v-col cols="12" md="4">
                <v-list-item>
                  <v-list-item-subtitle>Nota Média da Turma</v-list-item-subtitle>
                  <v-list-item-title class="text-h6">{{ resultados.notaMedia?.toFixed(1) }}</v-list-item-title>
                </v-list-item>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- Resultados dos Alunos -->
        <v-card elevation="1" class="mb-6">
          <v-card-title class="pa-6 d-flex align-center border-b">
            <v-icon class="mr-3" color="info">mdi-account-multiple</v-icon>
            <span class="text-h6 font-weight-bold">Resultados dos Alunos</span>
          </v-card-title>
          <v-card-text class="pa-6">
            <v-data-table
              :headers="headersAlunos"
              :items="resultados.alunos"
              item-key="alunoId"
              class="elevation-1"
              no-data-text="Nenhum aluno encontrou resultados para este ditado."
            >
              <template v-slot:item.fez="{ item }">
                <v-icon :color="item.fez ? 'success' : 'error'">
                  {{ item.fez ? 'mdi-check-circle' : 'mdi-close-circle' }}
                </v-icon>
              </template>
              <template v-slot:item.dataEntrega="{ item }">
                {{ item.dataEntrega ? formatarData(item.dataEntrega) : '-' }}
              </template>
              <template v-slot:item.nota="{ item }">
                <v-chip
                  :color="obterCorNota(item.nota)"
                  variant="flat"
                  size="small"
                  v-if="item.fez"
                >
                  {{ item.nota?.toFixed(1) }}%
                </v-chip>
                <span v-else>-</span>
              </template>
              <template v-slot:item.atrasado="{ item }">
                <v-icon :color="item.atrasado ? 'warning' : 'success'" v-if="item.fez">
                  {{ item.atrasado ? 'mdi-clock-alert' : 'mdi-check' }}
                </v-icon>
                <span v-else>-</span>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>

        <!-- Gráfico de Erros por Tipo -->
        <v-card elevation="1">
          <v-card-title class="pa-6 d-flex align-center border-b">
            <v-icon class="mr-3" color="warning">mdi-alert-circle</v-icon>
            <span class="text-h6 font-weight-bold">Erros por Tipo</span>
          </v-card-title>
          <v-card-text class="pa-6">
            <div v-if="resultados.errosPorTipo && resultados.errosPorTipo.length > 0">
              <v-list density="compact">
                <v-list-item v-for="erro in resultados.errosPorTipo" :key="erro.tipoErroId">
                  <v-list-item-title>{{ erro.descricao }}</v-list-item-title>
                  <v-list-item-subtitle>{{ erro.descricaoCurta }}</v-list-item-subtitle>
                  <template v-slot:append>
                    <v-chip color="error" variant="flat">{{ erro.quantidade }}</v-chip>
                  </template>
                </v-list-item>
              </v-list>
            </div>
            <div v-else class="text-center py-6">
              <v-icon size="48" color="grey-lighten-1">mdi-check-all</v-icon>
              <p class="text-body-1 text-grey mt-2">Nenhum erro registrado para este ditado.</p>
            </div>
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
import { ref, onMounted } from 'vue';
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

const headersAlunos = [
  { title: 'Nome do Aluno', key: 'nome' },
  { title: 'Matrícula', key: 'matricula' },
  { title: 'Fez o Ditado', key: 'fez', align: 'center' },
  { title: 'Data de Entrega', key: 'dataEntrega', align: 'center' },
  { title: 'Nota (1ª Tentativa)', key: 'nota', align: 'center' },
  { title: 'Erro Mais Comum', key: 'erroMaisComum' },
  { title: 'Entregou Atrasado', key: 'atrasado', align: 'center' },
];

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
</style>
