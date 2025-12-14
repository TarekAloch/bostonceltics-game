import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import TriviaOffense from './TriviaOffense'

describe('TriviaOffense', () => {
  const mockQuestion = {
    question: 'Who holds the Celtics career scoring record?',
    answers: ['Larry Bird', 'John Havlicek', 'Paul Pierce', 'Bill Russell'],
    correct: 1,
    index: 0
  }

  const mockPlayer = {
    name: 'Jayson Tatum',
    number: 0,
    position: 'SF'
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

  it('renders question and answers', () => {
    render(
      <TriviaOffense
        question={mockQuestion}
        player={mockPlayer}
        onComplete={mockOnComplete}
      />
    )

    expect(screen.getByText(mockQuestion.question)).toBeInTheDocument()
    expect(screen.getByText('Larry Bird')).toBeInTheDocument()
    expect(screen.getByText('John Havlicek')).toBeInTheDocument()
    expect(screen.getByText('Paul Pierce')).toBeInTheDocument()
    expect(screen.getByText('Bill Russell')).toBeInTheDocument()
  })

  it('displays player information', () => {
    render(
      <TriviaOffense
        question={mockQuestion}
        player={mockPlayer}
        onComplete={mockOnComplete}
      />
    )

    expect(screen.getByText(/Jayson Tatum/)).toBeInTheDocument()
    expect(screen.getByText(/#0/)).toBeInTheDocument()
  })

  it('shows countdown timer starting at 10', () => {
    render(
      <TriviaOffense
        question={mockQuestion}
        player={mockPlayer}
        onComplete={mockOnComplete}
      />
    )

    expect(screen.getByText('10')).toBeInTheDocument()
  })

  it('handles correct answer', async () => {
    render(
      <TriviaOffense
        question={mockQuestion}
        player={mockPlayer}
        onComplete={mockOnComplete}
      />
    )

    const correctAnswer = screen.getByText('John Havlicek')
    fireEvent.click(correctAnswer)

    await waitFor(() => {
      expect(screen.getByText('SCORE!')).toBeInTheDocument()
    })

    vi.advanceTimersByTime(2500)

    await waitFor(() => {
      expect(mockOnComplete).toHaveBeenCalledWith(true, 0)
    })
  })

  it('handles incorrect answer', async () => {
    render(
      <TriviaOffense
        question={mockQuestion}
        player={mockPlayer}
        onComplete={mockOnComplete}
      />
    )

    const wrongAnswer = screen.getByText('Larry Bird')
    fireEvent.click(wrongAnswer)

    await waitFor(() => {
      expect(screen.getByText('MISS!')).toBeInTheDocument()
    })

    vi.advanceTimersByTime(2500)

    await waitFor(() => {
      expect(mockOnComplete).toHaveBeenCalledWith(false, 0)
    })
  })

  it('handles timeout', async () => {
    render(
      <TriviaOffense
        question={mockQuestion}
        player={mockPlayer}
        onComplete={mockOnComplete}
      />
    )

    // Fast-forward 10 seconds
    vi.advanceTimersByTime(10000)

    await waitFor(() => {
      expect(screen.getByText("TIME'S UP!")).toBeInTheDocument()
    })

    vi.advanceTimersByTime(2500)

    await waitFor(() => {
      expect(mockOnComplete).toHaveBeenCalledWith(false, 0)
    })
  })

  it('supports keyboard input (1-4)', async () => {
    render(
      <TriviaOffense
        question={mockQuestion}
        player={mockPlayer}
        onComplete={mockOnComplete}
      />
    )

    // Press '2' for second answer (correct)
    fireEvent.keyDown(window, { key: '2' })

    await waitFor(() => {
      expect(screen.getByText('SCORE!')).toBeInTheDocument()
    })
  })

  it('disables answers after selection', async () => {
    render(
      <TriviaOffense
        question={mockQuestion}
        player={mockPlayer}
        onComplete={mockOnComplete}
      />
    )

    const firstAnswer = screen.getByText('Larry Bird')
    fireEvent.click(firstAnswer)

    // Try to click another answer
    const secondAnswer = screen.getByText('John Havlicek')
    fireEvent.click(secondAnswer)

    // Should only register first click
    await waitFor(() => {
      expect(mockOnComplete).toHaveBeenCalledTimes(0) // Not called yet (2.5s delay)
    })

    vi.advanceTimersByTime(2500)

    // Should only be called once with first answer result
    await waitFor(() => {
      expect(mockOnComplete).toHaveBeenCalledTimes(1)
      expect(mockOnComplete).toHaveBeenCalledWith(false, 0) // First answer was wrong
    })
  })

  it('displays correct/incorrect indicators', async () => {
    const { container } = render(
      <TriviaOffense
        question={mockQuestion}
        player={mockPlayer}
        onComplete={mockOnComplete}
      />
    )

    const correctAnswer = screen.getByText('John Havlicek')
    fireEvent.click(correctAnswer)

    await waitFor(() => {
      // Check for SVG checkmark icon (CheckCircle2)
      const checkIcons = container.querySelectorAll('svg[class*="lucide-check-circle"]')
      expect(checkIcons.length).toBeGreaterThan(0)
    })
  })

  it('has proper accessibility attributes', () => {
    render(
      <TriviaOffense
        question={mockQuestion}
        player={mockPlayer}
        onComplete={mockOnComplete}
      />
    )

    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-labelledby', 'trivia-question')
    expect(dialog).toHaveAttribute('aria-describedby', 'trivia-timer')
  })
})
