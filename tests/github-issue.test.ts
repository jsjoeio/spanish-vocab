import { describe, expect, test } from 'bun:test';
import {
  FLAGGED_LEMMAS_ISSUE_REPO,
  FLAGGED_LEMMAS_ISSUE_TITLE,
  flaggedLemmasIssueBody,
  flaggedLemmasIssueUrl,
} from '../src/lib/github-issue';

describe('flaggedLemmasIssueBody', () => {
  test('lists lemmas under the tracking intro', () => {
    expect(flaggedLemmasIssueBody(['foo', 'bar'])).toBe(
      [
        'these are the lemmas that i flagged that might be worth looking into:',
        '- foo',
        '- bar',
      ].join('\n')
    );
  });

  test('keeps intro when the list is empty', () => {
    expect(flaggedLemmasIssueBody([])).toBe(
      'these are the lemmas that i flagged that might be worth looking into:'
    );
  });
});

describe('flaggedLemmasIssueUrl', () => {
  test('opens a new issue on the frequency-list repo with title and body', () => {
    const lemmas = ['abc', 'def'];
    const url = new URL(flaggedLemmasIssueUrl(lemmas));

    expect(url.origin).toBe('https://github.com');
    expect(url.pathname).toBe(
      `/${FLAGGED_LEMMAS_ISSUE_REPO.user}/${FLAGGED_LEMMAS_ISSUE_REPO.repo}/issues/new`
    );
    expect(url.searchParams.get('title')).toBe(FLAGGED_LEMMAS_ISSUE_TITLE);
    expect(url.searchParams.get('body')).toBe(flaggedLemmasIssueBody(lemmas));
  });
});
