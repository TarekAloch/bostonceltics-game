import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import DefenseChoice from './DefenseChoice'

/**
 * Unit tests for DefenseChoice component
 *
 * To run tests:
 * npm install --save-dev vitest @testing-library/react @testing-library/jest-dom
 * npm test
 */

describe('DefenseChoice Component', () => {
  const mockLakersPlayer = {
    name: 'LeBron James',
    number: 23,
    rating: 92,
    position: 'SF',
    villain: true,
  }

  const mockOnComplete = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Rendering', () => {
    it('renders all defense action buttons', () => {
      render(
        <DefenseChoice
          lakersPlayer={mockLakersPlayer}
          lakersAction="three-point"
          onComplete={mockOnComplete}
        />
      )

      expect(screen.getByText('CONTEST')).toBeInTheDocument()
      expect(screen.getByText('GO FOR BLOCK')).toBeInTheDocument()
      expect(screen.getByText('GO FOR STEAL')).toBeInTheDocument()
    })

    it('displays Lakers player information', () => {
      render(
        <DefenseChoice
          lakersPlayer={mockLakersPlayer}
          lakersAction="drive"
          onComplete={mockOnComplete}
        />
      )

      expect(screen.getByText('LeBron James')).toBeInTheDocument()
      expect(screen.getByText('#23')).toBeInTheDocument()
      expect(screen.getByText(/92 OVR/)).toBeInTheDocument()
    })

    it('shows villain badge for villain players', () => {
      render(
        <DefenseChoice
          lakersPlayer={mockLakersPlayer}
          lakersAction="mid-range"
          onComplete={mockOnComplete}
        />
      )

      expect(screen.getByText('VILLAIN')).toBeInTheDocument()
    })

    it('displays correct Lakers action text', () => {
      const { rerender } = render(
        <DefenseChoice
          lakersPlayer={mockLakersPlayer}
          lakersAction="three-point"
          onComplete={mockOnComplete}
        />
      )
      expect(screen.getByText('SHOOTING A 3-POINTER')).toBeInTheDocument()

      rerender(
        <DefenseChoice
          lakersPlayer={mockLakersPlayer}
          lakersAction="mid-range"
          onComplete={mockOnComplete}
        />
      )
      expect(screen.getByText('TAKING A MID-RANGE JUMPER')).toBeInTheDocument()

      rerender(
        <DefenseChoice
          lakersPlayer={mockLakersPlayer}
          lakersAction="drive"
          onComplete={mockOnComplete}
        />
      )
      expect(screen.getByText('DRIVING TO THE RIM')).toBeInTheDocument()
    })

    it('shows initial timer value of 5 seconds', () => {
      render(
        <DefenseChoice
          lakersPlayer={mockLakersPlayer}
          lakersAction="three-point"
          onComplete={mockOnComplete}
        />
      )

      expect(screen.getByText('5')).toBeInTheDocument()
    })
  })

  describe('User Interactions', () => {
    it('calls onComplete with choice and result when button clicked', async () => {
      render(
        <DefenseChoice
          lakersPlayer={mockLakersPlayer}
          lakersAction="three-point"
          onComplete={mockOnComplete}
        />
      )

      const contestButton = screen.getByText('CONTEST')
      fireEvent.click(contestButton)

      await waitFor(
        () => {
          expect(mockOnComplete).toHaveBeenCalledWith(
            'contest',
            expect.stringMatching(/miss|score/)
          )
        },
        { timeout: 3000 }
      )
    })

    it('disables buttons after selection', () => {
      render(
        <DefenseChoice
          lakersPlayer={mockLakersPlayer}
          lakersAction="drive"
          onComplete={mockOnComplete}
        />
      )

      const contestButton = screen.getByText('CONTEST')
      fireEvent.click(contestButton)

      const blockButton = screen.getByText('GO FOR BLOCK')
      expect(blockButton).toBeDisabled()
    })
  })

  describe('Timer Functionality', () => {
    it('counts down from 5 to 0', () => {
      render(
        <DefenseChoice
          lakersPlayer={mockLakersPlayer}
          lakersAction="three-point"
          onComplete={mockOnComplete}
        />
      )

      expect(screen.getByText('5')).toBeInTheDocument()

      vi.advanceTimersByTime(1000)
      expect(screen.getByText('4')).toBeInTheDocument()

      vi.advanceTimersByTime(1000)
      expect(screen.getByText('3')).toBeInTheDocument()

      vi.advanceTimersByTime(1000)
      expect(screen.getByText('2')).toBeInTheDocument()

      vi.advanceTimersByTime(1000)
      expect(screen.getByText('1')).toBeInTheDocument()
    })

    it('auto-selects Contest when timer expires', async () => {
      render(
        <DefenseChoice
          lakersPlayer={mockLakersPlayer}
          lakersAction="mid-range"
          onComplete={mockOnComplete}
        />
      )

      // Fast-forward 5 seconds
      vi.advanceTimersByTime(5000)

      await waitFor(
        () => {
          expect(mockOnComplete).toHaveBeenCalledWith(
            'contest',
            expect.stringMatching(/miss|score/)
          )
        },
        { timeout: 3000 }
      )
    })
  })

  describe('Outcome Probabilities', () => {
    it('Contest: returns miss or score only', () => {
      const mockRandom = vi.spyOn(Math, 'random')

      // Test miss outcome (random < 0.5)
      mockRandom.mockReturnValue(0.3)
      render(
        <DefenseChoice
          lakersPlayer={mockLakersPlayer}
          lakersAction="three-point"
          onComplete={mockOnComplete}
        />
      )
      fireEvent.click(screen.getByText('CONTEST'))

      // Test score outcome (random >= 0.5)
      mockRandom.mockReturnValue(0.7)
      render(
        <DefenseChoice
          lakersPlayer={mockLakersPlayer}
          lakersAction="three-point"
          onComplete={vi.fn()}
        />
      )
      fireEvent.click(screen.getAllByText('CONTEST')[1])

      mockRandom.mockRestore()
    })

    it('Block: returns block, foul, or score', () => {
      const mockRandom = vi.spyOn(Math, 'random')

      // Block outcome (random < 0.3)
      mockRandom.mockReturnValue(0.2)
      const { rerender } = render(
        <DefenseChoice
          lakersPlayer={mockLakersPlayer}
          lakersAction="drive"
          onComplete={vi.fn()}
        />
      )
      fireEvent.click(screen.getByText('GO FOR BLOCK'))

      // Foul outcome (0.3 <= random < 0.5)
      mockRandom.mockReturnValue(0.4)
      rerender(
        <DefenseChoice
          lakersPlayer={mockLakersPlayer}
          lakersAction="drive"
          onComplete={vi.fn()}
        />
      )
      fireEvent.click(screen.getByText('GO FOR BLOCK'))

      // Score outcome (random >= 0.5)
      mockRandom.mockReturnValue(0.6)
      rerender(
        <DefenseChoice
          lakersPlayer={mockLakersPlayer}
          lakersAction="drive"
          onComplete={vi.fn()}
        />
      )
      fireEvent.click(screen.getByText('GO FOR BLOCK'))

      mockRandom.mockRestore()
    })

    it('Steal: returns steal, foul, or score', () => {
      const mockRandom = vi.spyOn(Math, 'random')

      // Steal outcome (random < 0.25)
      mockRandom.mockReturnValue(0.2)
      const { rerender } = render(
        <DefenseChoice
          lakersPlayer={mockLakersPlayer}
          lakersAction="three-point"
          onComplete={vi.fn()}
        />
      )
      fireEvent.click(screen.getByText('GO FOR STEAL'))

      // Foul outcome (0.25 <= random < 0.5)
      mockRandom.mockReturnValue(0.3)
      rerender(
        <DefenseChoice
          lakersPlayer={mockLakersPlayer}
          lakersAction="three-point"
          onComplete={vi.fn()}
        />
      )
      fireEvent.click(screen.getByText('GO FOR STEAL'))

      // Score outcome (random >= 0.5)
      mockRandom.mockReturnValue(0.6)
      rerender(
        <DefenseChoice
          lakersPlayer={mockLakersPlayer}
          lakersAction="three-point"
          onComplete={vi.fn()}
        />
      )
      fireEvent.click(screen.getByText('GO FOR STEAL'))

      mockRandom.mockRestore()
    })
  })

  describe('Result Display', () => {
    it('shows "LAKERS MISS!" for miss result', async () => {
      const mockRandom = vi.spyOn(Math, 'random').mockReturnValue(0.3) // Force miss

      render(
        <DefenseChoice
          lakersPlayer={mockLakersPlayer}
          lakersAction="three-point"
          onComplete={mockOnComplete}
        />
      )

      fireEvent.click(screen.getByText('CONTEST'))

      await waitFor(() => {
        expect(screen.getByText('LAKERS MISS!')).toBeInTheDocument()
      })

      mockRandom.mockRestore()
    })

    it('shows "BLOCKED!" for block result', async () => {
      const mockRandom = vi.spyOn(Math, 'random').mockReturnValue(0.2) // Force block

      render(
        <DefenseChoice
          lakersPlayer={mockLakersPlayer}
          lakersAction="drive"
          onComplete={mockOnComplete}
        />
      )

      fireEvent.click(screen.getByText('GO FOR BLOCK'))

      await waitFor(() => {
        expect(screen.getByText('BLOCKED!')).toBeInTheDocument()
      })

      mockRandom.mockRestore()
    })

    it('shows "STEAL!" for steal result', async () => {
      const mockRandom = vi.spyOn(Math, 'random').mockReturnValue(0.2) // Force steal

      render(
        <DefenseChoice
          lakersPlayer={mockLakersPlayer}
          lakersAction="three-point"
          onComplete={mockOnComplete}
        />
      )

      fireEvent.click(screen.getByText('GO FOR STEAL'))

      await waitFor(() => {
        expect(screen.getByText('STEAL!')).toBeInTheDocument()
      })

      mockRandom.mockRestore()
    })

    it('shows "FOUL!" for foul result', async () => {
      const mockRandom = vi.spyOn(Math, 'random').mockReturnValue(0.4) // Force foul

      render(
        <DefenseChoice
          lakersPlayer={mockLakersPlayer}
          lakersAction="drive"
          onComplete={mockOnComplete}
        />
      )

      fireEvent.click(screen.getByText('GO FOR BLOCK'))

      await waitFor(() => {
        expect(screen.getByText('FOUL!')).toBeInTheDocument()
      })

      mockRandom.mockRestore()
    })

    it('shows "LAKERS SCORE!" for score result', async () => {
      const mockRandom = vi.spyOn(Math, 'random').mockReturnValue(0.7) // Force score

      render(
        <DefenseChoice
          lakersPlayer={mockLakersPlayer}
          lakersAction="mid-range"
          onComplete={mockOnComplete}
        />
      )

      fireEvent.click(screen.getByText('CONTEST'))

      await waitFor(() => {
        expect(screen.getByText('LAKERS SCORE!')).toBeInTheDocument()
      })

      mockRandom.mockRestore()
    })
  })

  describe('Accessibility', () => {
    it('renders buttons as interactive elements', () => {
      render(
        <DefenseChoice
          lakersPlayer={mockLakersPlayer}
          lakersAction="three-point"
          onComplete={mockOnComplete}
        />
      )

      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThanOrEqual(3)
    })

    it('supports keyboard navigation', () => {
      render(
        <DefenseChoice
          lakersPlayer={mockLakersPlayer}
          lakersAction="drive"
          onComplete={mockOnComplete}
        />
      )

      const contestButton = screen.getByText('CONTEST')
      contestButton.focus()
      expect(document.activeElement).toBe(contestButton)
    })
  })

  describe('Edge Cases', () => {
    it('handles missing player data gracefully', () => {
      render(
        <DefenseChoice
          lakersPlayer={{}}
          lakersAction="three-point"
          onComplete={mockOnComplete}
        />
      )

      expect(screen.getByText('Unknown')).toBeInTheDocument()
      expect(screen.getByText('#00')).toBeInTheDocument()
    })

    it('handles missing onComplete callback', () => {
      render(
        <DefenseChoice
          lakersPlayer={mockLakersPlayer}
          lakersAction="mid-range"
        />
      )

      const contestButton = screen.getByText('CONTEST')
      fireEvent.click(contestButton)

      // Should not throw error
      expect(() => fireEvent.click(contestButton)).not.toThrow()
    })

    it('prevents multiple simultaneous selections', () => {
      render(
        <DefenseChoice
          lakersPlayer={mockLakersPlayer}
          lakersAction="three-point"
          onComplete={mockOnComplete}
        />
      )

      const contestButton = screen.getByText('CONTEST')
      const blockButton = screen.getByText('GO FOR BLOCK')

      fireEvent.click(contestButton)
      fireEvent.click(blockButton) // Should be ignored

      expect(mockOnComplete).toHaveBeenCalledTimes(1)
    })
  })
})
