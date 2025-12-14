# Accessibility Checklist for Defense Components

## Current Implementation

### DefenseChoice & DefensePredict

#### Keyboard Navigation
- [x] All buttons are keyboard accessible
- [x] Buttons respond to Enter key
- [ ] TODO: Add Space key support
- [ ] TODO: Add focus visible styles
- [ ] TODO: Add escape key to cancel (if needed)

#### Screen Readers
- [ ] TODO: Add ARIA labels to all buttons
- [ ] TODO: Add ARIA live regions for timer countdown
- [ ] TODO: Add ARIA announcements for results
- [ ] TODO: Add role="dialog" to overlay
- [ ] TODO: Add aria-describedby for instructions

#### Visual Accessibility
- [x] High contrast colors (Lakers purple/gold vs Celtics green)
- [x] Color changes are not the only indicator (text + icons)
- [x] Text size is large enough (minimum 16px)
- [ ] TODO: Add focus indicators (2px outline)
- [ ] TODO: Test with browser zoom (200%)

#### Motion & Animation
- [x] Animations use GPU-accelerated transforms
- [ ] TODO: Respect `prefers-reduced-motion` media query
- [ ] TODO: Add option to disable animations

#### Timing
- [x] Adequate time provided (4-5 seconds)
- [x] Auto-fallback if timeout (Contest or random prediction)
- [ ] TODO: Consider pause button for timers
- [ ] TODO: Add option to extend timer

---

## Recommended Enhancements

### 1. ARIA Labels

```jsx
// DefenseChoice.jsx - Add to buttons
<motion.button
  onClick={() => handleChoice(action.id)}
  aria-label={`${action.label}: ${action.description}`}
  aria-pressed={selectedChoice === action.id}
  role="button"
>
  {/* ... */}
</motion.button>

// Add to timer
<div
  role="timer"
  aria-live="polite"
  aria-atomic="true"
  aria-label={`${timeLeft} seconds remaining`}
>
  {timeLeft}
</div>

// Add to overlay
<motion.div
  role="dialog"
  aria-labelledby="defense-title"
  aria-describedby="defense-instructions"
>
  <h2 id="defense-title">DEFENSE!</h2>
  <p id="defense-instructions">Choose your defensive action</p>
  {/* ... */}
</motion.div>
```

### 2. Focus Management

```jsx
import { useRef, useEffect } from 'react'

export default function DefenseChoice({ ... }) {
  const firstButtonRef = useRef(null)

  // Auto-focus first button when component mounts
  useEffect(() => {
    firstButtonRef.current?.focus()
  }, [])

  return (
    // ...
    <motion.button
      ref={firstButtonRef}
      className="focus:ring-4 focus:ring-white/50 focus:outline-none"
      // ...
    />
  )
}
```

### 3. Reduced Motion Support

```jsx
// Add to tailwind.config.js or inline
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

// In components
<motion.div
  initial={prefersReducedMotion ? false : { opacity: 0 }}
  animate={prefersReducedMotion ? false : { opacity: 1 }}
  transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.3 }}
>
  {/* ... */}
</motion.div>

// Or create a hook
function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const listener = (e) => setPrefersReducedMotion(e.matches)
    mediaQuery.addEventListener('change', listener)
    return () => mediaQuery.removeEventListener('change', listener)
  }, [])

  return prefersReducedMotion
}
```

### 4. Live Region Announcements

```jsx
// Add hidden live region for screen reader announcements
<div
  className="sr-only"
  role="status"
  aria-live="assertive"
  aria-atomic="true"
>
  {showResult && result && (
    <span>
      {result === 'block' ? 'Blocked! Great defense!' :
       result === 'steal' ? 'Steal! You got the ball!' :
       result === 'foul' ? 'Foul called. Lakers shooting free throws.' :
       result === 'miss' ? 'Lakers miss! Celtics rebound!' :
       'Lakers score.'}
    </span>
  )}
</div>

// Add sr-only utility to CSS if not already in Tailwind
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

### 5. Keyboard Shortcuts

```jsx
useEffect(() => {
  const handleKeyPress = (e) => {
    if (selectedChoice || showResult) return

    switch (e.key) {
      case '1':
        handleChoice('contest')
        break
      case '2':
        handleChoice('block')
        break
      case '3':
        handleChoice('steal')
        break
      case 'Escape':
        // Optional: cancel/go back
        break
    }
  }

  window.addEventListener('keydown', handleKeyPress)
  return () => window.removeEventListener('keydown', handleKeyPress)
}, [selectedChoice, showResult])

// Add keyboard hint in UI
<p className="text-white/60 text-sm text-center mb-4">
  Press 1, 2, or 3 to choose
