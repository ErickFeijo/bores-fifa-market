// vite.config.ts
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const isProd = mode === 'production';
  // carrega variáveis .env.* (sem prefixo obrigatório aqui para poder ler GEMINI_API_KEY)
  const env = loadEnv(mode, process.cwd(), '');

  // Base do app (importante para GitHub Pages)
  // No workflow você pode exportar VITE_BASE_PATH=/bores-fifa-market/
  const base =
    env.VITE_BASE_PATH ??
    (isProd ? '/bores-fifa-market/' : '/');

  // Evita vazar segredos no build de produção:
  // só expõe a GEMINI_API_KEY no bundle em modo dev.
  const devOnlyDefines = !isProd
    ? {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY ?? ''),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY ?? ''),
      }
    : {};

  return {
    base,
    plugins: [react()],
    server: {
      host: '0.0.0.0',
      port: 3000,
    },
    // 404 fallback para SPA é resolvido no workflow copiando index.html -> 404.html
    // (ver action de deploy)
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
      ...devOnlyDefines,
    },
    build: {
      // ajustes padrão; personalize se precisar
      outDir: 'dist',
      sourcemap: !isProd,
    },
    preview: {
      port: 4173,
      host: '0.0.0.0',
    },
  };
});
