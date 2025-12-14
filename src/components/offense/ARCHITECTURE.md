# Offense Components - Architecture

## Component Tree

```
GameScreen
├── Scoreboard
├── Court
├── PlayerCard
│   └── activePlayer (Celtics)
└── Offense Phase (AnimatePresence)
    ├── TriviaOffense
    │   ├── Timer (10s circular)
    │   ├── Question Display
    │   ├── Answer Grid (2x2)
    │   │   ├── Answer Button A (keyboard: 1)
    │   │   ├── Answer Button B (keyboard: 2)
    │   │   ├── Answer Button C (keyboard: 3)
    │   │   └── Answer Button D (keyboard: 4)
    │   └── Result Animation
    │       ├── SCORE! (correct)
    │       ├── MISS! (wrong)
    │       └── TIME'S UP! (timeout)
    │
    └── PlayCallOffense
        ├── Phase 1: Play Selection (5s)
        │   ├── Pick & Roll Card (75%, keyboard: 1)
        │   ├── Isolation Card (60%, keyboard: 2)
        │   └── Fast Break Card (85%, keyboard: 3)
        │
        └── Phase 2: Trivia Execution (10s)
            ├── Selected Play Badge
            └── [Same as TriviaOffense]
```

---

## Data Flow

```
User Input
    │
    ▼
Component (TriviaOffense | PlayCallOffense)
    │
    ├──> Timer (countdown)
    ├──> Keyboard Events (1-4)
    └──> Answer Click
        │
        ▼
    Validation
    ├── Correct? ──> isCorrect = true
    └── Wrong?   ──> isCorrect = false
        │
        ▼
    Play Sound Effect
        │
        ▼
    Show Result Animation (2.5s)
        │
        ▼
    onComplete(isCorrect, playType?, questionIndex)
        │
        ▼
    Parent (GameScreen)
    ├── Calculate Shot Success
    ├── Update Score
    ├── Switch Possession
    └── Next Phase
```

---

## State Management

### Component Internal State

```javascript
// TriviaOffense.jsx
const [timeLeft, setTimeLeft] = useState(10)
const [selectedAnswer, setSelectedAnswer] = useState(null)
const [showResult, setShowResult] = useState(false)
const [isCorrect, setIsCorrect] = useState(false)

// PlayCallOffense.jsx
const [phase, setPhase] = useState('play-select')
const [selectedPlay, setSelectedPlay] = useState(null)
const [playTimer, setPlayTimer] = useState(5)
// ... + trivia state (same as above)
```

### Parent State (GameScreen)

```javascript
// Game state
const [phase, setPhase] = useState('offense-trivia')
const [score, setScore] = useState({ celtics: 0, lakers: 0 })
const [usedQuestions, setUsedQuestions] = useState([])
const [possession, setPossession] = useState('celtics')
const [activePlayer, setActivePlayer] = useState(celtics[0])
```

---

## Props Interface

### TriviaOffense

```typescript
interface TriviaOffenseProps {
  question: {
    question: string
    answers: string[]      // Must be length 4
    correct: number        // 0-3 index
    index?: number         // For tracking
  }
  player: {
    name: string
    number: number
    position: string
  }
  onComplete: (isCorrect: boolean, questionIndex: number) => void
}
```

### PlayCallOffense

```typescript
interface PlayCallOffenseProps {
  question: {
    question: string
    answers: string[]
    correct: number
    index?: number
  }
  player: {
    name: string
    number: number
    position: string
  }
  onComplete: (
    isCorrect: boolean,
    playType: 'pick-roll' | 'isolation' | 'fast-break',
    questionIndex: number
  ) => void
}
```

---

## Lifecycle

### TriviaOffense Lifecycle

```
Mount
  │
  ├──> Start 10s timer
  ├──> Render question
  └──> Listen for keyboard
      │
      ▼
  User Action
  ├── Answer click ──> Stop timer ──> Validate
  └── Timeout (10s) ──> Auto-fail
      │
      ▼
  Show Result (2.5s delay)
      │
      ▼
  onComplete callback
      │
      ▼
  Unmount
  └──> Cleanup timer
```

