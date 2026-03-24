# PR Usability Review Rubric

## Nielsen Heuristics
- Visibility of system status (feedback after actions, loading states, counts)
- Match between system and real world (plain language, user-centered labels)
- User control and freedom (undo/cancel, non-destructive defaults)
- Consistency and standards (interaction patterns and naming)
- Error prevention and recovery (validation, clear error guidance)

## WCAG 2.2 AA Focus
- Perceivable: contrast and non-color-only indicators
- Operable: keyboard navigation and focus visibility
- Understandable: labels, instructions, predictable behavior
- Robust: semantic HTML and ARIA used only when needed

## Responsive & Mobile
- Breakpoint-safe layouts without overflow
- Touch targets at least ~44x44 CSS pixels
- Readability and spacing under small widths
- Controls usable in portrait and landscape

## Severity
- High: likely blocks users or violates accessibility requirements
- Medium: causes friction or inconsistent behavior
- Low: polish issue, still worth improvement
