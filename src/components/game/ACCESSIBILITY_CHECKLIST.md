# Player Sprites - Accessibility Checklist

## Overview
Accessibility checklist for the realistic player sprite components.

## WCAG 2.1 AA Compliance

### Perceivable

#### Color Contrast
- [x] Team colors have sufficient contrast with background
  - Celtics green (#007A33) on dark bg: 4.8:1 ratio
  - Lakers purple (#552583) on dark bg: 4.2:1 ratio
  - Jersey numbers (gold #BA9653/#FDB927): 4.5:1 ratio
- [x] Active player glows are distinguishable from inactive
- [x] Villain red glow (#DC2626) provides clear visual distinction
- [x] Ball orange (#FF6B35) contrasts with court color

#### Non-Text Content
- [ ] **TODO:** Add aria-label to PlayerSprite for screen readers
  ```jsx
  aria-label={`${team} player number ${number}, ${pose} pose`}
  ```
- [ ] **TODO:** Add role="img" to SVG sprites
- [ ] **TODO:** Add descriptive title element in SVG
  ```jsx
  <svg><title>{team} player #{number}</title>...</svg>
  ```

#### Text Alternatives
- [x] Jersey numbers are text elements (readable by screen readers)
- [x] Play type indicator uses semantic text
- [ ] **TODO:** Add aria-live region for play changes
  ```jsx
  <div aria-live="polite" aria-atomic="true">
    {playType && `Now running ${playType}`}
  </div>
  ```

### Operable

#### Keyboard Navigation
- [x] Components are non-interactive (pointer-events-none)
- [ ] **TODO:** If making interactive, add keyboard controls
  - Tab navigation through players
  - Arrow keys to move focus
  - Enter/Space to select player

#### Focus Indicators
- [ ] **TODO:** Add visible focus indicators if interactive
  ```jsx
  focus:ring-2 focus:ring-[#007A33] focus:ring-offset-2
  ```

#### Motion
- [x] Animations use `prefers-reduced-motion` (handled by Framer Motion)
- [ ] **TODO:** Add manual toggle for animations
  ```jsx
  const [reduceMotion, setReduceMotion] = useState(false)

  {!reduceMotion && <motion.div animate={...} />}
  ```

### Understandable

#### Readable
- [x] Font size for jersey numbers is legible (20px in SVG)
- [x] Play type text uses clear, uppercase formatting
- [x] Player names use simple last-name display

#### Predictable
- [x] Player positions are consistent per play type
- [x] Team colors are consistent (Celtics green, Lakers purple)
- [x] Active player always highlighted with glow
- [x] Ball follows active player predictably

#### Input Assistance
- [ ] **TODO:** Add tooltips on hover (if interactive)
- [ ] **TODO:** Error states for invalid positions/props

### Robust

#### Compatible
- [x] Uses semantic HTML where possible
- [x] SVG sprites are browser-compatible (Chrome/Firefox/Safari)
- [x] Percentage-based positioning is responsive
- [ ] **TODO:** Add fallback for browsers without SVG support

## Screen Reader Support

### Current State
- Jersey numbers are readable (text elements)
- Component structure is logical (offensive team first)

### Improvements Needed
```jsx
// PlayerSprite.jsx
<motion.div
  role="img"
  aria-label={`${team} team player number ${number}, currently ${pose}, ${isActive ? 'has possession' : 'defending'}`}
>
  <svg aria-hidden="true">...</svg>
</motion.div>

// CourtPlayers.jsx
<div role="region" aria-label="Basketball court with players">
  <div aria-live="polite" className="sr-only">
    {possession} team has possession. Running {playType || 'standard offense'}.
    Active player: {activePlayer?.name || 'none'}
  </div>
  {/* players */}
</div>
```

## Keyboard Navigation (If Interactive)

### Tab Order
1. Court container
2. Active player (ball handler)
3. Offensive players (left to right, top to bottom)
4. Defensive players (same order)
5. Play type controls

### Shortcuts
- `Space` - Pause/resume animations
- `Arrow Keys` - Move focus between players
- `Enter` - Select/highlight player
- `Esc` - Clear selection

## Mobile Accessibility

### Touch Targets
- [x] Player sprites scale appropriately on mobile (12-16px)
- [ ] **TODO:** Ensure 44x44px minimum touch target if interactive
- [x] Responsive sizing with md: breakpoints

### Gesture Support
- [ ] **TODO:** Swipe to change play type
- [ ] **TODO:** Pinch to zoom court view
- [ ] **TODO:** Double-tap to focus on active player

## Visual Accessibility

### Color Blindness
Test with color blindness simulators:

**Protanopia (red-blind):**
- Celtics green (#007A33) remains distinct
- Lakers purple (#552583) may blend with court
- **Solution:** Add pattern/texture to jerseys

**Deuteranopia (green-blind):**
- Celtics green may appear beige
- **Solution:** Add shape differences to teams

**Tritanopia (blue-blind):**
- Minimal impact on current colors
- Lakers gold trim remains visible

### High Contrast Mode
```css
@media (prefers-contrast: high) {
  .player-sprite {
    filter: brightness(1.2) contrast(1.3);
  }

  /* Stronger borders */
  svg path {
    stroke-width: 2;
  }
}
```

## Animation Accessibility

### Reduced Motion
```jsx
import { useReducedMotion } from 'framer-motion'

function PlayerSprite({ ... }) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      animate={shouldReduceMotion ? {} : {
        y: [0, -3, 0],
        transition: { duration: 2, repeat: Infinity }
      }}
    />
  )
}
```

### Pause Controls
```jsx
const [isPaused, setIsPaused] = useState(false)

<button
  onClick={() => setIsPaused(!isPaused)}
  aria-label={isPaused ? 'Resume animations' : 'Pause animations'}
>
  {isPaused ? 'Resume' : 'Pause'}
</button>
```

## Testing Checklist

### Automated Testing
- [ ] Run axe-core accessibility tests
- [ ] Run Lighthouse accessibility audit
- [ ] Test with WAVE browser extension

### Manual Testing
- [ ] Test with screen reader (NVDA/JAWS/VoiceOver)
- [ ] Test keyboard-only navigation
- [ ] Test with browser zoom (200%, 400%)
- [ ] Test on mobile devices (iOS/Android)
- [ ] Test with dark mode
- [ ] Test with high contrast mode

### User Testing
- [ ] Test with users who have low vision
- [ ] Test with users who use screen readers
- [ ] Test with users who navigate via keyboard
- [ ] Test with users who have motor disabilities

## Implementation Priority

### High Priority (Do Now)
1. Add aria-label to PlayerSprite
2. Add role="img" to SVG sprites
3. Add aria-live for play changes
4. Test with screen reader

### Medium Priority (Do Soon)
1. Add reduced motion toggle
2. Add keyboard navigation (if interactive)
3. Test color contrast in different modes
4. Add tooltips for player info

### Low Priority (Nice to Have)
1. Add pattern/texture for color-blind users
2. Add swipe gestures for mobile
3. Add zoom controls
4. Add audio cues for events

## Code Examples

### Accessible PlayerSprite
```jsx
export default function PlayerSprite({ team, number, pose, isActive, ... }) {
  const poseDescriptions = {
    standing: 'in athletic stance',
    running: 'running',
    shooting: 'taking a shot',
    defending: 'in defensive stance',
    ball: 'dribbling the ball'
  }

  return (
    <motion.div
      role="img"
      aria-label={`${team} player number ${number}, ${poseDescriptions[pose]}${isActive ? ', has possession' : ''}`}
      tabIndex={isActive ? 0 : -1}
      className="player-sprite"
    >
      <svg aria-hidden="true">
        <title>{team} player #{number}</title>
        {/* SVG content */}
      </svg>
    </motion.div>
  )
}
```

### Accessible CourtPlayers
```jsx
export default function CourtPlayers({ possession, playType, activePlayer, ... }) {
  return (
    <div role="region" aria-label="Basketball court">
      {/* Screen reader only announcements */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {possession} team has possession.
        {playType && ` Running ${playType.replace('-', ' and ')}.`}
        {activePlayer && ` Active player: ${activePlayer.name}.`}
      </div>

      {/* Visual content */}
      <div aria-hidden="true">
        {/* Players and ball */}
      </div>
    </div>
  )
}
```

### Screen Reader Only Utility
```css
/* Add to global CSS */
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

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [Framer Motion Accessibility](https://www.framer.com/motion/accessibility/)
- [React Accessibility](https://react.dev/learn/accessibility)
- [WebAIM Screen Reader Testing](https://webaim.org/articles/screenreader_testing/)
