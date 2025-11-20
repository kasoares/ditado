import api from './api'

export const ditadoService = {
  async listarTodos() {
    try {
      const response = await api.get('/Ditados')
      return response.data
    } catch (erro) {
      console.error('Erro ao listar ditados:', erro.response?.data || erro)
      throw erro
    }
  },

  async buscarPorId(id) {
    try {
      const response = await api.get(`/Ditados/${id}`)
      return response.data
    } catch (erro) {
      console.error('Erro ao buscar ditado:', erro.response?.data || erro)
      throw erro
    }
  },

  async criar(dados) {
    try {
      const response = await api.post('/Ditados', dados)
      return response.data
    } catch (erro) {
      console.error('Erro ao criar ditado:', erro.response?.data || erro)
      throw erro
    }
  },

  async buscarParaRealizar(id) {
    try {
      const response = await api.get(`/Ditados/${id}/realizar`)
      return response.data
    } catch (erro) {
      console.error('Erro ao buscar ditado para realizar:', erro.response?.data || erro)
      throw erro
    }
  },

  async submeterResposta(id, respostas) {
    try {
      const response = await api.post(`/Ditados/${id}/submeter`, { respostas })
      return response.data
    } catch (erro) {
      console.error('Erro ao submeter resposta:', erro.response?.data || erro)
      throw erro
    }
  },

  async buscarResultado(respostaDitadoId) {
    try {
      const response = await api.get(`/RespostasDitados/${respostaDitadoId}`)
      return response.data
    } catch (erro) {
      console.error('Erro ao buscar resultado:', erro.response?.data || erro)
      throw erro
    }
  }
}
