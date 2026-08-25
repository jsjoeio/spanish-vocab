import newGithubIssueUrl from 'new-github-issue-url';

export const FLAGGED_LEMMAS_ISSUE_REPO = {
  user: 'jsjoeio',
  repo: 'spanish-frequency-list-maker',
} as const;

export const FLAGGED_LEMMAS_ISSUE_TITLE = 'Flagged lemmas from vocab test';

const ISSUE_INTRO =
  'these are the lemmas that i flagged that might be worth looking into:';

export function flaggedLemmasIssueBody(lemmas: Iterable<string>): string {
  const bullets = [...lemmas].map((lemma) => `- ${lemma}`);
  return [ISSUE_INTRO, ...bullets].join('\n');
}

export function flaggedLemmasIssueUrl(lemmas: Iterable<string>): string {
  return newGithubIssueUrl({
    user: FLAGGED_LEMMAS_ISSUE_REPO.user,
    repo: FLAGGED_LEMMAS_ISSUE_REPO.repo,
    title: FLAGGED_LEMMAS_ISSUE_TITLE,
    body: flaggedLemmasIssueBody(lemmas),
  });
}
