import dayjs from 'dayjs'
import {
  Box,
  Checkbox,
  Chip,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined'
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined'
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined'
import { useState } from 'react'

const PRIORITY_COLORS = {
  low: 'default',
  medium: 'primary',
  high: 'error',
}

function TodoItem({ task, onToggle, onDelete, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false)
  const [draftTitle, setDraftTitle] = useState(task.title)

  const saveEdit = () => {
    const trimmed = draftTitle.trim()
    if (!trimmed) return
    onUpdate(task.id, { title: trimmed })
    setIsEditing(false)
  }

  const cancelEdit = () => {
    setDraftTitle(task.title)
    setIsEditing(false)
  }

  return (
    <Box
      role="listitem"
      sx={{
        p: 1.5,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }}>
        <Checkbox
          inputProps={{ 'aria-label': `Mark ${task.title} as completed` }}
          checked={task.completed}
          onChange={() => onToggle(task.id)}
        />

        <Box sx={{ flex: 1, minWidth: 0 }}>
          {isEditing ? (
            <TextField
              fullWidth
              value={draftTitle}
              label="Task title"
              onChange={(event) => setDraftTitle(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') saveEdit()
                if (event.key === 'Escape') cancelEdit()
              }}
            />
          ) : (
            <Typography
              sx={{
                textDecoration: task.completed ? 'line-through' : 'none',
                color: task.completed ? 'text.secondary' : 'text.primary',
                wordBreak: 'break-word',
              }}
            >
              {task.title}
            </Typography>
          )}

          <Stack direction="row" spacing={1} mt={1} flexWrap="wrap" useFlexGap>
            <Chip
              size="small"
              label={`Priority: ${task.priority}`}
              color={PRIORITY_COLORS[task.priority]}
              variant={task.priority === 'low' ? 'outlined' : 'filled'}
            />
            {task.dueDate ? (
              <Chip
                size="small"
                variant="outlined"
                label={`Due ${dayjs(task.dueDate).format('MMM D, YYYY')}`}
              />
            ) : null}
          </Stack>
        </Box>

        <Stack direction="row" spacing={0.5} alignSelf={{ xs: 'flex-end', sm: 'center' }}>
          {isEditing ? (
            <>
              <Tooltip title="Save changes">
                <IconButton aria-label="save task changes" onClick={saveEdit}>
                  <SaveOutlinedIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Cancel editing">
                <IconButton aria-label="cancel task editing" onClick={cancelEdit}>
                  <CloseOutlinedIcon />
                </IconButton>
              </Tooltip>
            </>
          ) : (
            <>
              <Tooltip title="Edit task">
                <IconButton aria-label={`edit ${task.title}`} onClick={() => setIsEditing(true)}>
                  <EditOutlinedIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete task">
                <IconButton aria-label={`delete ${task.title}`} onClick={() => onDelete(task.id)}>
                  <DeleteOutlineOutlinedIcon />
                </IconButton>
              </Tooltip>
            </>
          )}
        </Stack>
      </Stack>
    </Box>
  )
}

export default TodoItem
