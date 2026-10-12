import { defineConfig, type Plugin } from 'vite';
import { userscriptHeader } from './userscript.config';

const origin = 'http://localhost:5173';

// Vite already bundles the script and inline CSS. Only metadata and the dev
// loader need a small adapter; no userscript framework is needed at this stage.
function userscriptDevelopment(): Plugin {
  return {
    name: 'pku-prism-development',
    generateBundle(_options, bundle) {
      for (const output of Object.values(bundle)) {
        if (output.type === 'chunk' && output.isEntry) {
          // Add after Vite transforms so esbuild cannot strip the metadata.
          output.code = `${userscriptHeader()}\n${output.code}`;
        }
      }
    },
    configureServer(server) {
      server.middlewares.use('/__prism__/install.user.js', (_request, response) => {
        response.setHeader('Content-Type', 'application/javascript; charset=utf-8');
        response.setHeader('Cache-Control', 'no-store');
        response.end(`${userscriptHeader(true)}\n` +
          `import('${origin}/@vite/client')\n` +
          `  .then(() => import('${origin}/src/main.ts'))\n` +
          `  .catch(() => console.error('[PKU Prism] 无法连接本地开发服务器。'));\n`);
      });
    },
  };
}

export default defineConfig({
  plugins: [userscriptDevelopment()],
  server: {
    host: 'localhost',
    port: 5173,
    strictPort: true,
    origin,
    cors: { origin: /^https:\/\/course\.pku\.edu\.cn$/ },
  },
  preview: { host: 'localhost', port: 4173, strictPort: true },
  build: {
    target: 'es2022',
    minify: false,
    lib: { entry: 'src/main.ts', name: 'PKUPrism', formats: ['iife'], fileName: () => 'pku-prism.user.js' },
  },
});
