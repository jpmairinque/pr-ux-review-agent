import fs from 'node:fs'

const diffPath = process.env.USABILITY_PR_DIFF_PATH || 'pr-diff.json'
const outputPath = process.env.USABILITY_AI_OUTPUT_PATH || 'ai-findings.json'
const configPath =
  process.env.USABILITY_CONFIG_PATH || '.github/usability-review/config/default.config.json'
const schemaPath =
  process.env.USABILITY_AI_SCHEMA_PATH || '.github/usability-review/contracts/ai-review.schema.json'
const rubricPath = process.env.USABILITY_RUBRIC_PATH || 'review-rubric.md'
const skillPath = process.env.USABILITY_SKILL_PATH || '.cursor/skills/pr-usability-review/SKILL.md'

const config = JSON.parse(fs.readFileSync(configPath, 'utf8'))
const diff = JSON.parse(fs.readFileSync(diffPath, 'utf8'))
const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'))
const rubric = fs.readFileSync(rubricPath, 'utf8')
const skill = fs.readFileSync(skillPath, 'utf8')

const provider = config?.ai?.provider || 'mock'
const requireApiKey = Boolean(config?.ai?.requireApiKey)
const apiKey = process.env.OPENAI_API_KEY || ''

if (requireApiKey && !apiKey) {
  throw new Error('OPENAI_API_KEY is required for usability_ai_review but was not provided.')
}

const result = {
  source: 'ai',
  ai_available: Boolean(apiKey),
  note:
    provider === 'mock'
      ? 'Provider set to mock. Replace adapter logic in run-ai-review.js for real model calls.'
      : 'Provider configured. Integrate provider SDK/API call here using the schema contract.',
  context: {
    changed_files: (diff.files || []).length,
    rubric_loaded: rubric.length > 0,
    skill_loaded: skill.length > 0,
    provider,
  },
  findings: [],
  residual_risks: [
    'Visual contrast and interaction behavior require runtime validation.',
    'Cross-file UX flow issues may require semantic AI checks and screenshots.',
  ],
}

function validateAgainstContract(output, contract) {
  const required = contract.required || []
  for (const key of required) {
    if (!(key in output)) {
      throw new Error(`AI output missing required field: ${key}`)
    }
  }
  if (output.source !== 'ai') throw new Error('AI output source must be "ai".')
  if (!Array.isArray(output.findings)) throw new Error('AI output findings must be an array.')
  if (!Array.isArray(output.residual_risks)) {
    throw new Error('AI output residual_risks must be an array.')
  }
}

validateAgainstContract(result, schema)
fs.writeFileSync(outputPath, JSON.stringify(result, null, 2))
console.log(`AI review output written to ${outputPath}`)
