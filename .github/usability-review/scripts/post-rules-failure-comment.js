import fs from 'node:fs'

const eventPath = process.env.GITHUB_EVENT_PATH
const token = process.env.GITHUB_TOKEN
if (!eventPath || !token) {
  throw new Error('GITHUB_EVENT_PATH and GITHUB_TOKEN are required.')
}

const event = JSON.parse(fs.readFileSync(eventPath, 'utf8'))
const pr = event.pull_request
if (!pr?.number) throw new Error('pull_request context is required.')

const [owner, repo] = (process.env.GITHUB_REPOSITORY || '').split('/')
if (!owner || !repo) throw new Error('GITHUB_REPOSITORY must be owner/repo.')

const payload = JSON.parse(fs.readFileSync('rules-findings.json', 'utf8'))
const findings = payload.findings || []
const high = findings.filter((f) => f.severity === 'High').length
const medium = findings.filter((f) => f.severity === 'Medium').length

const body = [
  '### Usability Rules Failed',
  '',
  `Detected issues: ${findings.length} total (${high} high, ${medium} medium).`,
  '',
  '#### Found issues',
  ...(findings.length
    ? findings.map(
        (f) =>
          `- ${f.severity} - \`${f.file}\` (${f.category}): ${f.message} Suggested fix: ${f.suggestion}`,
      )
    : ['- No findings were serialized.']),
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
      'User-Agent': 'usability-review-rules',
    },
    body: JSON.stringify({ body }),
  },
)

if (!response.ok) {
  const text = await response.text()
  throw new Error(`Failed to post rules failure comment (${response.status}): ${text}`)
}

console.log('Posted deterministic failure comment.')
