<template>
  <div>
    <!-- Cabeçalho -->
    <v-card class="mb-4 mb-md-6" elevation="1">
      <v-card-text class="pa-4 pa-md-6">
        <div class="d-flex flex-column flex-sm-row justify-space-between align-start align-sm-center gap-3">
          <div>
            <h1 class="text-h5 text-md-h4 font-weight-bold mb-2">
              Gerenciar Usuários
            </h1>
            <p class="text-body-2 text-md-body-1 text-grey-darken-1">
              Visualize, crie e gerencie os usuários do sistema
            </p>
          </div>
          <v-btn
            color="primary"
            prepend-icon="mdi-account-plus"
            class="text-none"
            @click="abrirDialogCriar"
          >
            Novo Usuário
          </v-btn>
        </div>
      </v-card-text>
    </v-card>

    <!-- Filtros e busca -->
    <v-card class="mb-4 mb-md-6" elevation="1">
      <v-card-text class="pa-4 pa-md-6">
        <v-row>
          <v-col cols="12" sm="6" md="5">
            <v-text-field
              v-model="filtros.busca"
              label="Buscar"
              placeholder="Nome, email ou ID"
              variant="outlined"
              density="comfortable"
              prepend-inner-icon="mdi-magnify"
              clearable
              hide-details
            />
          </v-col>
          <v-col cols="12" sm="6" md="4">
            <v-select
              v-model="filtros.tipo"
              label="Tipo de usuário"
              :items="tiposUsuario"
              item-title="title"
              item-value="value"
              variant="outlined"
              density="comfortable"
              clearable
              hide-details
            />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Tabela de usuários -->
    <v-card elevation="1">
      <v-card-title class="pa-4 pa-md-6 d-flex align-center border-b">
        <v-icon class="mr-2 mr-md-3" color="grey-darken-2">mdi-account-multiple</v-icon>
        <span class="text-body-1 text-md-h6 font-weight-bold">Lista de Usuários</span>
        <v-spacer></v-spacer>
        <v-chip color="primary" variant="flat">
          {{ usuariosFiltrados.length }} usuários
        </v-chip>
      </v-card-title>

      <v-divider></v-divider>

      <!-- Loading -->
      <div v-if="carregando" class="text-center pa-12">
        <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
        <p class="text-grey mt-4">Carregando usuários...</p>
      </div>

      <!-- Lista vazia -->
      <div v-else-if="usuariosFiltrados.length === 0" class="text-center pa-12">
        <v-icon size="64" color="grey-lighten-1">mdi-account-off-outline</v-icon>
        <p class="text-body-1 text-grey mt-4">Nenhum usuário encontrado</p>
      </div>

      <!-- Tabela -->
      <v-table v-else>
        <thead>
          <tr>
            <th class="text-left font-weight-bold">ID</th>
            <th class="text-left font-weight-bold">Nome</th>
            <th class="text-left font-weight-bold d-none d-sm-table-cell">Login</th>
            <th class="text-left font-weight-bold d-none d-md-table-cell">Tipo</th>
            <th class="text-center font-weight-bold">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="usuario in usuariosFiltrados" :key="usuario.id">
            <td>{{ usuario.id }}</td>
            <td>
              <div class="d-flex align-center">
                <v-avatar color="primary" size="32" class="mr-2">
                  <span class="text-caption">{{ obterIniciais(usuario.nome) }}</span>
                </v-avatar>
                <span>{{ usuario.nome }}</span>
              </div>
            </td>
            <td class="d-none d-sm-table-cell">{{ usuario.login }}</td>
            <td class="d-none d-md-table-cell">
              <v-chip :color="obterCorTipo(usuario.tipo)" size="small" variant="flat">
                {{ usuario.tipo }}
              </v-chip>
            </td>
            <td>
              <div class="d-flex justify-center gap-1">
                <v-btn
                  icon="mdi-pencil"
                  size="small"
                  variant="text"
                  color="primary"
                  @click="abrirDialogEditar(usuario)"
                />
                <v-btn
                  icon="mdi-delete"
                  size="small"
                  variant="text"
                  color="error"
                  @click="confirmarExclusao(usuario)"
                />
              </div>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>

    <!-- Dialog Criar/Editar Usuário -->
    <v-dialog v-model="dialogUsuario" max-width="600" persistent>
      <v-card>
        <v-card-title class="pa-4 pa-md-6 bg-grey-lighten-5 border-b">
          <div class="d-flex align-center">
            <v-icon class="mr-2" color="grey-darken-2">
              {{ usuarioEditando ? 'mdi-account-edit' : 'mdi-account-plus' }}
            </v-icon>
            <span class="text-body-1 text-md-h6 font-weight-bold">
              {{ usuarioEditando ? 'Editar Usuário' : 'Novo Usuário' }}
            </span>
          </div>
        </v-card-title>

        <v-card-text class="pa-4 pa-md-6">
          <v-form ref="formUsuario">
            <v-row>
              <v-col cols="12">
                <label class="text-body-2 text-grey-darken-2 mb-2 d-block">Nome completo</label>
                <v-text-field
                  v-model="formDados.nome"
                  placeholder="Digite o nome"
                  variant="outlined"
                  density="comfortable"
                  :rules="[regras.obrigatorio]"
                  hide-details="auto"
                />
              </v-col>

              <v-col cols="12">
                <label class="text-body-2 text-grey-darken-2 mb-2 d-block">Login (Email)</label>
                <v-text-field
                  v-model="formDados.login"
                  placeholder="usuario@email.com"
                  type="email"
                  variant="outlined"
                  density="comfortable"
                  :rules="[regras.obrigatorio, regras.email]"
                  hide-details="auto"
                />
              </v-col>

              <v-col cols="12">
                <label class="text-body-2 text-grey-darken-2 mb-2 d-block">Tipo de usuário</label>
                <v-select
                  v-model="formDados.tipo"
                  :items="tiposUsuario"
                  item-title="title"
                  item-value="value"
                  variant="outlined"
                  density="comfortable"
                  :rules="[regras.obrigatorio]"
                  hide-details="auto"
                />
              </v-col>

              <v-col cols="12">
                <label class="text-body-2 text-grey-darken-2 mb-2 d-block">Matrícula</label>
                <v-text-field
                  v-model="formDados.matricula"
                  placeholder="Digite a matrícula (opcional)"
                  variant="outlined"
                  density="comfortable"
                  hide-details="auto"
                />
              </v-col>

              <v-col cols="12" v-if="!usuarioEditando">
                <label class="text-body-2 text-grey-darken-2 mb-2 d-block">Senha</label>
                <v-text-field
                  v-model="formDados.senha"
                  placeholder="Mínimo 6 caracteres"
                  :type="mostrarSenha ? 'text' : 'password'"
                  variant="outlined"
                  density="comfortable"
                  :append-inner-icon="mostrarSenha ? 'mdi-eye-off' : 'mdi-eye'"
                  @click:append-inner="mostrarSenha = !mostrarSenha"
                  :rules="[regras.obrigatorio, regras.senhaMinima]"
                  hide-details="auto"
                />
              </v-col>

              <!-- Campos de alteração de senha para edição -->
              <template v-if="usuarioEditando">
                <v-col cols="12">
                  <v-divider class="my-2"></v-divider>
                  <p class="text-caption text-grey-darken-1 mb-2">Deixe em branco para não alterar a senha</p>
                </v-col>

                <v-col cols="12">
                  <label class="text-body-2 text-grey-darken-2 mb-2 d-block">Senha Atual</label>
                  <v-text-field
                    v-model="formDados.senhaAtual"
                    placeholder="Digite a senha atual"
                    :type="mostrarSenhaAtual ? 'text' : 'password'"
                    variant="outlined"
                    density="comfortable"
                    :append-inner-icon="mostrarSenhaAtual ? 'mdi-eye-off' : 'mdi-eye'"
                    @click:append-inner="mostrarSenhaAtual = !mostrarSenhaAtual"
                    hide-details="auto"
                  />
                </v-col>

                <v-col cols="12">
                  <label class="text-body-2 text-grey-darken-2 mb-2 d-block">Nova Senha</label>
                  <v-text-field
                    v-model="formDados.senhaNova"
                    placeholder="Mínimo 6 caracteres"
                    :type="mostrarSenhaNova ? 'text' : 'password'"
                    variant="outlined"
                    density="comfortable"
                    :append-inner-icon="mostrarSenhaNova ? 'mdi-eye-off' : 'mdi-eye'"
                    @click:append-inner="mostrarSenhaNova = !mostrarSenhaNova"
                    :rules="[regras.senhaMinimaOpcional]"
                    hide-details="auto"
                  />
                </v-col>
              </template>
            </v-row>
          </v-form>

          <v-alert
            v-if="erroForm"
            type="error"
            class="mt-4"
            variant="tonal"
            closable
            @click:close="erroForm = null"
          >
            {{ erroForm }}
          </v-alert>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn
            color="grey"
            variant="text"
            class="text-none"
            @click="fecharDialog"
          >
            Cancelar
          </v-btn>
          <v-btn
            color="primary"
            variant="flat"
            class="text-none"
            :loading="salvando"
            @click="salvarUsuario"
          >
            {{ usuarioEditando ? 'Salvar' : 'Criar' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog Confirmar Exclusão -->
    <v-dialog v-model="dialogExclusao" max-width="500">
      <v-card>
        <v-card-title class="pa-4 pa-md-6 bg-error text-white">
          <span class="text-body-1 text-md-h6 font-weight-bold">Confirmar Exclusão</span>
        </v-card-title>
        <v-card-text class="pa-4 pa-md-6">
          <p class="text-body-2 text-md-body-1 mb-4">
            Tem certeza que deseja excluir o usuário <strong>{{ usuarioParaExcluir?.nome }}</strong>?
          </p>
          <v-alert type="warning" variant="tonal" density="compact">
            Esta ação não pode ser desfeita.
          </v-alert>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn
            color="grey"
            variant="text"
            class="text-none"
            @click="dialogExclusao = false"
          >
            Cancelar
          </v-btn>
          <v-btn
            color="error"
            variant="flat"
            class="text-none"
            :loading="excluindo"
            @click="excluirUsuario"
          >
            Excluir
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar de sucesso -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3000">
      {{ snackbar.mensagem }}
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { usuarioService } from '@/services/usuarioService'

const usuarios = ref([])
const carregando = ref(false)
const filtros = ref({
  busca: '',
  tipo: null
})

const tiposUsuario = [
  { title: 'Administrador', value: 'Administrador' },
  { title: 'Professor', value: 'Professor' },
  { title: 'Aluno', value: 'Aluno' }
]

const tipoParaNumero = {
  'Administrador': 1,
  'Professor': 2,
  'Aluno': 3
}

const dialogUsuario = ref(false)
const dialogExclusao = ref(false)
const usuarioEditando = ref(null)
const usuarioParaExcluir = ref(null)
const formUsuario = ref(null)
const salvando = ref(false)
const excluindo = ref(false)
const erroForm = ref(null)
const mostrarSenha = ref(false)
const mostrarSenhaAtual = ref(false)
const mostrarSenhaNova = ref(false)

const formDados = ref({
  nome: '',
  login: '',
  tipo: null,
  senha: '',
  matricula: '',
  senhaAtual: '',
  senhaNova: ''
})

const snackbar = ref({
  show: false,
  mensagem: '',
  color: 'success'
})

const regras = {
  obrigatorio: v => (v !== null && v !== undefined && v !== '') || 'Campo obrigatório',
  email: v => /.+@.+\..+/.test(v) || 'Email inválido',
  senhaMinima: v => !v || v.length >= 6 || 'Senha deve ter no mínimo 6 caracteres',
  senhaMinimaOpcional: v => !v || v.length === 0 || v.length >= 6 || 'Senha deve ter no mínimo 6 caracteres'
}

const usuariosFiltrados = computed(() => {
  let resultado = [...usuarios.value]

  if (filtros.value.busca && filtros.value.busca.trim() !== '') {
    const busca = filtros.value.busca.toLowerCase().trim()
    resultado = resultado.filter(u => 
      u.nome?.toLowerCase().includes(busca) ||
      u.login?.toLowerCase().includes(busca) ||
      u.id?.toString().includes(busca)
    )
  }

  if (filtros.value.tipo) {
    resultado = resultado.filter(u => u.tipo === filtros.value.tipo)
  }

  return resultado
})

onMounted(() => {
  buscarUsuarios()
})

async function buscarUsuarios() {
  carregando.value = true
  try {
    const dados = await usuarioService.listarTodos()
    usuarios.value = dados
  } catch (erro) {
    console.error('Erro ao carregar usuários:', erro)
    mostrarSnackbar('Erro ao carregar usuários', 'error')
  } finally {
    carregando.value = false
  }
}

function obterIniciais(nome) {
  return nome?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'U'
}

function obterCorTipo(tipo) {
  const cores = {
    'Administrador': 'error',
    'Professor': 'primary',
    'Aluno': 'success'
  }
  return cores[tipo] || 'grey'
}

function abrirDialogCriar() {
  usuarioEditando.value = null
  formDados.value = {
    nome: '',
    login: '',
    tipo: null,
    senha: '',
    matricula: '',
    senhaAtual: '',
    senhaNova: ''
  }
  erroForm.value = null
  dialogUsuario.value = true
}

function abrirDialogEditar(usuario) {
  usuarioEditando.value = usuario
  formDados.value = {
    nome: usuario.nome,
    login: usuario.login,
    tipo: usuario.tipo,
    senha: '',
    matricula: usuario.matricula || '',
    senhaAtual: '',
    senhaNova: ''
  }
  erroForm.value = null
  dialogUsuario.value = true
}

function fecharDialog() {
  dialogUsuario.value = false
  usuarioEditando.value = null
  formDados.value = {
    nome: '',
    login: '',
    tipo: null,
    senha: '',
    matricula: '',
    senhaAtual: '',
    senhaNova: ''
  }
  erroForm.value = null
}

async function salvarUsuario() {
  const { valid } = await formUsuario.value.validate()
  if (!valid) return

  salvando.value = true
  erroForm.value = null

  try {
    if (usuarioEditando.value) {
      // Para atualização, usar o schema AtualizarUsuarioRequest
      const dadosAtualizar = {
        nome: formDados.value.nome,
        matricula: formDados.value.matricula || null
      }

      // Adicionar senhas apenas se foram preenchidas
      if (formDados.value.senhaAtual && formDados.value.senhaNova) {
        dadosAtualizar.senhaAtual = formDados.value.senhaAtual
        dadosAtualizar.senhaNova = formDados.value.senhaNova
      }

      await usuarioService.atualizar(usuarioEditando.value.id, dadosAtualizar)
      mostrarSnackbar('Usuário atualizado com sucesso!', 'success')
    } else {
      // Para criação, usar o schema CriarUsuarioRequest
      const dadosCriar = {
        nome: formDados.value.nome,
        login: formDados.value.login,
        senha: formDados.value.senha,
        tipo: tipoParaNumero[formDados.value.tipo]
      }

      if (formDados.value.matricula) {
        dadosCriar.matricula = formDados.value.matricula
      }

      await usuarioService.cadastrar(dadosCriar)
      mostrarSnackbar('Usuário criado com sucesso!', 'success')
    }
    
    fecharDialog()
    buscarUsuarios()
  } catch (erro) {
    console.error('Erro ao salvar:', erro.response?.data || erro)
    
    if (erro.response?.data?.errors) {
      const erros = erro.response.data.errors
      const mensagensErro = Object.values(erros).flat().join(', ')
      erroForm.value = mensagensErro
    } else {
      erroForm.value = erro.response?.data?.message || erro.response?.data?.title || 'Erro ao salvar usuário'
    }
  } finally {
    salvando.value = false
  }
}

function confirmarExclusao(usuario) {
  usuarioParaExcluir.value = usuario
  dialogExclusao.value = true
}

async function excluirUsuario() {
  excluindo.value = true
  
  try {
    await usuarioService.deletar(usuarioParaExcluir.value.id)
    mostrarSnackbar('Usuário excluído com sucesso!', 'success')
    dialogExclusao.value = false
    buscarUsuarios()
  } catch (erro) {
    mostrarSnackbar('Erro ao excluir usuário', 'error')
  } finally {
    excluindo.value = false
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
.gap-1 {
  gap: 4px;
}

.gap-3 {
  gap: 12px;
}
</style>