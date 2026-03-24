import { useEffect, useMemo, useState } from 'react'
import dayjs from 'dayjs'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material'
import TodoItem from './TodoItem'

const STORAGE_KEY = 'todo-ux-lab-tasks-v1'

function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function TodoList() {
  const [tasks, setTasks] = useState(() => loadTasks())
  const [title, setTitle] = useState('')
  const [search, setSearch] = useState('')
  const [priority, setPriority] = useState('medium')
  const [dueDate, setDueDate] = useState('')
  const [filter, setFilter] = useState('all')
  const [sort, setSort] = useState('newest')
  const [error, setError] = useState('')
  const [undoSnapshot, setUndoSnapshot] = useState(null)
  const [snackOpen, setSnackOpen] = useState(false)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
  }, [tasks])

  const addTask = () => {
    const trimmed = title.trim()
    if (!trimmed) {
      setError('Task title is required.')
      return
    }

    const newTask = {
      id: crypto.randomUUID(),
      title: trimmed,
      priority,
      dueDate: dueDate || null,
      completed: false,
      createdAt: Date.now(),
    }

    setTasks((prev) => [newTask, ...prev])
    setTitle('')
    setPriority('medium')
    setDueDate('')
    setError('')
  }

  const updateTask = (taskId, updates) => {
    setTasks((prev) => prev.map((task) => (task.id === taskId ? { ...task, ...updates } : task)))
  }

  const toggleTask = (taskId) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed, updatedAt: Date.now() } : task,
      ),
    )
  }

  const deleteTask = (taskId) => {
    const removed = tasks.find((task) => task.id === taskId)
    if (!removed) return
    setUndoSnapshot(removed)
    setTasks((prev) => prev.filter((task) => task.id !== taskId))
    setSnackOpen(true)
  }

  const restoreLastDelete = () => {
    if (!undoSnapshot) return
    setTasks((prev) => [undoSnapshot, ...prev])
    setSnackOpen(false)
    setUndoSnapshot(null)
  }

  const clearCompleted = () => {
    setTasks((prev) => prev.filter((task) => !task.completed))
  }

  const markAllCompleted = () => {
    setTasks((prev) => prev.map((task) => ({ ...task, completed: true })))
  }

  const filteredTasks = useMemo(() => {
    const searched = tasks.filter((task) =>
      task.title.toLowerCase().includes(search.trim().toLowerCase()),
    )

    const byStatus = searched.filter((task) => {
      if (filter === 'active') return !task.completed
      if (filter === 'completed') return task.completed
      return true
    })

    return [...byStatus].sort((a, b) => {
      if (sort === 'newest') return b.createdAt - a.createdAt
      if (sort === 'oldest') return a.createdAt - b.createdAt
      if (sort === 'due-soon') {
        const dueA = a.dueDate ? dayjs(a.dueDate).valueOf() : Number.MAX_SAFE_INTEGER
        const dueB = b.dueDate ? dayjs(b.dueDate).valueOf() : Number.MAX_SAFE_INTEGER
        return dueA - dueB
      }
      return a.title.localeCompare(b.title)
    })
  }, [tasks, search, filter, sort])

  const completedCount = tasks.filter((task) => task.completed).length

  return (
    <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
      <CardContent>
        <Stack spacing={2}>
          <Typography variant="h6">Tasks</Typography>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <TextField
              fullWidth
              value={title}
              label="Add a task"
              placeholder="What needs to be done?"
              error={Boolean(error)}
              helperText={error || 'Press Enter to add quickly.'}
              onChange={(event) => {
                setTitle(event.target.value)
                if (error) setError('')
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter') addTask()
                if (event.key === 'Escape') setTitle('')
              }}
            />
            <FormControl sx={{ minWidth: 130 }}>
              <InputLabel id="priority-label">Priority</InputLabel>
              <Select
                labelId="priority-label"
                id="priority"
                value={priority}
                label="Priority"
                onChange={(event) => setPriority(event.target.value)}
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
              </Select>
            </FormControl>
            <TextField
              type="date"
              label="Due date"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 155 }}
            />
            <Button variant="contained" onClick={addTask} sx={{ minHeight: 56 }}>
              Add
            </Button>
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <TextField
              fullWidth
              label="Search tasks"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel id="sort-label">Sort</InputLabel>
              <Select
                labelId="sort-label"
                value={sort}
                label="Sort"
                onChange={(event) => setSort(event.target.value)}
              >
                <MenuItem value="newest">Newest</MenuItem>
                <MenuItem value="oldest">Oldest</MenuItem>
                <MenuItem value="due-soon">Due soon</MenuItem>
                <MenuItem value="alphabetical">A-Z</MenuItem>
              </Select>
            </FormControl>
          </Stack>

          <Tabs value={filter} onChange={(_, nextValue) => setFilter(nextValue)} aria-label="task filter tabs">
            <Tab value="all" label={`All (${tasks.length})`} />
            <Tab value="active" label={`Active (${tasks.length - completedCount})`} />
            <Tab value="completed" label={`Completed (${completedCount})`} />
          </Tabs>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <Button variant="outlined" onClick={markAllCompleted}>
              Mark all complete
            </Button>
            <Button variant="outlined" color="secondary" onClick={clearCompleted}>
              Clear completed
            </Button>
          </Stack>

          <Divider />

          <Box role="list" aria-label="todo tasks list">
            <Stack spacing={1}>
              {filteredTasks.length ? (
                filteredTasks.map((task) => (
                  <TodoItem
                    key={task.id}
                    task={task}
                    onToggle={toggleTask}
                    onDelete={deleteTask}
                    onUpdate={updateTask}
                  />
                ))
              ) : (
                <Alert severity="info" variant="outlined">
                  No tasks found. Try changing filters or adding a new task.
                </Alert>
              )}
            </Stack>
          </Box>
        </Stack>
      </CardContent>

      <Snackbar
        open={snackOpen}
        autoHideDuration={5000}
        onClose={() => setSnackOpen(false)}
        message="Task deleted"
        action={
          <Button color="secondary" size="small" onClick={restoreLastDelete}>
            Undo
          </Button>
        }
      />
    </Card>
  )
}

export default TodoList
