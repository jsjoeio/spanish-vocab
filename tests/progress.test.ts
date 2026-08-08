import { describe, expect, test } from 'bun:test';
import {
  emptyProgress,
  excludedLemmas,
  loadProgress,
  mergeAndSaveSession,
  mergeProgress,
  parseProgress,
  progressFromSession,
  progressStorageKey,
  saveProgress,
  type StorageLike,
} from '../src/lib/progress';

function memoryStorage(initial: Record<string, string> = {}): StorageLike & {
  data: Record<string, string>;
} {
  const data = { ...initial };
  return {
    data,
    getItem(key: string) {
      return key in data ? data[key]! : null;
    },
    setItem(key: string, value: string) {
      data[key] = value;
    },
    removeItem(key: string) {
      delete data[key];
    },
  };
}

describe('progressStorageKey', () => {
  test('scopes keys by source id', () => {
    expect(progressStorageKey('rioplatense-parenting')).toBe(
      'spanish-vocab:progress:rioplatense-parenting'
    );
  });
});

describe('parseProgress', () => {
  test('accepts a valid payload', () => {
    const parsed = parseProgress({
      sourceId: 'src-a',
      known: ['hola', 'mundo'],
      flagged: ['xyz'],
      updatedAt: '2026-01-01T00:00:00.000Z',
    });
    expect(parsed).toEqual({
      sourceId: 'src-a',
      known: ['hola', 'mundo'],
      flagged: ['xyz'],
      updatedAt: '2026-01-01T00:00:00.000Z',
    });
  });

  test('dedupes known and flagged', () => {
    const parsed = parseProgress({
      sourceId: 'src-a',
      known: ['a', 'a', 'b'],
      flagged: ['c', 'c'],
    });
    expect(parsed?.known).toEqual(['a', 'b']);
    expect(parsed?.flagged).toEqual(['c']);
  });

  test('rejects wrong source id when expected', () => {
    expect(
      parseProgress(
        { sourceId: 'other', known: [], flagged: [] },
        'rioplatense-parenting'
      )
    ).toBeNull();
  });

  test('rejects malformed payloads', () => {
    expect(parseProgress(null)).toBeNull();
    expect(parseProgress({})).toBeNull();
    expect(parseProgress({ sourceId: 'a', known: 'nope', flagged: [] })).toBeNull();
    expect(parseProgress({ sourceId: 'a', known: [1], flagged: [] })).toBeNull();
  });
});

describe('mergeProgress', () => {
  test('unions known and flagged without duplicates', () => {
    const existing = emptyProgress('src-a', () => 't0');
    existing.known = ['a', 'b'];
    existing.flagged = ['x'];

    const merged = mergeProgress(
      existing,
      { known: ['b', 'c'], flagged: ['x', 'y'] },
      () => 't1'
    );

    expect(merged.sourceId).toBe('src-a');
    expect(merged.known.sort()).toEqual(['a', 'b', 'c']);
    expect(merged.flagged.sort()).toEqual(['x', 'y']);
    expect(merged.updatedAt).toBe('t1');
  });
});

describe('excludedLemmas', () => {
  test('combines known and flagged', () => {
    const progress = emptyProgress('src');
    progress.known = ['a'];
    progress.flagged = ['b', 'a'];
    expect([...excludedLemmas(progress)].sort()).toEqual(['a', 'b']);
  });
});

describe('progressFromSession', () => {
  test('keeps only yes-answers as known; ignores no-answers', () => {
    const session = progressFromSession(
      'src',
      [{ lemma: 'si' }, { lemma: 'no' }, { lemma: 'talvez' }],
      [true, false, true],
      ['flagged-word']
    );
    expect(session.known).toEqual(['si', 'talvez']);
    expect(session.flagged).toEqual(['flagged-word']);
  });

  test('handles early finish (fewer answers than words)', () => {
    const session = progressFromSession(
      'src',
      [{ lemma: 'a' }, { lemma: 'b' }, { lemma: 'c' }],
      [true],
      []
    );
    expect(session.known).toEqual(['a']);
  });
});

describe('loadProgress / saveProgress / mergeAndSaveSession', () => {
  test('returns empty progress when key is missing', () => {
    const storage = memoryStorage();
    const loaded = loadProgress('src-a', storage);
    expect(loaded.sourceId).toBe('src-a');
    expect(loaded.known).toEqual([]);
    expect(loaded.flagged).toEqual([]);
  });

  test('round-trips through storage', () => {
    const storage = memoryStorage();
    const progress = {
      sourceId: 'src-a',
      known: ['hola'],
      flagged: ['bad'],
      updatedAt: '2026-02-01T00:00:00.000Z',
    };
    saveProgress(progress, storage);
    expect(loadProgress('src-a', storage)).toEqual(progress);
  });

  test('survives corrupt JSON by returning empty', () => {
    const storage = memoryStorage({
      [progressStorageKey('src-a')]: '{not-json',
    });
    expect(loadProgress('src-a', storage).known).toEqual([]);
  });

  test('mergeAndSaveSession creates then merges', () => {
    const storage = memoryStorage();
    const first = mergeAndSaveSession(
      'src-a',
      { known: ['a'], flagged: ['x'] },
      storage,
      () => 't1'
    );
    expect(first.known).toEqual(['a']);
    expect(first.flagged).toEqual(['x']);

    const second = mergeAndSaveSession(
      'src-a',
      { known: ['b'], flagged: ['y'] },
      storage,
      () => 't2'
    );
    expect(second.known.sort()).toEqual(['a', 'b']);
    expect(second.flagged.sort()).toEqual(['x', 'y']);
    expect(second.updatedAt).toBe('t2');
    expect(loadProgress('src-a', storage)).toEqual(second);
  });

  test('no-ops safely when storage is unavailable', () => {
    expect(loadProgress('src', null).known).toEqual([]);
    expect(() =>
      saveProgress(emptyProgress('src'), null)
    ).not.toThrow();
    expect(
      mergeAndSaveSession('src', { known: ['a'], flagged: [] }, undefined).known
    ).toEqual(['a']);
  });
});
