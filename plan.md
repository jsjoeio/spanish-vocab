# Spanish Vocabulary Estimator — PRD

## Vision

Build a free, accurate, open-source web tool to estimate Spanish vocabulary size (with potential support for other languages later). Inspired by Lenguia and SpeakZy, but more transparent and customizable.

## Why

- Measure real progress in language learning (OPOL, coaching, immersion).
- Full control over methodology and data.
- Avoid relying on external tools that produce inconsistent results.

## Phase 1 — Basic MVP

### Stack

- Astro + Tailwind CSS + TypeScript
- Bun as package manager
- 100% client-side (no backend)

### Features

- 50 hardcoded mock words (JSON)
- Clean test UI: Yes/No per word, progress indicator, "Finish" button
- Results screen with simulated vocabulary estimate and feedback

### Goal

A functional, polished UI to validate the user experience before connecting real data.

---

## Implementation Tasks

1. Create a new GitHub repository using GitHub CLI (`gh repo create`).
2. Initialize an Astro project with Tailwind and TypeScript.
3. Implement the basic vocabulary test:
   - 50 mock words in JSON
   - Test UI (Yes/No per word, progress, Finish button)
   - Results with simulated estimate and feedback
4. Keep everything client-side.
5. Simple, mobile-friendly design.

## Acceptance Criteria

- [ ] Public (or private) repo created with initial README
- [ ] `bun run dev` works and a full test can be completed end-to-end
- [ ] Clean, well-structured code with separated components
- [ ] Related: PREV-495, PREV-496

## Notes

- This is the visual and functional MVP. Real SUBTLEX data integration comes later.
- Do not add features beyond what is described here.
- Use atomic commits grouped by codebase area (e.g. `components: add ProgressBar`), not conventional commits.
- After creating the repo with README, push to main, then create a feature branch for Phase 1 so it can be reviewed in the GitHub UI.

## Future Phases (out of scope)

- Connect real frequency data from SUBTLEX
- Support for additional languages
- Advanced estimation methodology