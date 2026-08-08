import { describe, expect, test } from 'bun:test';
import {
  CEFR_COVERAGE_THRESHOLDS,
  estimateVocabulary,
  getCefrLevel,
  getCoveragePercent,
  pickReplacementFromBand,
  rankLemmas,
  splitIntoBands,
  type Lemma,
  type TestWord,
} from '../src/lib/algorithm';

const SOURCE_SIZE = 3_997;

describe('getCoveragePercent', () => {
  test('rounds estimate relative to source size', () => {
    expect(getCoveragePercent(2_877, SOURCE_SIZE)).toBe(72);
    expect(getCoveragePercent(3_997, SOURCE_SIZE)).toBe(100);
    expect(getCoveragePercent(0, SOURCE_SIZE)).toBe(0);
  });

  test('caps at 100 when estimate exceeds source', () => {
    expect(getCoveragePercent(5_000, SOURCE_SIZE)).toBe(100);
  });
});

describe('getCefrLevel', () => {
  test('uses coverage thresholds so all bands are reachable on small lists', () => {
    expect(getCefrLevel(500, SOURCE_SIZE)).toBe('A1');
    expect(getCefrLevel(1_000, SOURCE_SIZE)).toBe('A2');
    expect(getCefrLevel(1_800, SOURCE_SIZE)).toBe('B1');
    expect(getCefrLevel(2_877, SOURCE_SIZE)).toBe('B2');
    expect(getCefrLevel(3_200, SOURCE_SIZE)).toBe('C1');
    expect(getCefrLevel(3_800, SOURCE_SIZE)).toBe('C2');
  });

  test('threshold boundaries match exported constants', () => {
    const below = (percent: number) =>
      Math.floor((SOURCE_SIZE * (percent - 1)) / 100);
    const at = (percent: number) =>
      Math.ceil((SOURCE_SIZE * percent) / 100);

    expect(getCoveragePercent(below(CEFR_COVERAGE_THRESHOLDS.A2), SOURCE_SIZE)).toBeLessThan(
      CEFR_COVERAGE_THRESHOLDS.A2
    );
    expect(getCefrLevel(at(CEFR_COVERAGE_THRESHOLDS.A2), SOURCE_SIZE)).toBe('A2');
    expect(getCefrLevel(at(CEFR_COVERAGE_THRESHOLDS.B1), SOURCE_SIZE)).toBe('B1');
    expect(getCefrLevel(at(CEFR_COVERAGE_THRESHOLDS.B2), SOURCE_SIZE)).toBe('B2');
    expect(getCefrLevel(at(CEFR_COVERAGE_THRESHOLDS.C1), SOURCE_SIZE)).toBe('C1');
    expect(getCefrLevel(at(CEFR_COVERAGE_THRESHOLDS.C2), SOURCE_SIZE)).toBe('C2');
  });
});

describe('pickReplacementFromBand', () => {
  const lemmas: Lemma[] = Array.from({ length: 20 }, (_, i) => ({
    lemma: `w${i + 1}`,
    frequency: 100 - i,
  }));
  const bands = splitIntoBands(rankLemmas(lemmas), 4);

  test('returns a lemma from the same band that is not excluded', () => {
    const band = bands[0]!;
    const exclude = new Set(band.lemmas.slice(0, -1).map((l) => l.lemma));
    const last = band.lemmas[band.lemmas.length - 1]!;

    const pick = pickReplacementFromBand(bands, band.index, exclude, () => 0);
    expect(pick).not.toBeNull();
    expect(pick!.lemma).toBe(last.lemma);
  });

  test('returns null when every lemma in the band is excluded', () => {
    const band = bands[1]!;
    const exclude = new Set(band.lemmas.map((l) => l.lemma));
    expect(pickReplacementFromBand(bands, band.index, exclude)).toBeNull();
  });

  test('returns null for an unknown band index', () => {
    expect(pickReplacementFromBand(bands, 99, new Set())).toBeNull();
  });
});

describe('estimateVocabulary excludes untested (flagged) slots by design', () => {
  test('known/total only reflect scored answers', () => {
    const words: TestWord[] = [
      { lemma: 'a', frequency: 10, rank: 1, band: 1, bandSize: 100 },
      { lemma: 'b', frequency: 9, rank: 2, band: 1, bandSize: 100 },
      { lemma: 'c', frequency: 5, rank: 11, band: 2, bandSize: 100 },
    ];
    // flagged words are omitted from both arrays before calling estimate
    const result = estimateVocabulary(words, [true, false, true], 200);
    expect(result.knownCount).toBe(2);
    expect(result.totalCount).toBe(3);
  });
});