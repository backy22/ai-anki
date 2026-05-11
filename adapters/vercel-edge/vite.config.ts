import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { vercelEdgeAdapter } from '@builder.io/qwik-city/adapters/vercel-edge/vite';
import { extendConfig } from '@builder.io/qwik-city/vite';
import baseConfig from '../../vite.config';

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default extendConfig(baseConfig, () => {
  return {
    resolve: {
      alias: {
        ws: path.resolve(rootDir, "../../node_modules/ws"),
      },
    },
    build: {
      ssr: true,
      rollupOptions: {
        input: ["src/entry.vercel-edge.tsx", "@qwik-city-plan"],
      },
      outDir: ".vercel/output/functions/_qwik-city.func",
    },
    plugins: [vercelEdgeAdapter()],
  };
});