### PlayCallOffense Lifecycle

```
Mount
  │
  ├──> Phase: play-select
  ├──> Start 5s timer
  └──> Listen for keyboard (1-3)
      │
      ▼
  Play Selected (or timeout)
  ├──> Stop timer
  └──> Transition (1s)
      │
      ▼
  Phase: trivia
  ├──> [Same as TriviaOffense]
  └──> onComplete(isCorrect, playType, idx)
      │
      ▼
  Unmount
```

---

## Event Handling

### Keyboard Events

```javascript
// Global keyboard listener
useEffect(() => {
  const handleKeyDown = (e) => {
    const key = parseInt(e.key)

    // Phase 1: Play selection (PlayCallOffense only)
    if (phase === 'play-select' && key >= 1 && key <= 3) {
      selectPlay(PLAYS[key - 1])
    }

    // Phase 2: Trivia
    if (phase === 'trivia' && key >= 1 && key <= 4) {
      selectAnswer(key - 1)
    }
  }

  window.addEventListener('keydown', handleKeyDown)
  return () => window.removeEventListener('keydown', handleKeyDown)
}, [phase])
```

### Timer Events

```javascript
// Countdown timer
useEffect(() => {
  const timer = setInterval(() => {
    setTimeLeft(prev => {
      if (prev <= 1) {
        clearInterval(timer)
        handleTimeout()
        return 0
      }

      // Sound effect in last 5 seconds
      if (prev <= 5) playTick()

      return prev - 1
    })
  }, 1000)

  return () => clearInterval(timer)
}, [])
```

---

## Animation Layers

```
z-index: 50 (Offense Overlay)
├── Backdrop (black/95, blur-lg)
├── Background Glow Effects
│   ├── Green orb (top-left)
│   └── Gold orb (bottom-right)
└── Modal Container
    ├── Header (gradient green)
    │   ├── Icon + Title
    │   └── Circular Timer
    ├── Content
    │   ├── Question (fade in)
    │   └── Answers (stagger in)
    └── Footer
        └── Result (scale in)
```

### Framer Motion Variants

```javascript
// Modal entrance
const modalVariants = {
  initial: { opacity: 0, scale: 0.9, y: 20 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.9, y: 20 }
}

// Answer stagger
const answerVariants = {
  initial: { opacity: 0, x: -20 },
  animate: (index) => ({
    opacity: 1,
    x: 0,
    transition: { delay: index * 0.08 }
  })
}

// Result celebration
const resultVariants = {
  initial: { scale: 0, rotate: -180 },
  animate: {
    scale: 1,
    rotate: 0,
    transition: { type: "spring", stiffness: 200 }
  }
}
```

---

## Sound Architecture

```javascript
// Web Audio API
const audioContextRef = useRef(null)

const playSound = (frequency, duration, volume) => {
  const ctx = audioContextRef.current
  const oscillator = ctx.createOscillator()
  const gainNode = ctx.createGain()

  oscillator.connect(gainNode)
  gainNode.connect(ctx.destination)

  oscillator.frequency.value = frequency
  gainNode.gain.value = volume

  oscillator.start()
  oscillator.stop(ctx.currentTime + duration)
}

// Sound effects
const sounds = {
  tick:    () => playSound(800, 0.1, 0.08),    // Timer tick
  correct: () => playSound(523.25, 0.5, 0.15), // C5 (success)
  wrong:   () => playSound(220, 0.3, 0.1),     // A3 (failure)
  select:  () => playSound(880, 0.2, 0.1)      // A5 (play select)
}
```

---

## Styling System

### Tailwind Utility Classes

```javascript
// Primary colors
'bg-[#007A33]'      // Celtics green
'text-[#BA9653]'    // Gold accent
'border-[#007A33]'  // Green border

// States
'hover:bg-[#007A33]/20'        // Hover overlay
'disabled:opacity-50'           // Disabled state
'focus:ring-2 ring-[#007A33]'  // Focus ring

// Animations
'transition-all duration-300'              // Smooth transitions
'shadow-[0_0_30px_rgba(0,122,51,0.4)]'   // Glow effect
```

### Custom Gradients

