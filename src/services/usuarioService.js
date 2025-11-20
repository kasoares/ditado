import api from './api'

export const usuarioService = {
  // LOGIN
  async login(login, senha) {
    try {
      const response = await api.post('/Usuarios/login', { login, senha })
      return response.data
    } catch (erro) {
      console.error('Erro no login:', erro.response?.data || erro)
      throw erro
    }
  },

  // CADASTRO - Auto-cadastro como Aluno
  async solicitarAcesso(dados) {
    try {
      // Enviar para solicitar-acesso (novo cadastro público)
      const response = await api.post('/Usuarios/solicitar-acesso', {
        nome: dados.nome,
        login: dados.login,
        senha: dados.senha,
        matricula: dados.matricula || null
      })
      return response.data
    } catch (erro) {
      console.error('Erro ao solicitar acesso:', erro.response?.data || erro)
      throw erro
    }
  },

  // CRIAR USUÁRIO (Admin only)
  async criar(dados) {
    try {
      const response = await api.post('/Usuarios', dados)
      return response.data
    } catch (erro) {
      console.error('Erro ao criar usuário:', erro.response?.data || erro)
      throw erro
    }
  },

  // LISTAR TODOS (Admin only)
  async listarTodos() {
    try {
      const response = await api.get('/Usuarios')
      return response.data || []
    } catch (erro) {
      console.error('Erro ao listar usuários:', erro.response?.data || erro)
      throw erro
    }
  },

  // BUSCAR POR ID
  async buscarPorId(id) {
    try {
      const response = await api.get(`/Usuarios/${id}`)
      return response.data
    } catch (erro) {
      console.error('Erro ao buscar usuário:', erro.response?.data || erro)
      throw erro
    }
  },

  // ATUALIZAR USUÁRIO
  async atualizar(id, dados) {
    try {
      const response = await api.put(`/Usuarios/${id}`, dados)
      return response.data
    } catch (erro) {
      console.error('Erro ao atualizar usuário:', erro.response?.data || erro)
      throw erro
    }
  },

  // LISTAR SOLICITAÇÕES PENDENTES (Admin/Professor)
  async listarSolicitacoesPendentes() {
    try {
      const response = await api.get('/Usuarios/solicitacoes-pendentes')
      return response.data || []
    } catch (erro) {
      console.error('Erro ao listar solicitações pendentes:', erro.response?.data || erro)
      throw erro
    }
  },

  // APROVAR ACESSO (Admin/Professor)
  async aprovarAcesso(id, novoTipo) {
    try {
      const response = await api.post(`/Usuarios/${id}/aprovar-acesso`, {
        novoTipo
      })
      return response.data
    } catch (erro) {
      console.error('Erro ao aprovar acesso:', erro.response?.data || erro)
      throw erro
    }
  },

  // BLOQUEAR USUÁRIO (Admin only)
  async bloquear(id) {
    try {
      const response = await api.patch(`/Usuarios/${id}/bloquear`)
      return response.data
    } catch (erro) {
      console.error('Erro ao bloquear usuário:', erro.response?.data || erro)
      throw erro
    }
  },

  // DESBLOQUEAR USUÁRIO (Admin only)
  async desbloquear(id) {
    try {
      const response = await api.patch(`/Usuarios/${id}/desbloquear`)
      return response.data
    } catch (erro) {
      console.error('Erro ao desbloquear usuário:', erro.response?.data || erro)
      throw erro
    }
  },

  // DELETAR USUÁRIO (Admin only)
  async deletar(id) {
    try {
      const response = await api.delete(`/Usuarios/${id}`)
      return response.data
    } catch (erro) {
      console.error('Erro ao deletar usuário:', erro.response?.data || erro)
      throw erro
    }
  }
}