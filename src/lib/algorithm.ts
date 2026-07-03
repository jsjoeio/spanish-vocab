// vocabulary estimation algorithm
// pure functions only — no fetch, no DOM, no randomness at module level

// --- data types ---

export interface Lemma {
  lemma: string;
  frequency: number;
}

export interface RankedLemma extends Lemma {
  rank: number;
}

export interface Band {
  index: number;
  size: number;
  lemmas: RankedLemma[];
}

export interface TestWord extends RankedLemma {
  band: number;
  bandSize: number;
}

export interface BandResult {
  band: number;
  bandSize: number;
  known: number;
  tested: number;
  percentKnown: number;
}

export interface EstimateResult {
  estimate: number;
  low: number;
  high: number;
  knownCount: number;
  totalCount: number;
  coveragePercent: number;
  cefr: string;
  level: string;
  feedback: string;
  bandResults: BandResult[];
  sourceSize: number;
}

/** CEFR bands by % of the active frequency list known (works for any list size) */
export const CEFR_COVERAGE_THRESHOLDS = {
  A2: 25,
  B1: 45,
  B2: 60,
  C1: 75,
  C2: 90,
} as const;

export interface TestConfig {
  bandCount?: number;
  wordsPerBand?: number;
  maxWords?: number;
  confidenceMargin?: number;
}

const DEFAULT_CONFIG: Required<TestConfig> = {
  bandCount: 10,
  wordsPerBand: 5,
  maxWords: 50,
  confidenceMargin: 0.1,
};

// --- pure transforms ---

/** assign 1-based rank by position in the sorted frequency list */
export function rankLemmas(lemmas: Lemma[]): RankedLemma[] {
  return lemmas.map((l, i) => ({ ...l, rank: i + 1 }));
}

/**
 * split a frequency list into equal decile bands.
 * works with any list size — band sizes adapt automatically.
 */
export function splitIntoBands(
  lemmas: RankedLemma[],
  bandCount = DEFAULT_CONFIG.bandCount
): Band[] {
  const n = lemmas.length;
  if (n === 0) return [];

  const effectiveBandCount = Math.max(1, Math.min(bandCount, n));

  return Array.from({ length: effectiveBandCount }, (_, i) => {
    const start = Math.floor((i * n) / effectiveBandCount);
    const end = Math.floor(((i + 1) * n) / effectiveBandCount);
    return {
      index: i + 1,
      size: end - start,
      lemmas: lemmas.slice(start, end),
    };
  }).filter((b) => b.size > 0);
}

/** fisher-yates shuffle — isolated here so sampling stays reproducible in tests if seeded later */
export function shuffle<T>(items: T[], rng: () => number = Math.random): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * sample wordsPerBand lemmas from each band, capped at maxWords total.
 * shuffles final order so band progression isn't obvious during the test.
 */
export function sampleTestWords(
  bands: Band[],
  config: TestConfig = {},
  rng: () => number = Math.random
): TestWord[] {
  const { wordsPerBand, maxWords } = { ...DEFAULT_CONFIG, ...config };
  const sampled: TestWord[] = [];

  for (const band of bands) {
    if (sampled.length >= maxWords) break;

    const count = Math.min(wordsPerBand, band.lemmas.length, maxWords - sampled.length);
    const picks = shuffle(band.lemmas, rng).slice(0, count);

    for (const lemma of picks) {
      sampled.push({ ...lemma, band: band.index, bandSize: band.size });
    }
  }

  return shuffle(sampled, rng);
}

/**
 * estimate vocabulary using stratified band scoring:
 *   estimate = Σ (band_size × %known_in_band)
 *
 * only bands that were actually tested contribute (supports early finish).
 * confidence interval is a simple ±margin% smoothing layer.
 */
