# Offense Components - Quick Reference

## Import

```jsx
import { TriviaOffense, PlayCallOffense } from './components/offense'
```

---

## TriviaOffense

### Props
```typescript
{
  question: {
    question: string
    answers: string[]      // Array of 4 answers
    correct: number        // Index of correct answer (0-3)
    index?: number         // Optional question ID
  }
  player: {
    name: string
    number: number
    position: string
  }
  onComplete: (isCorrect: boolean, questionIndex: number) => void
}
```

### Example
```jsx
<TriviaOffense
  question={{
    question: "Who won Finals MVP in 2008?",
    answers: ["KG", "Pierce", "Allen", "Rondo"],
    correct: 1,
    index: 42
  }}
  player={{ name: "Jayson Tatum", number: 0, position: "SF" }}
  onComplete={(correct, idx) => {
    if (correct) scorePoints(2)
  }}
/>
```

---

## PlayCallOffense

### Props
```typescript
{
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
  onComplete: (isCorrect: boolean, playType: string, questionIndex: number) => void
}
```

### Play Types
- `'pick-roll'` - 75% success, balanced
- `'isolation'` - 60% success, hard
- `'fast-break'` - 85% success, easy

### Example
```jsx
<PlayCallOffense
  question={question}
  player={{ name: "Jaylen Brown", number: 7, position: "SG" }}
  onComplete={(correct, play, idx) => {
    console.log(`${play}: ${correct ? 'SCORE' : 'MISS'}`)
  }}
/>
```

---

## Keyboard Shortcuts

### TriviaOffense
- `1` - Answer A
- `2` - Answer B
- `3` - Answer C
- `4` - Answer D

### PlayCallOffense (Phase 1)
- `1` - Pick & Roll
- `2` - Isolation
- `3` - Fast Break

### PlayCallOffense (Phase 2)
- `1-4` - Same as TriviaOffense

---

## Timers

| Component | Phase | Duration | Auto Action |
|-----------|-------|----------|-------------|
| TriviaOffense | Question | 10s | Mark wrong |
| PlayCallOffense | Play Select | 5s | Pick & Roll |
| PlayCallOffense | Trivia | 10s | Mark wrong |

---

## Return Values

### TriviaOffense
```jsx
onComplete(isCorrect, questionIndex)
// isCorrect: boolean
// questionIndex: number
```

### PlayCallOffense
```jsx
onComplete(isCorrect, playType, questionIndex)
// isCorrect: boolean
// playType: 'pick-roll' | 'isolation' | 'fast-break'
// questionIndex: number
```

---

## Common Patterns

### Random Question
```jsx
import { getRandomQuestion } from './data/questions'

const [used, setUsed] = useState([])
const { question, index } = getRandomQuestion(used)

// Pass to component
<TriviaOffense
  question={{ ...question, index }}
  player={player}
  onComplete={(correct, idx) => {
    setUsed(prev => [...prev, idx])
  }}
/>
```

### Score Tracking
```jsx
const [score, setScore] = useState(0)

const handleComplete = (isCorrect) => {
  if (isCorrect) {
    setScore(prev => prev + 2)
  }
}
```

### Play Statistics
```jsx
const [stats, setStats] = useState({
  'pick-roll': { made: 0, attempts: 0 },
  'isolation': { made: 0, attempts: 0 },
  'fast-break': { made: 0, attempts: 0 }
})

const handleComplete = (isCorrect, playType) => {
  setStats(prev => ({
    ...prev,
    [playType]: {
      made: prev[playType].made + (isCorrect ? 1 : 0),
      attempts: prev[playType].attempts + 1
    }
  }))
}
```

---

## Styling

### Custom Colors (Tailwind)
Components use Celtics theme by default. To customize:

```jsx
// TriviaOffense uses these classes:
'bg-[#007A33]'  // Celtics green
'text-[#BA9653]' // Gold
'border-[#007A33]/40' // Green with opacity

// Override in parent with CSS variables:
<div style={{ '--color-primary': '#FF0000' }}>
  <TriviaOffense {...props} />
</div>
```

### Fonts
Requires `Oswald` font family:
```html
<link href="https://fonts.googleapis.com/css2?family=Oswald:wght@700&display=swap" rel="stylesheet">
```

---

## Accessibility

### ARIA Labels
Both components include proper ARIA attributes:
- `role="dialog"`
- `aria-labelledby`
- `aria-describedby`
- `aria-label` on buttons

### Keyboard Navigation
- Full keyboard support
- Tab navigation
- Number key shortcuts
- Escape to close (not implemented - add if needed)

---

## Sound Effects

Uses Web Audio API (degrades gracefully):
- Timer ticks (last 5 seconds)
- Success sound (correct answer)
- Failure sound (wrong/timeout)
- Play selection confirmation

To disable:
```jsx
// Wrap in audio context check
if (typeof AudioContext === 'undefined') {
  // No audio support
}
```

---

## Error Handling

### Missing Props
Components will error if required props missing:
```jsx
// ❌ Will error
<TriviaOffense />

// ✅ Correct
<TriviaOffense question={q} player={p} onComplete={fn} />
```

### Invalid Question Format
```jsx
// ❌ Wrong
question: { q: "...", a: [] }

// ✅ Correct
question: {
  question: "...",
  answers: ["A", "B", "C", "D"],
  correct: 0
}
```

---

## Testing

### Mock Example
```jsx
import { render, fireEvent } from '@testing-library/react'
import { TriviaOffense } from './components/offense'

test('handles correct answer', () => {
  const onComplete = vi.fn()

  render(
    <TriviaOffense
      question={mockQuestion}
      player={mockPlayer}
      onComplete={onComplete}
    />
  )

  fireEvent.click(screen.getByText('Correct Answer'))

  expect(onComplete).toHaveBeenCalledWith(true, 0)
})
```

---

## Performance Tips

1. **Memoize callbacks:**
```jsx
const handleComplete = useCallback((correct, idx) => {
  // ...
}, [dependencies])
```

2. **Lazy load:**
```jsx
const TriviaOffense = lazy(() => import('./components/offense/TriviaOffense'))
```

3. **Cleanup timers:**
Components handle cleanup automatically, but if wrapping:
```jsx
useEffect(() => {
  return () => {
    // Component unmounts cleanly
  }
}, [])
```

---

## Troubleshooting

### "Question doesn't appear"
- Check `question` prop format
- Verify `answers` array has 4 items
- Check `correct` index is 0-3

### "Timer doesn't start"
- Check browser console for errors
- Verify component is mounted
- Check if `showResult` is already true

### "No sound"
- Web Audio API requires user interaction
- Check browser audio permissions
- Falls back gracefully if unsupported

### "Animations jerky"
- Check for 60 FPS rendering
- Disable other heavy animations
- Reduce motion in OS settings

---

## Version

**v1.0.0** - Initial release (2025-12-14)

Components tested with:
- React 18.3.1
- Framer Motion 12.23.26
- Tailwind CSS 3.4+

---

## Support

- **Docs:** `/src/components/offense/README.md`
- **Examples:** `*.example.jsx` files
- **Tests:** `*.test.jsx` files
- **Issues:** Check component prop validation
