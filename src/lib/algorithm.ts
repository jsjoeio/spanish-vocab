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
  cefr: string;
  level: string;
  feedback: string;
  bandResults: BandResult[];
  sourceSize: number;
}

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

  return Array.from({ length: bandCount }, (_, i) => {
    const start = Math.floor((i * n) / bandCount);
    const end = Math.floor(((i + 1) * n) / bandCount);
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

  // group answers by band
  const bandMap = new Map<number, { bandSize: number; known: number; tested: number }>();

  for (let i = 0; i < answers.length; i++) {
    const word = testWords[i];
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
  const estimate = Math.round(
    bandResults.reduce((sum, b) => sum + b.bandSize * b.percentKnown, 0)
  );

  const low = Math.round(estimate * (1 - confidenceMargin));
  const high = Math.round(estimate * (1 + confidenceMargin));

  const knownCount = answers.filter(Boolean).length;
  const totalCount = answers.length;

  const cefr = getCefrLevel(estimate);
  const { level, feedback } = getLevelFeedback(estimate, knownCount, totalCount, cefr);

  return {
    estimate,
    low,
    high,
    knownCount,
    totalCount,
    cefr,
    level,
    feedback,
    bandResults,
    sourceSize,
  };
}

/** map vocabulary estimate (lemmas) to CEFR — aligned with Lenguia/SpeakZy-style test data */
export function getCefrLevel(estimate: number): string {
  if (estimate < 800) return 'A1';
  if (estimate < 2_000) return 'A2';
  if (estimate < 4_000) return 'B1';
  if (estimate < 7_500) return 'B2';
  if (estimate < 12_000) return 'C1';
  return 'C2';
}

function getLevelFeedback(
  estimate: number,
  knownCount: number,
  totalCount: number,
  cefr: string
): { level: string; feedback: string } {
  const levels: Record<string, { level: string; feedback: string }> = {
    A1: {
      level: 'Beginner (A1)',
      feedback:
        'you\'re building a foundation. focus on the most frequent words in everyday rioplatense speech.',
    },
    A2: {
      level: 'Elementary (A2)',
      feedback:
        'you recognize common words in familiar topics. keep listening to native content at your level.',
    },
    B1: {
      level: 'Intermediate (B1)',
      feedback:
        'you handle most parenting and daily-life vocabulary. try podcasts and videos slightly above your level.',
    },
    B2: {
      level: 'Upper intermediate (B2)',
      feedback:
        'strong grasp of this corpus. push into less frequent words by reading and listening more broadly.',
    },
    C1: {
      level: 'Advanced (C1)',
      feedback:
        'excellent breadth. you know most of the vocabulary in this rioplatense parenting corpus.',
    },
    C2: {
      level: 'Near-native (C2)',
      feedback:
        `impressive — you knew ${knownCount} of ${totalCount} sampled words. few gaps remain in this frequency list.`,
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