export function estimateVocabulary(
  testWords: TestWord[],
  answers: boolean[],
  sourceSize: number,
  config: TestConfig = {}
): EstimateResult {
  const { confidenceMargin } = { ...DEFAULT_CONFIG, ...config };

  if (answers.length > testWords.length) {
    throw new Error(
      `answers length (${answers.length}) exceeds testWords length (${testWords.length})`
    );
  }

  // group answers by band
  const bandMap = new Map<number, { bandSize: number; known: number; tested: number }>();

  for (let i = 0; i < answers.length; i++) {
    const word = testWords[i];
    if (!word) {
      throw new Error(`missing testWord at index ${i}`);
    }
    const entry = bandMap.get(word.band) ?? {
      bandSize: word.bandSize,
      known: 0,
      tested: 0,
    };
    entry.tested++;
    if (answers[i]) entry.known++;
    bandMap.set(word.band, entry);
  }

  const bandResults: BandResult[] = [...bandMap.entries()]
    .sort(([a], [b]) => a - b)
    .map(([band, stats]) => ({
      band,
      bandSize: stats.bandSize,
      known: stats.known,
      tested: stats.tested,
      percentKnown: stats.tested > 0 ? stats.known / stats.tested : 0,
    }));

  // core formula: sum each band's size weighted by how many were known
  const rawEstimate = Math.round(
    bandResults.reduce((sum, b) => sum + b.bandSize * b.percentKnown, 0)
  );

  const estimate = Math.min(Math.max(rawEstimate, 0), sourceSize);
  const low = Math.min(
    Math.max(Math.round(estimate * (1 - confidenceMargin)), 0),
    sourceSize
  );
  const high = Math.min(
    Math.max(Math.round(estimate * (1 + confidenceMargin)), 0),
    sourceSize
  );

  const knownCount = answers.filter(Boolean).length;
  const totalCount = answers.length;
  const coveragePercent = getCoveragePercent(estimate, sourceSize);

  const cefr = getCefrLevel(estimate, sourceSize);
  const { level, feedback } = getLevelFeedback(
    coveragePercent,
    knownCount,
    totalCount,
    cefr
  );

  return {
    estimate,
    low,
    high,
    knownCount,
    totalCount,
    coveragePercent,
    cefr,
    level,
    feedback,
    bandResults,
    sourceSize,
  };
}

/** % of lemmas known in the active frequency list (0–100) */
export function getCoveragePercent(estimate: number, sourceSize: number): number {
  if (sourceSize <= 0) return 0;
  return Math.min(100, Math.round((estimate / sourceSize) * 100));
}

/** map corpus coverage % to an indicative CEFR band for this word list */
export function getCefrLevel(estimate: number, sourceSize: number): string {
  const coverage = getCoveragePercent(estimate, sourceSize);
  if (coverage >= CEFR_COVERAGE_THRESHOLDS.C2) return 'C2';
  if (coverage >= CEFR_COVERAGE_THRESHOLDS.C1) return 'C1';
  if (coverage >= CEFR_COVERAGE_THRESHOLDS.B2) return 'B2';
  if (coverage >= CEFR_COVERAGE_THRESHOLDS.B1) return 'B1';
  if (coverage >= CEFR_COVERAGE_THRESHOLDS.A2) return 'A2';
  return 'A1';
}

function getLevelFeedback(
  coveragePercent: number,
  knownCount: number,
  totalCount: number,
  cefr: string
): { level: string; feedback: string } {
  const levels: Record<string, { level: string; feedback: string }> = {
    A1: {
      level: 'Beginner (A1)',
      feedback:
        `you know roughly ${coveragePercent}% of this list — still building a foundation. focus on the most frequent words first.`,
    },
    A2: {
      level: 'Elementary (A2)',
      feedback:
        `about ${coveragePercent}% coverage. you recognize many common words in this corpus; keep listening to content at your level.`,
    },
    B1: {
      level: 'Intermediate (B1)',
      feedback:
        `about ${coveragePercent}% coverage. you handle a solid share of this parenting and daily-life vocabulary.`,
    },
    B2: {
      level: 'Upper intermediate (B2)',
      feedback:
        `about ${coveragePercent}% coverage. strong grasp of this corpus — push into the less frequent bands.`,
    },
    C1: {
      level: 'Advanced (C1)',
      feedback:
        `about ${coveragePercent}% coverage. you know most of the vocabulary in this rioplatense parenting list.`,
    },
    C2: {
      level: 'Near-native (C2)',
      feedback:
        `about ${coveragePercent}% coverage — you knew ${knownCount} of ${totalCount} sampled words. few gaps remain in this list.`,
    },
  };

  return levels[cefr] ?? levels.A1;
}

/** convenience: rank → band → sample in one call */
export function buildTest(
  lemmas: Lemma[],
  config: TestConfig = {},
  rng: () => number = Math.random
): TestWord[] {
  const ranked = rankLemmas(lemmas);
  const bands = splitIntoBands(ranked, config.bandCount ?? DEFAULT_CONFIG.bandCount);
  return sampleTestWords(bands, config, rng);
}