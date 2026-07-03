import { describe, expect, test } from 'bun:test';
import {
  CEFR_COVERAGE_THRESHOLDS,
  getCefrLevel,
  getCoveragePercent,
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