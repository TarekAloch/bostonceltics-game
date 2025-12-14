import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import QuizModal from './QuizModal'

describe('QuizModal Component', () => {
  const mockOnComplete = vi.fn()
  const mockQuestion = {
    question: "Who holds the Celtics career scoring record?",
    answers: ["Larry Bird", "John Havlicek", "Paul Pierce", "Bill Russell"],
    correct: 2,
    index: 0
  }

  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('renders question and answers', () => {
    render(<QuizModal question={mockQuestion} onComplete={mockOnComplete} />)

    expect(screen.getByText(mockQuestion.question)).toBeInTheDocument()
    mockQuestion.answers.forEach(answer => {
      expect(screen.getByText(answer)).toBeInTheDocument()
    })
  })

  it('displays 10 second countdown timer', () => {
    render(<QuizModal question={mockQuestion} onComplete={mockOnComplete} />)

    expect(screen.getByText('10')).toBeInTheDocument()

    vi.advanceTimersByTime(1000)

    expect(screen.getByText('9')).toBeInTheDocument()
  })

  it('handles correct answer selection', async () => {
    render(<QuizModal question={mockQuestion} onComplete={mockOnComplete} />)

    const correctAnswer = screen.getByLabelText(/Answer C: Paul Pierce/)
    fireEvent.click(correctAnswer)

    await waitFor(() => {
      expect(screen.getByText('CORRECT!')).toBeInTheDocument()
      expect(screen.getByText(/Shot accuracy boosted/)).toBeInTheDocument()
    })

    vi.advanceTimersByTime(2000)

    expect(mockOnComplete).toHaveBeenCalledWith(true, 0)
  })

  it('handles incorrect answer selection', async () => {
    render(<QuizModal question={mockQuestion} onComplete={mockOnComplete} />)

    const wrongAnswer = screen.getByLabelText(/Answer A: Larry Bird/)
    fireEvent.click(wrongAnswer)

    await waitFor(() => {
      expect(screen.getByText('INCORRECT')).toBeInTheDocument()
    })

    vi.advanceTimersByTime(2000)

    expect(mockOnComplete).toHaveBeenCalledWith(false, 0)
  })

  it('handles timeout when no answer selected', async () => {
    render(<QuizModal question={mockQuestion} onComplete={mockOnComplete} />)

    vi.advanceTimersByTime(10000)

    await waitFor(() => {
      expect(screen.getByText("TIME'S UP!")).toBeInTheDocument()
    })

    vi.advanceTimersByTime(2000)

    expect(mockOnComplete).toHaveBeenCalledWith(false, 0)
  })

  it('supports keyboard input (1-4 keys)', async () => {
    render(<QuizModal question={mockQuestion} onComplete={mockOnComplete} />)

    fireEvent.keyDown(window, { key: '3' })

    await waitFor(() => {
      expect(screen.getByText('CORRECT!')).toBeInTheDocument()
    })
  })

  it('disables answers after selection', async () => {
    render(<QuizModal question={mockQuestion} onComplete={mockOnComplete} />)

    const firstAnswer = screen.getByLabelText(/Answer A/)
    fireEvent.click(firstAnswer)

    const secondAnswer = screen.getByLabelText(/Answer B/)
    fireEvent.click(secondAnswer)

    // Should still show first answer as selected
    await waitFor(() => {
      expect(screen.getByText('INCORRECT')).toBeInTheDocument()
    })
  })

  it('shows correct answer when wrong answer selected', async () => {
    render(<QuizModal question={mockQuestion} onComplete={mockOnComplete} />)

    const wrongAnswer = screen.getByLabelText(/Answer A/)
    fireEvent.click(wrongAnswer)

    await waitFor(() => {
      const correctAnswerButton = screen.getByLabelText(/Answer C: Paul Pierce/)
      expect(correctAnswerButton).toHaveClass(/border-green-500/)
    })
  })

  it('changes timer color as time decreases', () => {
    render(<QuizModal question={mockQuestion} onComplete={mockOnComplete} />)

    const timer = screen.getByText('10')
    expect(timer).toHaveClass('text-white')

    vi.advanceTimersByTime(5000)

    const timerAt5 = screen.getByText('5')
    expect(timerAt5).toHaveClass('text-yellow-400')

    vi.advanceTimersByTime(2000)

    const timerAt3 = screen.getByText('3')
    expect(timerAt3).toHaveClass('text-red-400')
  })

  it('is accessible with proper ARIA attributes', () => {
    render(<QuizModal question={mockQuestion} onComplete={mockOnComplete} />)

    expect(screen.getByRole('dialog')).toHaveAttribute('aria-labelledby', 'quiz-question')
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-describedby', 'quiz-timer')

    mockQuestion.answers.forEach((answer, index) => {
      const letter = String.fromCharCode(65 + index)
      expect(screen.getByLabelText(`Answer ${letter}: ${answer}`)).toBeInTheDocument()
    })
  })

  it('displays keyboard hints', () => {
    render(<QuizModal question={mockQuestion} onComplete={mockOnComplete} />)

    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('4')).toBeInTheDocument()
  })
})