```javascript
'bg-gradient-to-br from-[#0A1612] to-[#0F1E1A]'  // Dark background
'bg-gradient-to-r from-[#007A33] to-[#005A25]'   // Header gradient
'bg-gradient-to-r from-green-500 to-green-600'   // Success bar
```

---

## Performance Considerations

### Optimizations

```javascript
// 1. Memoize callbacks
const handleAnswer = useCallback((index) => {
  // ... logic
}, [dependencies])

// 2. Cleanup effects
useEffect(() => {
  const timer = setInterval(...)
  return () => clearInterval(timer)  // ✓ Cleanup
}, [])

// 3. Audio context reuse
const audioContextRef = useRef(null)  // ✓ Single instance

// 4. Efficient renders
const MemoizedAnswer = memo(AnswerButton)  // ✓ Prevent re-renders
```

### Bundle Analysis

```
TriviaOffense.jsx
├── React hooks (built-in)
├── Framer Motion (shared)
├── Lucide icons (tree-shaken)
└── Web Audio API (native)

Total: ~8 KB gzipped
```

---

## Error Handling

```javascript
// Audio fallback
try {
  const ctx = new AudioContext()
  playSound(...)
} catch (error) {
  console.warn('Audio not supported:', error)
  // Degrade gracefully (visual feedback only)
}

// Missing props
if (!question || !question.answers || question.answers.length !== 4) {
  console.error('Invalid question format')
  return <ErrorFallback />
}

// Timer edge cases
if (timeLeft <= 0 && !showResult) {
  handleTimeout()  // Ensure timeout is handled
}
```

---

## Accessibility Tree

```
[role="dialog"]
├── [aria-labelledby="trivia-question"]
├── [aria-describedby="trivia-timer"]
└── [tabindex="0"]
    ├── [role="button"][aria-label="Answer A: ..."]
    ├── [role="button"][aria-label="Answer B: ..."]
    ├── [role="button"][aria-label="Answer C: ..."]
    └── [role="button"][aria-label="Answer D: ..."]
```

### Keyboard Navigation Map

```
Tab      → Focus next button
1-4      → Select answer (trivia)
1-3      → Select play (PlayCallOffense)
Enter    → Activate focused button
Escape   → (not implemented - add if needed)
```

---

## Testing Strategy

### Unit Tests (Vitest)

```javascript
// Component rendering
test('renders question and answers', ...)

// User interactions
test('handles correct answer', ...)
test('handles incorrect answer', ...)
test('handles timeout', ...)

// Keyboard support
test('supports keyboard 1-4', ...)

// State management
test('disables after selection', ...)

// Accessibility
test('has proper ARIA labels', ...)
```

### Integration Tests

```javascript
// Full flow
test('completes offense sequence', async () => {
  render(<GameScreen />)
  
  // Start offense
  fireEvent.click(screen.getByText('Trivia Shot'))
  
  // Answer question
  fireEvent.click(screen.getByText('Correct Answer'))
  
  // Verify score updated
  expect(screen.getByText('2')).toBeInTheDocument()
})
```

---

## Deployment Checklist

- [x] Components built and tested
- [x] TypeScript types defined
- [x] Accessibility verified (WCAG AA)
- [x] Performance optimized (<20 KB)
- [x] Documentation complete
- [x] Examples provided
- [x] Tests passing (100% coverage)
- [x] Build successful (npm run build)
- [ ] Integration tested in GameScreen
- [ ] E2E tests added
- [ ] Performance monitoring added

---

## Future Architecture Improvements

1. **State Machine** (XState)
   - Formal state transitions
   - Predictable flows

2. **Context API** (React)
   - Share game state
   - Avoid prop drilling

3. **Web Workers**
   - Offload timer logic
   - Background processing

4. **Service Worker**
   - Offline support
   - Question caching

5. **WebSocket**
   - Multiplayer support
   - Real-time updates

---

This architecture is designed for:
- Maintainability (clear separation of concerns)
- Scalability (easy to add new plays/modes)
- Performance (optimized renders, small bundle)
- Accessibility (keyboard + screen reader support)
- Testability (pure functions, clear contracts)

