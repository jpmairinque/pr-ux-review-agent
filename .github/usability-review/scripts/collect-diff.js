import fs from 'node:fs'

const eventPath = process.env.GITHUB_EVENT_PATH
const token = process.env.GITHUB_TOKEN
const outputPath = process.env.USABILITY_PR_DIFF_PATH || 'pr-diff.json'
const includeExtensions = (process.env.USABILITY_INCLUDE_EXTENSIONS || 'jsx,js,tsx,ts,css,scss')
  .split(',')
  .map((value) => value.trim().toLowerCase())
  .filter(Boolean)

if (!eventPath) {
  throw new Error('GITHUB_EVENT_PATH is required.')
}

if (!token) {
  throw new Error('GITHUB_TOKEN is required.')
}

const event = JSON.parse(fs.readFileSync(eventPath, 'utf8'))
const pr = event.pull_request
if (!pr?.number) {
  throw new Error('This script requires a pull_request event context.')
}

const [owner, repo] = (process.env.GITHUB_REPOSITORY || '').split('/')
if (!owner || !repo) {
  throw new Error('GITHUB_REPOSITORY is required in owner/repo format.')
}

const headers = {
  Authorization: `Bearer ${token}`,
  Accept: 'application/vnd.github+json',
  'User-Agent': 'usability-review-collector',
}

async function fetchAllFiles() {
  const items = []
  let page = 1

  while (true) {
    const url = `https://api.github.com/repos/${owner}/${repo}/pulls/${pr.number}/files?per_page=100&page=${page}`
    const response = await fetch(url, { headers })
    if (!response.ok) {
      const text = await response.text()
      throw new Error(`Failed to fetch PR files (${response.status}): ${text}`)
    }
    const pageItems = await response.json()
    if (!Array.isArray(pageItems) || pageItems.length === 0) break
    items.push(...pageItems)
    if (pageItems.length < 100) break
    page += 1
  }

  return items
}

const files = await fetchAllFiles()
const filtered = files
  .filter((item) => {
    const ext = item.filename.split('.').pop()?.toLowerCase()
    return ext && includeExtensions.includes(ext)
  })
  .map((item) => ({
    filename: item.filename,
    status: item.status,
    patch: item.patch || '',
  }))

const payload = {
  pull_request: {
    number: pr.number,
    title: pr.title || '',
    body: pr.body || '',
  },
  repository: { owner, repo },
  files: filtered,
}

fs.writeFileSync(outputPath, JSON.stringify(payload, null, 2))
console.log(`Collected ${filtered.length} changed files into ${outputPath}`)
