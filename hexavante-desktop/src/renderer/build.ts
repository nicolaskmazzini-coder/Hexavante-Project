import { resolve } from 'path'
import { defineConfig } from 'electron-vite'

export default defineConfig({
  main: { /* ... código que já está aí ... */ },
  preload: { /* ... código que já está aí ... */ },
  renderer: {
    // ADICIONE ESTE BLOCO BUILD AQUI:
    build: {
      rollupOptions: {
        input: {
          login: resolve(__dirname, 'src/renderer/pages/login/index.html'),
          inicio: resolve(__dirname, 'src/renderer/pages/inicio/inicio.html'),
          painel: resolve(__dirname, 'src/renderer/pages/hub-aulas/painel.html'),
          meet: resolve(__dirname, 'src/renderer/pages/hexa-meet/hexa-meet.html'),
          perfil: resolve(__dirname, 'src/renderer/pages/perfil/perfil.html')
        }
      }
    }
  }
})