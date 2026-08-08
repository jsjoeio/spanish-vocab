// per-source progress in localStorage
// tracks known + flagged lemmas so later tests skip them

export interface SourceProgress {
  sourceId: string;
  /** lemmas the user said they know (answered yes) */
  known: string[];
  /** lemmas flagged as invalid/misspelled */
  flagged: string[];
  updatedAt: string;
}

export const PROGRESS_STORAGE_PREFIX = 'spanish-vocab:progress:';

export function progressStorageKey(sourceId: string): string {
  return `${PROGRESS_STORAGE_PREFIX}${sourceId}`;
}

/** empty progress shell for a source */
export function emptyProgress(sourceId: string, now = () => new Date().toISOString()): SourceProgress {
  return {
    sourceId,
    known: [],
    flagged: [],
    updatedAt: now(),
  };
}

/**
 * union of known + flagged — lemmas that should not appear in a new test.
 */
export function excludedLemmas(progress: SourceProgress): Set<string> {
  return new Set([...progress.known, ...progress.flagged]);
}

/**
 * merge two progress records for the same source.
 * known and flagged are set-unions (order not preserved).
 */
export function mergeProgress(
  existing: SourceProgress,
  incoming: Pick<SourceProgress, 'known' | 'flagged'>,
  now = () => new Date().toISOString()
): SourceProgress {
  return {
    sourceId: existing.sourceId,
    known: [...new Set([...existing.known, ...incoming.known])],
    flagged: [...new Set([...existing.flagged, ...incoming.flagged])],
    updatedAt: now(),
  };
}

/** build a partial update from a finished test session */
export function progressFromSession(
  sourceId: string,
  testWords: { lemma: string }[],
  answers: boolean[],
  flaggedLemmas: Iterable<string>
): Pick<SourceProgress, 'known' | 'flagged'> {
  const known: string[] = [];
  const limit = Math.min(testWords.length, answers.length);
  for (let i = 0; i < limit; i++) {
    if (answers[i] === true) {
      const word = testWords[i];
      if (word) known.push(word.lemma);
    }
  }
  return {
    known,
    flagged: [...flaggedLemmas],
  };
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

/** validate and normalize a parsed progress payload; returns null if unusable */
export function parseProgress(raw: unknown, expectedSourceId?: string): SourceProgress | null {
  if (!raw || typeof raw !== 'object') return null;
  const record = raw as Record<string, unknown>;

  if (typeof record.sourceId !== 'string' || record.sourceId.length === 0) return null;
  if (expectedSourceId !== undefined && record.sourceId !== expectedSourceId) return null;
  if (!isStringArray(record.known) || !isStringArray(record.flagged)) return null;

  const updatedAt =
    typeof record.updatedAt === 'string' && record.updatedAt.length > 0
      ? record.updatedAt
      : new Date(0).toISOString();

  return {
    sourceId: record.sourceId,
    known: [...new Set(record.known)],
    flagged: [...new Set(record.flagged)],
    updatedAt,
  };
}

export type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

/** read progress for a source; missing/corrupt → empty progress */
export function loadProgress(
  sourceId: string,
  storage: StorageLike | null | undefined
): SourceProgress {
  if (!storage) return emptyProgress(sourceId);

  try {
    const raw = storage.getItem(progressStorageKey(sourceId));
    if (raw === null) return emptyProgress(sourceId);
    const parsed = parseProgress(JSON.parse(raw) as unknown, sourceId);
    return parsed ?? emptyProgress(sourceId);
  } catch {
    return emptyProgress(sourceId);
  }
}

/** write progress for a source (overwrites key) */
export function saveProgress(
  progress: SourceProgress,
  storage: StorageLike | null | undefined
): void {
  if (!storage) return;
  try {
    storage.setItem(progressStorageKey(progress.sourceId), JSON.stringify(progress));
  } catch {
    // quota / private mode — ignore
  }
}

/**
 * load existing progress for the source, merge session results, persist.
 * returns the merged record (empty-shell if storage unavailable).
 */
export function mergeAndSaveSession(
  sourceId: string,
  session: Pick<SourceProgress, 'known' | 'flagged'>,
  storage: StorageLike | null | undefined,
  now = () => new Date().toISOString()
): SourceProgress {
  const existing = loadProgress(sourceId, storage);
  const merged = mergeProgress(existing, session, now);
  saveProgress(merged, storage);
  return merged;
}
