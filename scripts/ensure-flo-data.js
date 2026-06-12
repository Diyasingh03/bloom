// data/ is gitignored (private cycle data), so fresh clones and CI builds
// (e.g. Vercel) are missing data/floData.ts, which useCycleData imports
// statically. This writes a null stub so Metro can resolve the import and
// the app falls back to floPlaceholderData. No-op when the real file exists.
const fs = require('fs');
const path = require('path');

const target = path.join(__dirname, '..', 'data', 'floData.ts');

if (!fs.existsSync(target)) {
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(
    target,
    [
      '// Auto-generated stub (scripts/ensure-flo-data.js) — no private seed data present.',
      "// The app falls back to floPlaceholder.ts when floUserData is null.",
      "import { FloData } from '../src/types';",
      '',
      'export const floUserData: FloData | null = null;',
      '',
    ].join('\n')
  );
  console.log('Created stub data/floData.ts (private seed data not present)');
}
