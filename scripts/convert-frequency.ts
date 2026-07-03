// converts frequency.csv → public/data/{sourceId}.json
// run: bun scripts/convert-frequency.ts

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const SOURCE_ID = 'rioplatense-parenting';
const SOURCE_NAME = 'Rioplatense parenting (YouTube)';

const csv = readFileSync(join(import.meta.dir, '..', 'frequency.csv'), 'utf-8');
const lines = csv.trim().split(/\r?\n/).slice(1); // skip header

const lemmas = lines
  .map((line) => {
    const [lemma, freq] = line.split(',').map((s) => s.trim());
    const frequency = Number(freq);
    if (!lemma || !Number.isFinite(frequency)) return null;
    return { lemma, frequency };
  })
  .filter((entry): entry is { lemma: string; frequency: number } => entry !== null)
  .sort((a, b) => b.frequency - a.frequency);

const output = {
  id: SOURCE_ID,
  name: SOURCE_NAME,
  lemmas,
};

const outDir = join(import.meta.dir, '..', 'public', 'data');
mkdirSync(outDir, { recursive: true });

const outPath = join(outDir, `${SOURCE_ID}.json`);
writeFileSync(outPath, JSON.stringify(output));

console.log(`wrote ${lemmas.length} lemmas to ${outPath}`);