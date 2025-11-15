import api from './api'

export const usuarioService = {
  async login(login, senha) {
    try {
      console.log('Tentando login com:', { login })
      const response = await api.post('/Usuarios/login', { login, senha })
      console.log('Resposta do login:', response.data)
      return response.data
    } catch (erro) {
      console.error('Erro no login:', erro.response?.data || erro)
      throw erro
    }
  },

  async cadastrar(dados) {
    try {
      console.log('Cadastrando usuário:', dados)
      const response = await api.post('/Usuarios', dados)
      console.log('Resposta do cadastro:', response.data)
      return response.data
    } catch (erro) {
      console.error('Erro no cadastro:', erro.response?.data || erro)
      throw erro
    }
  },

  async listarTodos() {
    try {
      const response = await api.get('/Usuarios')
      return response.data
    } catch (erro) {
      console.error('Erro ao listar usuários:', erro.response?.data || erro)
      throw erro
    }
  },

  async buscarPorId(id) {
    const response = await api.get(`/Usuarios/${id}`)
    return response.data
  },

  async atualizar(id, dados) {
    try {
      console.log('Atualizando usuário:', id, dados)
      const response = await api.put(`/Usuarios/${id}`, dados)
      console.log('Resposta da atualização:', response.data)
      return response.data
    } catch (erro) {
      console.error('Erro ao atualizar usuário:', erro.response?.data || erro)
      throw erro
    }
  },

  async deletar(id) {
    const response = await api.delete(`/Usuarios/${id}`)
    return response.data
  }
}