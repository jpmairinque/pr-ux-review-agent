# PR UX Reviewer

This app is a **demonstration app for pull request-driven UX review**.
It uses a minimal React frontend only as a surface to show how automated usability checks run in GitHub PR pipelines, report findings, and gate merges.

## Project Goal

- Demonstrate how UX quality can be reviewed directly in pull requests.
- Provide a lightweight frontend baseline for pipeline-based usability checks.
- Run automated quality checks on every change.
- Catch common usability and accessibility issues early in PRs.

## Tech Stack

- React 19 + Vite
- Material UI
- ESLint + Vitest
- GitHub Actions for CI and UX review automation

## Local Development

```bash
npm install
npm run dev
```

Useful scripts:

- `npm run lint`
- `npm run test`
- `npm run build`

## CI and UX Pipeline

This repository uses two complementary workflows:

### 1) General CI (`.github/workflows/ci.yml`)

Runs on push to `main`/`master` and on pull requests:

1. Checkout code
2. Setup Node.js 22
3. `npm ci`
4. `npm run lint`
5. `npm run test`
6. `npm run build`

This ensures baseline code quality and build health.

### 2) Usability PR Review (`.github/workflows/usability-review.yml`)

Runs on PR events (`opened`, `synchronize`, `reopened`) and has four jobs:

1. **`collect_diff`**
   - Collects changed files and patches from the PR.
   - Filters to UI-relevant files: `.jsx`, `.js`, `.tsx`, `.ts`, `.css`, `.scss`.
   - Stores them as `pr-diff.json` artifact.

2. **`usability_rules`** (deterministic checks)
   - Parses `pr-diff.json`.
   - Applies rule-based UX/a11y checks directly on changed patch content.
   - Produces `rules-findings.json`.
   - Posts PR comments when issues are found.
   - **Fails the workflow when high-severity findings exist**.

3. **`usability_ai_review`** (AI placeholder integration)
   - Requires `OPENAI_API_KEY` secret.
   - Loads:
     - PR diff artifact
     - `review-rubric.md`
     - `.cursor/skills/pr-usability-review/SKILL.md`
   - Emits `ai-findings.json` (currently placeholder output, ready for provider integration).

4. **`usability_summary`**
   - Consolidates deterministic + AI artifacts.
   - Posts one PR summary comment with counts and residual risks.

## UX Principles Checked

The project checks UX quality through both rubric guidance and deterministic PR rules.

### A) Deterministic checks currently enforced in pipeline

1. **WCAG Understandable**
   - Detects potential unlabeled form controls (`input`, `select`, `textarea`) in diffs.
   - Flags missing label semantics (e.g., no `aria-label`, `aria-labelledby`, `id`, or `name`).

2. **WCAG Operable**
   - Detects clickable non-interactive elements (e.g., `div`/`span` with `onClick`).
   - Flags missing keyboard/focus semantics (`onKeyDown`, `role`, `tabIndex`).

3. **Responsive Design**
   - Detects large fixed pixel widths that can break small screens.
   - Flags likely overflow risk and suggests fluid/responsive sizing.

### B) Full rubric principles used for UX review

From `review-rubric.md`:

#### Nielsen Heuristics

- Visibility of system status
- Match between system and real world
- User control and freedom
- Consistency and standards
- Error prevention and recovery

#### WCAG 2.2 AA Focus

- Perceivable
- Operable
- Understandable
- Robust

#### Responsive and Mobile

- Breakpoint-safe layouts without overflow
- Touch targets at least ~44x44 CSS pixels
- Readability and spacing on small widths
- Controls usable in portrait and landscape

## Severity Model

- **High**: likely blocks users or violates accessibility requirements
- **Medium**: causes friction or inconsistency
- **Low**: polish issue worth improving

## Notes

- The UI is intentionally simple and serves only as a testbed for the review workflow.
- Deterministic checks are fast and enforceable in CI.
- AI review is scaffolded and can be upgraded to strict JSON-based model output for richer UX findings.
