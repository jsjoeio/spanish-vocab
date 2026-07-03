export interface Word {
  word: string;
  rank: number;
}

export interface EstimateResult {
  estimate: number;
  knownCount: number;
  totalCount: number;
  level: string;
  feedback: string;
}

const TOTAL_LEMMAS = 50_000;

export function estimateVocabulary(
  words: Word[],
  answers: boolean[]
): EstimateResult {
  let knownWeight = 0;
  let totalWeight = 0;
  let knownCount = 0;

  for (let i = 0; i < words.length; i++) {
    const weight = 1 / Math.log10(words[i].rank + 10);
    totalWeight += weight;
    if (answers[i]) {
      knownWeight += weight;
      knownCount++;
    }
  }

  const ratio = totalWeight > 0 ? knownWeight / totalWeight : 0;
  const estimate = Math.round(ratio * TOTAL_LEMMAS);

  const { level, feedback } = getLevelFeedback(estimate, knownCount, words.length);

  return { estimate, knownCount, totalCount: words.length, level, feedback };
}

function getLevelFeedback(
  estimate: number,
  knownCount: number,
  totalCount: number
): { level: string; feedback: string } {
  if (estimate < 1_000) {
    return {
      level: "Beginner",
      feedback:
        "You're just getting started. Focus on the most common 500 words — they'll cover a large share of everyday conversation.",
    };
  }
  if (estimate < 3_000) {
    return {
      level: "Elementary",
      feedback:
        "You have a solid foundation. Keep building through reading and listening at your level — graded readers work well here.",
    };
  }
  if (estimate < 8_000) {
    return {
      level: "Intermediate",
      feedback:
        "You can handle most daily situations. Push into native content (podcasts, news, novels) to grow past the plateau.",
    };
  }
  if (estimate < 20_000) {
    return {
      level: "Advanced",
      feedback:
        "Strong command of the language. Refine nuance through varied genres and domains you don't encounter day to day.",
    };
  }
  return {
    level: "Near-native",
    feedback:
      `Impressive breadth — you knew ${knownCount} of ${totalCount} words in this sample. Keep exposing yourself to specialized vocabulary in areas that interest you.`,
  };
}