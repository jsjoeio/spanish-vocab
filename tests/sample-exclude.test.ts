import { describe, expect, test } from 'bun:test';
import {
  rankLemmas,
  sampleTestWords,
  splitIntoBands,
  type Lemma,
} from '../src/lib/algorithm';

function lemmas(n: number): Lemma[] {
  return Array.from({ length: n }, (_, i) => ({
    lemma: `w${i + 1}`,
    frequency: n - i,
  }));
}

describe('sampleTestWords with exclude', () => {
  test('never samples excluded lemmas', () => {
    const bands = splitIntoBands(rankLemmas(lemmas(40)), 4);
    const exclude = new Set(['w1', 'w2', 'w10', 'w20']);
    const sampled = sampleTestWords(bands, { wordsPerBand: 5, maxWords: 50 }, () => 0, exclude);

    for (const word of sampled) {
      expect(exclude.has(word.lemma)).toBe(false);
    }
  });

  test('returns empty when every lemma is excluded', () => {
    const ranked = rankLemmas(lemmas(10));
    const bands = splitIntoBands(ranked, 2);
    const exclude = new Set(ranked.map((l) => l.lemma));
    expect(sampleTestWords(bands, {}, () => 0, exclude)).toEqual([]);
  });

  test('still fills from remaining lemmas in a band', () => {
    const ranked = rankLemmas(lemmas(20));
    const bands = splitIntoBands(ranked, 2);
    const band0 = bands[0]!;
    // exclude all but two lemmas in band 0
    const keep = band0.lemmas.slice(-2).map((l) => l.lemma);
    const exclude = new Set(
      band0.lemmas.filter((l) => !keep.includes(l.lemma)).map((l) => l.lemma)
    );

    const sampled = sampleTestWords(
      bands,
      { wordsPerBand: 5, maxWords: 50 },
      () => 0,
      exclude
    );
    const fromBand0 = sampled.filter((w) => w.band === band0.index);
    expect(fromBand0.length).toBe(2);
    expect(fromBand0.map((w) => w.lemma).sort()).toEqual([...keep].sort());
  });
});
