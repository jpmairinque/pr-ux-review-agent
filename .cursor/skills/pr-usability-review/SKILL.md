---
name: pr-usability-review
description: Reviews pull request diffs for usability quality using Nielsen heuristics, WCAG 2.2 AA principles, and responsive design checks. Use when reviewing PRs, UX changes, accessibility updates, or front-end code diffs.
---

# PR Usability Review

## Goal
Provide structured, actionable review comments for pull requests with priority-ranked findings.

## Inputs
- PR title and description
- Unified diff and changed files
- Optional screenshots or recordings

## Review Workflow
1. Read only changed files and key surrounding context.
2. Evaluate each change across:
   - Nielsen heuristics
   - WCAG 2.2 AA
   - Responsive/mobile behavior
3. Report findings with:
   - Severity (`High`, `Medium`, `Low`)
   - File path and code reference
   - Why this impacts users
   - Concrete fix suggestion
4. If no issues are found, explicitly state that and note any residual testing gaps.

## Output Template
```markdown
### Usability Review
- High - `path/file.jsx`: Issue description. Why it matters. Suggested fix.
- Medium - `path/file.jsx`: Issue description. Why it matters. Suggested fix.

Residual risk:
- Mention gaps that need runtime/manual verification.
```

## Rule of Thumb
- Prefer evidence and user impact over stylistic preferences.
- Avoid speculative comments without code evidence.
