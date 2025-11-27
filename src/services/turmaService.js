import api from './api'

export const turmaService = {
  // CRIAR TURMA
  async criar(dados) {
    try {
      const response = await api.post('/Turmas', dados)
      return response.data
    } catch (erro) {
      console.error('Erro ao criar turma:', erro.response?.data || erro)
      throw erro
    }
  },

  // LISTAR TODAS AS TURMAS
  async listarTodas(apenasAtivas = true) {
    try {
      console.log('[TurmaService] Listando turmas (apenasAtivas:', apenasAtivas, ')')
      const response = await api.get('/Turmas', {
        params: { apenasAtivas }
      })
      console.log(`[TurmaService] ${response.data?.length || 0} turmas carregadas`, {
        quantidade: response.data?.length,
        campos_primeira_turma: response.data?.[0] ? Object.keys(response.data[0]) : 'nenhuma turma',
        primeira_turma: response.data?.[0]
      })
      return response.data || []
    } catch (erro) {
      console.error('[TurmaService] ERRO ao listar turmas:', {
        status: erro.response?.status,
        data: erro.response?.data,
        mensagem: erro.message
      })
      throw erro
    }
  },

  // BUSCAR TURMA POR ID
  async buscarPorId(id) {
    try {
      console.log(`[TurmaService] Buscando turma ID: ${id}`)
      const response = await api.get(`/Turmas/${id}`)
      console.log('[TurmaService] Turma carregada com sucesso:', {
        id: response.data.id,
        nome: response.data.nome,
        serie: response.data.serie,
        anoLetivo: response.data.anoLetivo,
        totalAlunos: response.data.totalAlunos,
        dataCriacao: response.data.dataCriacao
      })
      return response.data
    } catch (erro) {
      console.error('[TurmaService] ERRO ao buscar turma:', {
        turmaId: id,
        status: erro.response?.status,
        statusText: erro.response?.statusText,
        data: erro.response?.data,
        mensagem: erro.message
      })
      throw erro
    }
  },

  // ATUALIZAR TURMA (incluindo adicionar/remover alunos)
  async atualizar(id, dados) {
    try {
      const response = await api.put(`/Turmas/${id}`, dados)
      return response.data
    } catch (erro) {
      console.error('Erro ao atualizar turma:', erro.response?.data || erro)
      throw erro
    }
  },

  // DELETAR TURMA
  async deletar(id) {
    try {
      const response = await api.delete(`/Turmas/${id}`)
      return response.data
    } catch (erro) {
      console.error('Erro ao deletar turma:', erro.response?.data || erro)
      throw erro
    }
  },

  // LISTAR TURMAS DE UM PROFESSOR
  async listarDosProfessor(professorId) {
    try {
      const response = await api.get(`/Turmas/professor/${professorId}`)
      return response.data || []
    } catch (erro) {
      console.error('Erro ao listar turmas do professor:', erro.response?.data || erro)
      throw erro
    }
  },

    // LISTAR TURMAS DE UM ALUNO
  async listarDosAlunos(alunoId) {
    try {
      const response = await api.get(`/Turmas/aluno/${alunoId}`)
      return response.data || []
    } catch (erro) {
      console.error('Erro ao listar turmas do aluno:', erro.response?.data || erro)
      throw erro
    }
  },

  // ADICIONAR ALUNOS À TURMA
  async adicionarAlunos(turmaId, alunosIds) {
    try {
      const response = await api.put(`/Turmas/${turmaId}`, {
        alunosIds
      })
      return response.data
    } catch (erro) {
      console.error('Erro ao adicionar alunos à turma:', erro.response?.data || erro)
      throw erro
    }
  },

  // REMOVER TODOS OS ALUNOS (limpar turma)
  async limparAlunos(turmaId) {
    try {
      const response = await api.put(`/Turmas/${turmaId}`, {
        alunosIds: []
      })
      return response.data
    } catch (erro) {
      console.error('Erro ao limpar alunos da turma:', erro.response?.data || erro)
      throw erro
    }
  }
}
