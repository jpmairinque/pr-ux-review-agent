import { fireEvent, render, screen } from '@testing-library/react'
import App from '../App'

describe('Todo UX Lab', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('adds a task from keyboard enter', () => {
    render(<App />)
    const input = screen.getByLabelText(/add a task/i)
    fireEvent.change(input, { target: { value: 'Prepare recruiter demo' } })
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })
    expect(screen.getByText('Prepare recruiter demo')).toBeInTheDocument()
  })

  it('validates empty task title', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /^add$/i }))
    expect(screen.getByText(/task title is required/i)).toBeInTheDocument()
  })

  it('can mark task as complete', () => {
    render(<App />)
    const input = screen.getByLabelText(/add a task/i)
    fireEvent.change(input, { target: { value: 'Test keyboard flow' } })
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })
    fireEvent.click(screen.getByLabelText(/mark test keyboard flow as completed/i))
    expect(screen.getByRole('tab', { name: /completed \(1\)/i })).toBeInTheDocument()
  })
})
