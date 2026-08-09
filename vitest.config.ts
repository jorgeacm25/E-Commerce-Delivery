import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

export default mergeConfig(
	viteConfig,
	defineConfig({
		test: {
			environment: 'jsdom',
			setupFiles: ['./src/setupTests.ts'],
			// .claude/worktrees/* son copias del repo para sesiones/agentes en
			// paralelo (ver .gitignore) — sin excluirlas, Vitest las recorre
			// también y duplica cada archivo de prueba.
			exclude: ['**/node_modules/**', '**/dist/**', '**/.claude/**'],
		},
	})
);
