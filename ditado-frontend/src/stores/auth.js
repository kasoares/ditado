import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { usuarioService } from '@/services/usuarioService'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || null)
  const usuario = ref(JSON.parse(localStorage.getItem('usuario') || 'null'))

  const estaAutenticado = computed(() => !!token.value)

  async function login(login, senha) {
    try {
      const resposta = await usuarioService.login(login, senha)
      token.value = resposta.token
      usuario.value = resposta.usuario
      
      localStorage.setItem('token', resposta.token)
      localStorage.setItem('usuario', JSON.stringify(resposta.usuario))
      
      return true
    } catch (erro) {
      console.error('Erro no login:', erro)
      throw erro
    }
  }

  function logout() {
    token.value = null
    usuario.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
  }

  async function atualizarUsuario(id, dados) {
    try {
      const usuarioAtualizado = await usuarioService.atualizar(id, dados)
      usuario.value = usuarioAtualizado
      localStorage.setItem('usuario', JSON.stringify(usuarioAtualizado))
      return usuarioAtualizado
    } catch (erro) {
      console.error('Erro ao atualizar usuário:', erro)
      throw erro
    }
  }

  return {
    token,
    usuario,
    estaAutenticado,
    login,
    logout,
    atualizarUsuario
  }
})