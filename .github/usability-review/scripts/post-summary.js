import fs from 'node:fs'

const eventPath = process.env.GITHUB_EVENT_PATH
const token = process.env.GITHUB_TOKEN
if (!eventPath || !token) {
  throw new Error('GITHUB_EVENT_PATH and GITHUB_TOKEN are required.')
}

const event = JSON.parse(fs.readFileSync(eventPath, 'utf8'))
const pr = event.pull_request
if (!pr?.number) {
  throw new Error('post-summary requires pull_request event context.')
}

const [owner, repo] = (process.env.GITHUB_REPOSITORY || '').split('/')
if (!owner || !repo) throw new Error('GITHUB_REPOSITORY must be owner/repo.')

const rules = fs.existsSync('rules-findings.json')
  ? JSON.parse(fs.readFileSync('rules-findings.json', 'utf8'))
  : { findings: [], summary: { total: 0, high: 0, medium: 0, low: 0 } }
const ai = fs.existsSync('ai-findings.json')
  ? JSON.parse(fs.readFileSync('ai-findings.json', 'utf8'))
  : {
      note: 'AI findings artifact unavailable (job may have failed before upload).',
      residual_risks: ['AI summary unavailable due to upstream failure.'],
      findings: [],
    }

const findings = rules.findings || []
const topFindings = findings.length
  ? findings.map((f) => `- ${f.severity} - \`${f.file}\` (${f.category}): ${f.message} Suggested fix: ${f.suggestion}`)
  : ['- No deterministic usability findings detected in this diff.']

const body = [
  '### Usability Review Summary',
  '',
  `- High: ${rules.summary?.high ?? 0}`,
  `- Medium: ${rules.summary?.medium ?? 0}`,
  `- Low: ${rules.summary?.low ?? 0}`,
  '',
  '#### Deterministic Checks',
  ...topFindings,
  '',
  '#### AI Review',
  ai.note || 'No AI review note available.',
  '',
  'Residual risk:',
  '- Visual contrast, animation timing, and real-device behavior still require manual validation.',
  '',
  'Reference rubric: `review-rubric.md`',
].join('\n')

const response = await fetch(
  `https://api.github.com/repos/${owner}/${repo}/issues/${pr.number}/comments`,
  {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
      'User-Agent': 'usability-review-summary',
    },
    body: JSON.stringify({ body }),
  },
)

if (!response.ok) {
  const text = await response.text()
  throw new Error(`Failed to post summary comment (${response.status}): ${text}`)
}

console.log('Posted usability summary comment.')