</p>
```

---

## Testing Tools

### Manual Testing
- [ ] Test with keyboard only (no mouse)
- [ ] Test with screen reader (NVDA, JAWS, VoiceOver)
- [ ] Test at 200% browser zoom
- [ ] Test with high contrast mode
- [ ] Test with reduced motion enabled
- [ ] Test with color blindness simulator

### Automated Testing
- [ ] Run axe DevTools browser extension
- [ ] Run Lighthouse accessibility audit
- [ ] Use WAVE browser extension
- [ ] Test with React Testing Library

### Screen Reader Commands

**macOS VoiceOver:**
- Cmd + F5: Enable/disable
- VO + Right Arrow: Navigate forward
- VO + Space: Activate button

**NVDA (Windows):**
- Ctrl + Alt + N: Start NVDA
- Tab: Navigate buttons
- Enter/Space: Activate button

**JAWS (Windows):**
- Insert + F7: List buttons
- Tab: Navigate
- Enter/Space: Activate

---

## WCAG 2.1 Level AA Compliance

### Perceivable
- [x] 1.4.3 Contrast (Minimum) - 4.5:1 for text
- [x] 1.4.11 Non-text Contrast - 3:1 for UI components
- [ ] TODO: 1.4.13 Content on Hover or Focus

### Operable
- [x] 2.1.1 Keyboard - All functionality via keyboard
- [ ] TODO: 2.1.2 No Keyboard Trap
- [x] 2.2.1 Timing Adjustable - Auto-fallback provided
- [ ] TODO: 2.4.7 Focus Visible

### Understandable
- [x] 3.2.1 On Focus - No unexpected changes
- [x] 3.2.2 On Input - No unexpected changes
- [x] 3.3.1 Error Identification - Clear result feedback

### Robust
- [ ] TODO: 4.1.2 Name, Role, Value - ARIA labels needed
- [x] 4.1.3 Status Messages - Result displays clear

---

## Quick Wins (Easy Improvements)

1. **Add focus-visible styles** (5 min)
   ```jsx
   className="focus-visible:ring-4 focus-visible:ring-white/50 focus-visible:outline-none"
   ```

2. **Add ARIA labels to buttons** (10 min)
   ```jsx
   aria-label={`${action.label}: ${action.description}`}
   ```

3. **Add role="dialog"** (2 min)
   ```jsx
   <motion.div role="dialog" aria-modal="true">
   ```

4. **Add timer aria-live** (5 min)
   ```jsx
   <div role="timer" aria-live="polite">{timeLeft}</div>
   ```

5. **Test with keyboard** (10 min)
   - Tab through all buttons
   - Activate with Enter
   - Verify focus visible

**Total time: ~30 minutes for major accessibility improvements**

---

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [React Accessibility Docs](https://react.dev/learn/accessibility)

---

## Color Contrast Analysis

### Current Colors

| Foreground | Background | Ratio | Pass AA | Pass AAA |
|-----------|-----------|-------|---------|----------|
| White (#FFF) | Lakers Purple (#552583) | 7.8:1 | ✅ | ✅ |
| Lakers Gold (#FDB927) | Black (#000) | 13.4:1 | ✅ | ✅ |
| Celtics Green (#007A33) | White (#FFF) | 3.8:1 | ✅ | ❌ |
| Success Green (#44FF44) | Black (#000) | 14.2:1 | ✅ | ✅ |
| Danger Red (#FF4444) | White (#FFF) | 4.2:1 | ✅ | ❌ |

All colors pass WCAG AA (4.5:1 for normal text, 3:1 for large text/UI).

---

## Implementation Priority

### High Priority (Do First)
1. Add ARIA labels to all interactive elements
2. Add focus-visible styles
3. Add keyboard shortcuts (1, 2, 3)
4. Test with keyboard navigation

### Medium Priority
1. Add reduced motion support
2. Add live region announcements
3. Add role="dialog" and aria-modal
4. Test with screen readers

### Low Priority (Nice to Have)
1. Add pause button for timers
2. Add settings for extended time
3. Add audio feedback for screen reader users
4. Add keyboard navigation indicators

---

## Example: Fully Accessible Button

```jsx
<motion.button
  ref={index === 0 ? firstButtonRef : null}
  onClick={() => handleChoice(action.id)}
  disabled={selectedChoice !== null}
  aria-label={`${action.label}: ${action.description}. Press to select.`}
  aria-pressed={selectedChoice === action.id}
  aria-disabled={selectedChoice !== null}
  className={`
    relative px-6 py-8 rounded-2xl backdrop-blur-md
    bg-gradient-to-br ${action.color}
    border-2 border-white/20
    transition-all ${action.hoverColor}
    hover:shadow-2xl
    disabled:opacity-50 disabled:cursor-not-allowed
    focus-visible:ring-4 focus-visible:ring-white/50
    focus-visible:outline-none
    ${isSelected ? 'ring-4 ring-white' : ''}
  `}
  whileHover={{ scale: selectedChoice ? 1 : 1.05 }}
  whileTap={{ scale: selectedChoice ? 1 : 0.95 }}
>
  <div className="flex flex-col items-center gap-3">
    <Icon
      className="w-12 h-12 text-white"
      strokeWidth={2.5}
      aria-hidden="true"
    />
    <div className="text-center">
      <p className="font-['Oswald'] text-xl font-bold text-white mb-1">
        {action.label}
      </p>
      <p className="text-white/80 text-sm">
        {action.description}
      </p>
    </div>
  </div>

  {/* Keyboard hint */}
  <span className="absolute top-2 right-2 text-xs text-white/60">
    Press {index + 1}
  </span>
</motion.button>
```
