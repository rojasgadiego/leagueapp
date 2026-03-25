import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    proxy: {
        '/riot-api': {
            target: 'https://americas.api.riotgames.com',
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/riot-api/, ''),
        },
        '/lol-api-las': {
            target: 'https://la2.api.riotgames.com',
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/lol-api-las/, ''),
        },
        '/ddragon': {
            target: 'https://ddragon.leagueoflegends.com',
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/ddragon/, ''),
        },
        '/anthropic-api': {
            target: 'https://api.anthropic.com',
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/anthropic-api/, ''),
            headers: {
                'anthropic-version': '2023-06-01',
                'x-api-key': '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',
            }
        }
    }
}
})