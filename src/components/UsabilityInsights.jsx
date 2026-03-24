import { Card, CardContent, Chip, Stack, Typography } from '@mui/material'

const insights = [
  { label: 'Heuristics', text: 'Clear system status through task counts and undo feedback.' },
  { label: 'WCAG', text: 'Keyboard interaction and semantic labels included for controls.' },
  { label: 'Responsive', text: 'Mobile-first stack and touch-friendly control heights.' },
]

function UsabilityInsights() {
  return (
    <Card elevation={0} sx={{ border: '1px dashed', borderColor: 'divider' }}>
      <CardContent>
        <Stack spacing={1.5}>
          <Typography variant="h6">Usability Insights</Typography>
          <Typography variant="body2" color="text.secondary">
            This panel highlights intentional UX decisions recruiters can inspect quickly.
          </Typography>
          {insights.map((insight) => (
            <Stack key={insight.label} direction="row" spacing={1} alignItems="flex-start">
              <Chip size="small" label={insight.label} color="primary" />
              <Typography variant="body2">{insight.text}</Typography>
            </Stack>
          ))}
        </Stack>
      </CardContent>
    </Card>
  )
}

export default UsabilityInsights
