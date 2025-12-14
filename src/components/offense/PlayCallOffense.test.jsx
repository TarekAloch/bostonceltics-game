import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import PlayCallOffense from './PlayCallOffense'

describe('PlayCallOffense', () => {
  const mockQuestion = {
    question: 'Who holds the Celtics career scoring record?',
    answers: ['Larry Bird', 'John Havlicek', 'Paul Pierce', 'Bill Russell'],
    correct: 1,
    index: 0
  }

  const mockPlayer = {
    name: 'Jaylen Brown',
    number: 7,
    position: 'SG'
  }

  const mockOnComplete = vi.fn()

  beforeEach(() => {
    vi.useFakeTimers()
    mockOnComplete.mockClear()
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
  })

  describe('Play Selection Phase', () => {
    it('renders play selection screen initially', () => {
      render(
        <PlayCallOffense
          question={mockQuestion}
          player={mockPlayer}
          onComplete={mockOnComplete}
        />
      )

      expect(screen.getByText('Call Your Play')).toBeInTheDocument()
      expect(screen.getByText('PICK & ROLL')).toBeInTheDocument()
      expect(screen.getByText('ISOLATION')).toBeInTheDocument()
      expect(screen.getByText('FAST BREAK')).toBeInTheDocument()
    })

    it('displays player information', () => {
      render(
        <PlayCallOffense
          question={mockQuestion}
          player={mockPlayer}
          onComplete={mockOnComplete}
        />
      )

      expect(screen.getByText(/Jaylen Brown/)).toBeInTheDocument()
      expect(screen.getByText(/#7/)).toBeInTheDocument()
    })

    it('shows 5-second play selection timer', () => {
      render(
        <PlayCallOffense
          question={mockQuestion}
          player={mockPlayer}
          onComplete={mockOnComplete}
        />
      )

      expect(screen.getByText('5s')).toBeInTheDocument()
    })

    it('allows selecting a play', async () => {
      render(
        <PlayCallOffense
          question={mockQuestion}
          player={mockPlayer}
          onComplete={mockOnComplete}
        />
      )

      const pickAndRoll = screen.getByText('PICK & ROLL')
      fireEvent.click(pickAndRoll)

      // Wait for transition to trivia phase
      vi.advanceTimersByTime(1000)

      await waitFor(() => {
        expect(screen.queryByText('Call Your Play')).not.toBeInTheDocument()
        expect(screen.getByText(mockQuestion.question)).toBeInTheDocument()
      })
    })

    it('auto-selects Pick & Roll on timeout', async () => {
      render(
        <PlayCallOffense
          question={mockQuestion}
          player={mockPlayer}
          onComplete={mockOnComplete}
        />
      )

      // Fast-forward 5 seconds
      vi.advanceTimersByTime(5000)

      // Wait for auto-selection and transition
      vi.advanceTimersByTime(1000)

      await waitFor(() => {
        expect(screen.getByText(mockQuestion.question)).toBeInTheDocument()
      })
    })

    it('supports keyboard play selection (1-3)', async () => {
      render(
        <PlayCallOffense
          question={mockQuestion}
          player={mockPlayer}
          onComplete={mockOnComplete}
        />
      )

      fireEvent.keyDown(window, { key: '2' }) // Select Isolation

      vi.advanceTimersByTime(1000)

      await waitFor(() => {
        expect(screen.getByText(mockQuestion.question)).toBeInTheDocument()
      })
    })

    it('displays success rates for each play', () => {
      render(
        <PlayCallOffense
          question={mockQuestion}
          player={mockPlayer}
          onComplete={mockOnComplete}
        />
      )

      expect(screen.getByText('75%')).toBeInTheDocument() // Pick & Roll
      expect(screen.getByText('60%')).toBeInTheDocument() // Isolation
      expect(screen.getByText('85%')).toBeInTheDocument() // Fast Break
    })
  })

  describe('Trivia Phase', () => {
    beforeEach(async () => {
      render(
        <PlayCallOffense
          question={mockQuestion}
          player={mockPlayer}
          onComplete={mockOnComplete}
        />
      )

      // Select a play
      const pickAndRoll = screen.getByText('PICK & ROLL')
      fireEvent.click(pickAndRoll)

      // Wait for transition
      vi.advanceTimersByTime(1000)

      await waitFor(() => {
        expect(screen.getByText(mockQuestion.question)).toBeInTheDocument()
      })
    })

    it('renders trivia question after play selection', () => {
      expect(screen.getByText(mockQuestion.question)).toBeInTheDocument()
      expect(screen.getByText('Larry Bird')).toBeInTheDocument()
    })

    it('displays selected play in header', () => {
      expect(screen.getByText('PICK & ROLL')).toBeInTheDocument()
    })

    it('handles correct answer', async () => {
      const correctAnswer = screen.getByText('John Havlicek')
      fireEvent.click(correctAnswer)

      await waitFor(() => {
        expect(screen.getByText('SCORE!')).toBeInTheDocument()
      })

      vi.advanceTimersByTime(2500)

      await waitFor(() => {
        expect(mockOnComplete).toHaveBeenCalledWith(true, 'pick-roll', 0)
      })
    })

    it('handles incorrect answer', async () => {
      const wrongAnswer = screen.getByText('Larry Bird')
      fireEvent.click(wrongAnswer)

      await waitFor(() => {
        expect(screen.getByText('MISS!')).toBeInTheDocument()
      })

      vi.advanceTimersByTime(2500)

      await waitFor(() => {
        expect(mockOnComplete).toHaveBeenCalledWith(false, 'pick-roll', 0)
      })
    })

    it('handles trivia timeout', async () => {
      // Fast-forward 10 seconds
      vi.advanceTimersByTime(10000)

      await waitFor(() => {
        expect(screen.getByText("TIME'S UP!")).toBeInTheDocument()
      })

      vi.advanceTimersByTime(2500)

      await waitFor(() => {
        expect(mockOnComplete).toHaveBeenCalledWith(false, 'pick-roll', 0)
      })
    })

    it('supports keyboard answer selection (1-4)', async () => {
      fireEvent.keyDown(window, { key: '2' }) // Correct answer

      await waitFor(() => {
        expect(screen.getByText('SCORE!')).toBeInTheDocument()
      })
    })
  })

  describe('Play Types', () => {
    it('completes with isolation play', async () => {
      render(
        <PlayCallOffense
          question={mockQuestion}
          player={mockPlayer}
          onComplete={mockOnComplete}
        />
      )

      fireEvent.keyDown(window, { key: '2' }) // Select Isolation
      vi.advanceTimersByTime(1000)

      await waitFor(() => {
        expect(screen.getByText(mockQuestion.question)).toBeInTheDocument()
      })

      const correctAnswer = screen.getByText('John Havlicek')
      fireEvent.click(correctAnswer)

      vi.advanceTimersByTime(2500)

      await waitFor(() => {
        expect(mockOnComplete).toHaveBeenCalledWith(true, 'isolation', 0)
      })
    })

    it('completes with fast break play', async () => {
      render(
        <PlayCallOffense
          question={mockQuestion}
          player={mockPlayer}
          onComplete={mockOnComplete}
        />
      )

      fireEvent.keyDown(window, { key: '3' }) // Select Fast Break
      vi.advanceTimersByTime(1000)

      await waitFor(() => {
        expect(screen.getByText(mockQuestion.question)).toBeInTheDocument()
      })

      const correctAnswer = screen.getByText('John Havlicek')
      fireEvent.click(correctAnswer)

      vi.advanceTimersByTime(2500)

      await waitFor(() => {
        expect(mockOnComplete).toHaveBeenCalledWith(true, 'fast-break', 0)
      })
    })
  })

  describe('Accessibility', () => {
    it('has proper dialog roles', () => {
      render(
        <PlayCallOffense
          question={mockQuestion}
          player={mockPlayer}
          onComplete={mockOnComplete}
        />
      )

      const dialog = screen.getByRole('dialog')
      expect(dialog).toBeInTheDocument()
    })

    it('has proper aria labels on play buttons', () => {
      render(
        <PlayCallOffense
          question={mockQuestion}
          player={mockPlayer}
          onComplete={mockOnComplete}
        />
      )

      const pickRollButton = screen.getByLabelText(/PICK & ROLL/)
      expect(pickRollButton).toBeInTheDocument()
    })
  })
})
