import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { alphabet, games, lessons, readiness } from '../docs/curriculum.js';

const [python, modelFile, corpusFile] = process.argv.slice(2);
if (!python || !modelFile || !corpusFile) {
  throw new Error('Provide a Python executable, the tiny-voca-arabic ONNX model, and the Arabic Speech Corpus ZIP.');
}

const texts = new Set();
const comparisons = new Map();
function collect(item) {
  if (!item) return;
  texts.add(item.spoken);
  collect(item.example);
}
alphabet.forEach(collect);
readiness.forEach(({ cue }) => collect(cue));
for (const { steps } of [...lessons, ...games]) {
  for (const step of steps) {
    collect(step.item);
    step.options?.forEach(collect);
    step.lines?.forEach(collect);
    if (step.mode === 'sound') texts.add(step.prompt.text);
    if (step.kind === 'compare') {
      collect(step.brief);
      collect(step.held);
      comparisons.set(step.spoken, [step.brief.spoken, step.held.spoken]);
    }
  }
}

const labels = [...texts, ...comparisons.keys()];
const audioFiles = Object.fromEntries(labels.map((text, index) => [text, String(index + 1).padStart(3, '0')]));
const audioDirectory = fileURLToPath(new URL('../docs/audio/', import.meta.url));
const renderer = fileURLToPath(new URL('render-arabic-audio.py', import.meta.url));
mkdirSync(audioDirectory, { recursive: true });

const result = spawnSync(python, ['-X', 'utf8', renderer, modelFile, corpusFile, audioDirectory], {
  input: JSON.stringify(labels.map((text) => ({ id: audioFiles[text], text, pair: comparisons.get(text) }))),
  stdio: ['pipe', 'inherit', 'inherit'],
});
if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status ?? 1);
writeFileSync(new URL('../docs/audio-files.js', import.meta.url), `export const audioFiles = ${JSON.stringify(audioFiles, null, 2)};\n`);
console.log(`Generated ${labels.length} Arabic audio clips.`);
