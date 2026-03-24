import fs from 'node:fs'

const diffPath = process.env.USABILITY_PR_DIFF_PATH || 'pr-diff.json'
const outputPath = process.env.USABILITY_RULES_OUTPUT_PATH || 'rules-findings.json'
const configPath =
  process.env.USABILITY_CONFIG_PATH || '.github/usability-review/config/default.config.json'

const diff = JSON.parse(fs.readFileSync(diffPath, 'utf8'))
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'))

const findings = []
const addFinding = (severity, file, category, message, suggestion, rule_id) => {
  findings.push({ severity, file, category, message, suggestion, rule_id, source: 'rules' })
}

for (const file of diff.files || []) {
  const patch = file.patch || ''
  if (!patch) continue

  const controls = patch.match(/<(input|select|textarea)\b[^>]*>/gi) || []
  for (const control of controls) {
    if (!/(aria-label|aria-labelledby|id|name)\s*=/.test(control)) {
      addFinding(
        'High',
        file.filename,
        'WCAG Understandable',
        'Potential unlabeled form control can reduce usability and accessibility.',
        'Add an associated label, or aria-label/aria-labelledby with meaningful text.',
        'unlabeled_control',
      )
      break
    }
  }

  const clickableNonInteractive = patch.match(/<(div|span)\b[^>]*onClick\s*=\s*[^>]*>/gi) || []
  for (const node of clickableNonInteractive) {
    if (!/(onKeyDown|role|tabIndex)\s*=/.test(node)) {
      addFinding(
        'High',
        file.filename,
        'WCAG Operable',
        'Non-interactive element handles click without keyboard/focus support.',
        'Use button semantics or add keyboard handlers with role and tabIndex.',
        'non_interactive_onclick',
      )
      break
    }
  }

  if (/(width|minWidth|maxWidth|min-width|max-width)\s*:\s*['"]?[4-9]\d{2,}px['"]?/i.test(patch)) {
    addFinding(
      'Medium',
      file.filename,
      'Responsive',
      'Large fixed width may cause overflow on mobile.',
      'Use responsive breakpoints, fluid widths, or clamp-based sizing.',
      'fixed_large_width',
    )
  }
}

const summary = {
  total: findings.length,
  high: findings.filter((f) => f.severity === 'High').length,
  medium: findings.filter((f) => f.severity === 'Medium').length,
  low: findings.filter((f) => f.severity === 'Low').length,
}

const result = { findings, summary }
fs.writeFileSync(outputPath, JSON.stringify(result, null, 2))

const failOnHigh = Boolean(config?.failurePolicy?.failOnHigh)
if (failOnHigh && summary.high > 0) {
  console.error(`Deterministic usability checks found ${summary.high} high-severity issue(s).`)
  process.exit(1)
}

console.log(`Deterministic checks completed. Findings: ${summary.total}`)
