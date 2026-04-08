/**
 * Genera `src/app/core/build-stamp.generated.ts` en cada `npm start` / `npm run build`.
 * Así el onboarding puede detectar una "nueva compilación" y volver a mostrarse.
 */
import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const stamp = new Date().toISOString();
const out = join(root, 'src', 'app', 'core', 'build-stamp.generated.ts');

const content = `/* Archivo generado por scripts/write-build-stamp.mjs — no editar a mano */
export const APP_PACKAGE_VERSION = '${pkg.version}';
export const APP_BUILD_STAMP = '${stamp}';
`;

writeFileSync(out, content, 'utf8');
console.log('[build-stamp] actualizado:', stamp);
