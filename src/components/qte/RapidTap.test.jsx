import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import RapidTap from './RapidTap'

describe('RapidTap Component', () => {
  const mockOnComplete = vi.fn()
  const mockProps = {
    lakersAction: 'three-point',
    lakersPlayer: { name: 'LeBron James', number: 23 },
    onComplete: mockOnComplete,
    difficulty: 'medium',
  }

  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('renders countdown on mount', () => {
    render(<RapidTap {...mockProps} />)
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('transitions to active phase after countdown', async () => {
    render(<RapidTap {...mockProps} />)

    vi.advanceTimersByTime(1500)

    await waitFor(() => {
      expect(screen.getByText('TAP TO DEFEND!')).toBeInTheDocument()
    })
  })

  it('increments tap count on button click', async () => {
    render(<RapidTap {...mockProps} />)

    vi.advanceTimersByTime(1500) // Skip countdown

    const button = await screen.findByLabelText('Tap to defend')
    fireEvent.click(button)

    expect(screen.getByText(/1 \/ 20/)).toBeInTheDocument()
  })

  it('handles space key press', async () => {
    render(<RapidTap {...mockProps} />)

    vi.advanceTimersByTime(1500)

    fireEvent.keyDown(window, { code: 'Space' })

    await waitFor(() => {
      expect(screen.getByText(/1 \/ 20/)).toBeInTheDocument()
    })
  })

  it('shows blocked result for high tap count', async () => {
    render(<RapidTap {...mockProps} />)

    vi.advanceTimersByTime(1500)

    const button = await screen.findByLabelText('Tap to defend')

    // Simulate 20 taps (medium block threshold)
    for (let i = 0; i < 20; i++) {
      fireEvent.click(button)
      vi.advanceTimersByTime(100)
    }

    vi.advanceTimersByTime(3000) // Complete timer

    await waitFor(() => {
      expect(screen.getByText('BLOCKED!')).toBeInTheDocument()
    })
  })

  it('calls onComplete with correct result', async () => {
    render(<RapidTap {...mockProps} />)

    vi.advanceTimersByTime(1500)
    vi.advanceTimersByTime(3000)

    await waitFor(() => {
      expect(mockOnComplete).toHaveBeenCalledWith('open')
    })
  })

  it('displays Lakers player information', async () => {
    render(<RapidTap {...mockProps} />)

    vi.advanceTimersByTime(1500)

    await waitFor(() => {
      expect(screen.getByText('#23 LeBron James')).toBeInTheDocument()
      expect(screen.getByText(/three point/i)).toBeInTheDocument()
    })
  })

  it('adjusts thresholds based on difficulty', () => {
    const { rerender } = render(<RapidTap {...mockProps} difficulty="easy" />)

    vi.advanceTimersByTime(1500)
    expect(screen.getByText(/\/ 15/)).toBeInTheDocument() // Easy block threshold

    rerender(<RapidTap {...mockProps} difficulty="hard" />)
    expect(screen.getByText(/\/ 25/)).toBeInTheDocument() // Hard block threshold
  })

  it('is accessible with proper ARIA labels', async () => {
    render(<RapidTap {...mockProps} />)

    expect(screen.getByRole('dialog')).toHaveAttribute('aria-label', 'Defense quick-time event')

    vi.advanceTimersByTime(1500)

    await waitFor(() => {
      expect(screen.getByLabelText('Tap to defend')).toBeInTheDocument()
    })
  })
})
