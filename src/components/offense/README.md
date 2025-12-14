# Offense Components

Basketball offensive gameplay mechanics for the Boston Celtics vs LA Lakers game. These components replace the old QTE (timing ring) mechanics with trivia-based gameplay.

## Components

### TriviaOffense

Pure trivia mode - answer Celtics trivia correctly to score points.

**Features:**
- 10-second countdown timer with animated ring
- 4 multiple-choice answers in a 2x2 grid
- Celtics green (#007A33) and gold (#BA9653) theme
- Celebration animation on correct answer
- Disappointment animation on wrong answer/timeout
- Keyboard support (1-4 keys)
- Web Audio API sound effects
- Full accessibility support (ARIA labels, keyboard navigation)

**Usage:**
```jsx
import { TriviaOffense } from './components/offense'
import { getRandomQuestion } from './data/questions'

function GameScreen() {
  const [showTrivia, setShowTrivia] = useState(false)
  const { question, index } = getRandomQuestion([])

  const handleComplete = (isCorrect, questionIndex) => {
    if (isCorrect) {
      // Boost shot accuracy
      addShotBonus(15)
      scorePoints(2)
    }
    setShowTrivia(false)
  }

  return (
    <>
      <button onClick={() => setShowTrivia(true)}>
        Shoot
      </button>

      {showTrivia && (
        <TriviaOffense
          question={{ ...question, index }}
          player={currentPlayer}
          onComplete={handleComplete}
        />
      )}
    </>
  )
}
```

**Props:**
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `question` | Object | Yes | Question object with `question`, `answers`, `correct`, `index` |
| `player` | Object | Yes | Player object with `name`, `number`, `position` |
| `onComplete` | Function | Yes | Callback `(isCorrect, questionIndex) => void` |

---

### PlayCallOffense

Two-phase gameplay: First select a basketball play, then answer trivia.

**Features:**

**Phase 1 - Play Selection (5 seconds):**
- 3 play options: Pick & Roll, Isolation, Fast Break
- Each play has different success rates and difficulty
- Visual play diagrams with icons
- Auto-selects Pick & Roll on timeout
- Keyboard shortcuts (1-3)

**Phase 2 - Trivia:**
- Same trivia mechanics as TriviaOffense
- Selected play shown in header
- Play type affects game outcome

**Usage:**
```jsx
import { PlayCallOffense } from './components/offense'

function GameScreen() {
  const handleComplete = (isCorrect, playType, questionIndex) => {
    console.log(`Play: ${playType}, Result: ${isCorrect}`)

    // Calculate success based on play and answer
    const playBonus = {
      'pick-roll': 75,
      'isolation': 60,
      'fast-break': 85
    }

    if (isCorrect) {
      const successChance = playBonus[playType]
      if (Math.random() * 100 < successChance) {
        scorePoints(2)
      }
    }
  }

  return (
    <PlayCallOffense
      question={question}
      player={currentPlayer}
      onComplete={handleComplete}
    />
  )
}
```

**Props:**
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `question` | Object | Yes | Question object with `question`, `answers`, `correct`, `index` |
| `player` | Object | Yes | Player object with `name`, `number`, `position` |
| `onComplete` | Function | Yes | Callback `(isCorrect, playType, questionIndex) => void` |

**Play Types:**
| Play | Success Rate | Difficulty | Description |
|------|--------------|------------|-------------|
| Pick & Roll | 75% | Balanced | Classic two-man game |
| Isolation | 60% | Hard | One-on-one matchup |
| Fast Break | 85% | Easy | Quick transition offense |

---

## Design System

### Colors
- **Primary:** `#007A33` - Celtics Green
- **Secondary:** `#BA9653` - Gold
- **Accent:** `#FFFFFF` - White
- **Danger:** `#EF4444` - Red (timer warning)
- **Warning:** `#F59E0B` - Amber (timer caution)
- **Lakers:** `#552583` - Purple (for contrast)

### Typography
- **Headers:** `font-family: 'Oswald'` - Bold, uppercase
- **Body:** System fonts for readability
- **Monospace:** For keyboard hints

### Animations
All components use Framer Motion for smooth animations:
- Fade in/out transitions
- Scale and spring animations
- Staggered answer reveals
- Celebration effects

### Accessibility
- Full keyboard navigation
- ARIA labels and roles
- Screen reader support
- Focus management
- Color contrast compliance (WCAG AA)

---

## File Structure

```
src/components/offense/
├── TriviaOffense.jsx           # Pure trivia component
├── TriviaOffense.test.jsx      # Unit tests
├── TriviaOffense.example.jsx   # Usage example
├── PlayCallOffense.jsx         # Two-phase play component
├── PlayCallOffense.test.jsx    # Unit tests
├── PlayCallOffense.example.jsx # Usage example
├── index.js                    # Barrel export
└── README.md                   # This file
```

---

## Testing

Both components have comprehensive test coverage:

```bash
# Run tests
npm test offense

# Run tests in watch mode
npm test offense -- --watch

# Coverage report
npm test offense -- --coverage
```

**Test Coverage:**
- Question and answer rendering
- Timer countdown
- Correct/incorrect answer handling
- Timeout scenarios
- Keyboard input (1-4 keys)
- Play selection (PlayCallOffense)
- Phase transitions
- Accessibility attributes
- Sound effects (mocked)

---

## Integration with Game Flow

### Example Game Loop

```jsx
import { TriviaOffense, PlayCallOffense } from './components/offense'
import { getRandomQuestion } from './data/questions'
import { celtics, lakers } from './data/players'

function CelticsGame() {
  const [gamePhase, setGamePhase] = useState('playing')
  const [score, setScore] = useState({ celtics: 0, lakers: 0 })
  const [usedQuestions, setUsedQuestions] = useState([])
  const [currentTeam, setCurrentTeam] = useState('celtics')

  const handleOffenseComplete = (isCorrect, playType, questionIndex) => {
    setUsedQuestions(prev => [...prev, questionIndex])

    if (isCorrect && currentTeam === 'celtics') {
      setScore(prev => ({ ...prev, celtics: prev.celtics + 2 }))
    }

    // Switch possession
    setCurrentTeam(prev => prev === 'celtics' ? 'lakers' : 'celtics')
  }

  const { question, index } = getRandomQuestion(usedQuestions)
  const currentPlayer = currentTeam === 'celtics'
    ? celtics[Math.floor(Math.random() * celtics.length)]
    : null

  return (
    <div>
      <Scoreboard score={score} />

      {currentTeam === 'celtics' && (
        <TriviaOffense
          question={{ ...question, index }}
          player={currentPlayer}
          onComplete={handleOffenseComplete}
        />
      )}
    </div>
  )
}
```

---

## Performance Considerations

### Optimizations
- Lazy loading with React.lazy() if needed
- Memoized callback functions with useCallback
- Timer cleanup in useEffect
- Audio context reuse
- Framer Motion AnimatePresence for smooth unmounting

### Bundle Size
- TriviaOffense: ~8KB (minified + gzipped)
- PlayCallOffense: ~12KB (minified + gzipped)
- Total: ~20KB with dependencies (Framer Motion shared)

---

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Web Audio API** required for sound effects (degrades gracefully).

---

## Future Enhancements

Potential improvements:
- [ ] Difficulty scaling (harder questions = more points)
- [ ] Combo system (consecutive correct answers)
- [ ] Power-ups (freeze timer, 50/50, etc.)
- [ ] Multiplayer support
- [ ] Leaderboard integration
- [ ] Category selection (Big 3 Era, Current Roster, etc.)
- [ ] Custom sound effects (crowd noise, buzzer)
- [ ] Haptic feedback on mobile
- [ ] Animation variations based on player

---

## Contributing

When adding new features:
1. Follow existing component patterns
2. Maintain accessibility standards
3. Add comprehensive tests
4. Update this README
5. Use Celtics branding consistently

---

## Credits

Built for the Boston Celtics vs LA Lakers trivia basketball game.

**Design Inspiration:**
- TD Garden atmosphere
- Classic Celtics branding
- NBA 2K play calling system
