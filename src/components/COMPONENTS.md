# Boston Celtics Game Components

Quick reference for the interactive game components.

## Components Overview

### 1. RapidTap (Defense QTE)
**Location:** `/var/www/html/bostonceltics.com/src/components/qte/RapidTap.jsx`

Defense quick-time event when Lakers have possession. Player taps rapidly to contest/block shots.

**Props:**
- `lakersAction`: `'three-point' | 'mid-range' | 'drive'`
- `lakersPlayer`: `{ name: string, number: number }`
- `onComplete`: `(result: 'blocked' | 'contested' | 'steal' | 'open') => void`
- `difficulty`: `'easy' | 'medium' | 'hard'`

**Thresholds:**
| Difficulty | Block | Contest |
|-----------|-------|---------|
| Easy      | 15    | 8       |
| Medium    | 20    | 12      |
| Hard      | 25    | 15      |

**Features:**
- 3-second rapid tap mechanic
- Random steal opportunity (600ms window)
- Progress bar with thresholds
- Keyboard (Space) and touch support
- Mobile-optimized (120px button height)

**Usage:**
```jsx
import RapidTap from '@/components/qte/RapidTap'

<RapidTap
  lakersAction="three-point"
  lakersPlayer={{ name: "LeBron James", number: 23 }}
  onComplete={(result) => {
    if (result === 'blocked') {
      // Lakers miss, Celtics ball
    }
  }}
  difficulty="medium"
/>
```

---

### 2. QuizModal (Trivia)
**Location:** `/var/www/html/bostonceltics.com/src/components/quiz/QuizModal.jsx`

Trivia modal with 10-second timer. Correct answers boost shot accuracy.

**Props:**
- `question`: `{ question: string, answers: string[], correct: number, index?: number }`
- `onComplete`: `(isCorrect: boolean, questionIndex: number) => void`

**Features:**
- 10-second circular countdown timer
- 4 multiple choice answers (A, B, C, D)
- Keyboard shortcuts (1-4 keys)
- Audio tick in last 5 seconds
- Mobile-friendly (72px button height)
- Correct answer highlight on wrong selection

**Usage:**
```jsx
import QuizModal from '@/components/quiz/QuizModal'

<QuizModal
  question={{
    question: "Who holds the Celtics career scoring record?",
    answers: ["Larry Bird", "John Havlicek", "Paul Pierce", "Bill Russell"],
    correct: 2
  }}
  onComplete={(isCorrect, index) => {
    if (isCorrect) {
      // Apply +15% shot accuracy boost
    }
  }}
/>
```

---

## Accessibility

Both components are WCAG 2.1 AA compliant:

- Keyboard navigation (Space, Enter, 1-4 keys)
- Screen reader support (ARIA labels)
- High contrast (15.5:1 white on dark)
- Touch targets (min 48-72px)
- No keyboard traps
- Semantic HTML

See individual `ACCESSIBILITY.md` files for full checklists.

---

## Performance

### Bundle Size
- RapidTap: ~5KB gzipped
- QuizModal: ~6KB gzipped

### Optimizations
- `useCallback` for event handlers
- `useRef` for timers (no re-renders)
- GPU-accelerated animations (transform, opacity)
- Debounced input (50ms for taps)
- Lazy-loadable components

### Mobile
- Touch-optimized (touch-none, select-none)
- Responsive grid layouts
- Hardware acceleration
- No layout shifts

---

## Testing

Run tests:
```bash
npm test RapidTap.test.jsx
npm test QuizModal.test.jsx
```

Test files include:
- Component rendering
- User interactions (click, keyboard)
- Timer functionality
- Result calculation
- Accessibility attributes

---

## Examples

See example files for integration patterns:
- `/var/www/html/bostonceltics.com/src/components/qte/RapidTap.example.jsx`
- `/var/www/html/bostonceltics.com/src/components/quiz/QuizModal.example.jsx`

Includes:
- Basic usage
- Dynamic difficulty
- State management integration
- Stats tracking
- Animation transitions
- Multiple questions
- Random question pools

---

## Color Palette

```css
/* Celtics */
--celtics-green: #007A33;
--celtics-gold: #BA9653;

/* Lakers */
--lakers-purple: #552583;
--lakers-gold: #FDB927;

/* Background */
--dark-bg: #0A1612;
--dark-overlay: #0F1E1A;

/* Status */
--success: #4ADE80;
--warning: #F59E0B;
--error: #EF4444;
```

---

## Dependencies

Required packages:
```json
{
  "framer-motion": "^10.x",
  "lucide-react": "^0.x",
  "react": "^18.x"
}
```

Tailwind CSS required for styling.

---

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile Safari iOS 14+
- Chrome Android 90+

Web Audio API used for quiz timer ticks (gracefully degrades).
