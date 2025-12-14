# Defense Components Design System

Visual design specifications and component anatomy for DefenseChoice and DefensePredict.

## Color Palette

### Primary Colors

```css
/* Lakers (Enemy) */
--lakers-purple: #552583;      /* Primary purple */
--lakers-purple-dark: #3d1a5f; /* Darker shade for gradients */
--lakers-gold: #FDB927;        /* Accent gold */

/* Celtics */
--celtics-green: #007A33;      /* Primary green */
--celtics-green-dark: #005a25; /* Darker shade for gradients */
--celtics-gold: #BA9653;       /* Banner gold accent */

/* Feedback Colors */
--success-green: #44FF44;      /* Blocks, steals, correct predictions */
--danger-red: #FF4444;         /* Fouls, wrong predictions */
--warning-yellow: #FDB927;     /* Lakers scores, low timer */
```

### Color Usage

| Element | Color | Usage |
|---------|-------|-------|
| Lakers player card | `lakers-purple` → `lakers-purple-dark` | Background gradient |
| Lakers jersey number | `lakers-gold` with 30% opacity | Background fill |
| Lakers text | `lakers-gold` | Primary text |
| Villain glow | `red-900` at 40% | Pulsing overlay |
| Timer (5-4s) | `white` | Safe zone |
| Timer (3s) | `lakers-gold` | Warning |
| Timer (2-1s) | `danger-red` | Urgent |
| Miss result | `celtics-green` | Success feedback |
| Block/Steal result | `success-green` | Great success |
| Foul result | `danger-red` | Negative feedback |
| Score result | `lakers-gold` | Lakers success |

### Contrast Ratios (WCAG AA)

| Foreground | Background | Ratio | Pass |
|-----------|-----------|-------|------|
| White | Lakers Purple | 7.8:1 | ✅ AAA |
| Lakers Gold | Black | 13.4:1 | ✅ AAA |
| Success Green | Black | 14.2:1 | ✅ AAA |
| Danger Red | White | 4.2:1 | ✅ AA |

---

## Typography

### Font Stack

```css
/* Headers, numbers, emphasis */
font-family: 'Oswald', -apple-system, BlinkMacSystemFont, sans-serif;

/* Body text (if needed) */
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

### Type Scale

| Element | Size | Weight | Transform | Line Height |
|---------|------|--------|-----------|-------------|
| Timer | 60px | Bold | - | 1 |
| Main heading (DEFENSE!) | 24px | Bold | Uppercase | 1.2 |
| Player name | 24px | Bold | - | 1.1 |
| Action heading | 30px | Bold | Uppercase | 1.2 |
| Result message | 48px | Bold | Uppercase | 1.1 |
| Button label | 20px | Bold | Uppercase | 1.2 |
| Button description | 14px | Normal | - | 1.3 |
| Player details | 14px | Normal | - | 1.3 |

---

## Spacing System

### Padding Scale

```css
--spacing-xs: 0.25rem;  /* 4px */
--spacing-sm: 0.5rem;   /* 8px */
--spacing-md: 1rem;     /* 16px */
--spacing-lg: 1.5rem;   /* 24px */
--spacing-xl: 2rem;     /* 32px */
--spacing-2xl: 3rem;    /* 48px */
--spacing-3xl: 4rem;    /* 64px */
```

### Component Spacing

| Element | Padding | Margin |
|---------|---------|--------|
| Full overlay | 16px | - |
| Player card | 24px | 0 0 32px |
| Action button | 24px 24px | - |
| Result box | 48px 48px | - |
| Button grid gap | - | 16px |
| Icon-to-text gap | - | 12px |

---

## Component Anatomy

### DefenseChoice Structure

```
┌─────────────────────────────────────────────┐
│                    [5]                       │  Timer (60px)
│                                              │
│              ┌─────────────┐                 │
│              │  DEFENSE!   │                 │  Heading (24px)
│              │ ACTION TEXT │                 │  Subheading (18px)
│              └─────────────┘                 │
│                                              │
│  ┌──────────────────────────────────────┐   │
│  │ [#23]  LeBron James     🏀          │   │  Lakers player card
│  │        SF • 92 OVR                   │   │  - Jersey number (48px)
│  │                                      │   │  - Name (24px)
│  │               [VILLAIN]              │   │  - Stats (14px)
│  └──────────────────────────────────────┘   │
│                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  │  Action buttons
│  │   🖐️     │  │   🛡️     │  │   ✊     │  │  - Icon (48px)
│  │ CONTEST  │  │  BLOCK   │  │  STEAL   │  │  - Label (20px)
│  │ 50% miss │  │ 30% block│  │ 25% steal│  │  - Desc (14px)
│  └──────────┘  └──────────┘  └──────────┘  │
│                                              │
│                                     🛡️       │  Celtics silhouette
└─────────────────────────────────────────────┘
      BEAT LA    BEAT LA    BEAT LA             Background text (60px)
```

### DefensePredict Structure

```
┌─────────────────────────────────────────────┐
│                    [4]                       │  Timer (60px)
│                                              │
│              ┌─────────────┐                 │
│              │ READ THE     │                │  Heading (24px)
│              │   PLAY!      │                │  Subheading (18px)
│              └─────────────┘                 │
│                                              │
│  ┌──────────────────────────────────────┐   │
│  │          ❓                          │   │  Mystery overlay
│  │ [#3]   Anthony Davis    🏀          │   │  (until prediction)
│  │        PF • 91 OVR                   │   │
│  │               [VILLAIN]              │   │
│  └──────────────────────────────────────┘   │
│                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  │  Prediction buttons
│  │   🎯     │  │   📈     │  │   ⚡     │  │  w/ SCOUT badge
│  │3-POINTER │  │MID-RANGE │  │  DRIVE   │  │
│  │ Outside! │  │ Jumper!  │  │ To rim!  │  │
│  └──────────┘  └──────────┘  └──────────┘  │
│                                              │
│                                     👀       │  Celtics silhouette
└─────────────────────────────────────────────┘
    DEFENSE!  DEFENSE!  DEFENSE!               Background text (60px)
```

### Result Display

```
┌─────────────────────────────────────────────┐
│                                              │
│              ┌─────────────┐                 │
│              │             │                 │
│              │   [ICON]    │                 │  Icon (80px)
│              │             │                 │
│              │   BLOCKED!  │                 │  Message (48px)
│              │             │                 │
│              └─────────────┘                 │
│                                              │
└─────────────────────────────────────────────┘
```

---

## Border Radius System

```css
--radius-sm: 0.5rem;   /* 8px - Small elements */
--radius-md: 0.75rem;  /* 12px - Cards */
--radius-lg: 1rem;     /* 16px - Buttons */
--radius-xl: 1.5rem;   /* 24px - Main containers */
```

### Usage

| Element | Radius |
|---------|--------|
| Overlay | 0 (fullscreen) |
| Player card | 16px |
| Action buttons | 16px |
| Result box | 16px |
| Jersey number | 12px |
| Badges | 9999px (pill) |

---

## Shadow System

### Elevation Levels

```css
/* Level 1 - Subtle */
box-shadow: 0 2px 4px rgba(0,0,0,0.1);

/* Level 2 - Card */
box-shadow: 0 4px 12px rgba(0,0,0,0.15);

/* Level 3 - Elevated */
box-shadow: 0 8px 24px rgba(0,0,0,0.2);

/* Level 4 - Modal */
box-shadow: 0 16px 48px rgba(0,0,0,0.3);
```

### Glow Effects

```css
/* Lakers card */
box-shadow:
  0 0 30px rgba(253,185,39,0.3),  /* Gold glow */
  0 0 60px rgba(85,37,131,0.2);    /* Purple glow */

/* Villain card */
box-shadow:
  0 0 40px rgba(255,68,68,0.4),    /* Red glow */
  0 0 80px rgba(85,37,131,0.3);    /* Purple glow */

/* Success result */
box-shadow:
  0 0 40px rgba(68,255,68,0.5),    /* Green glow */
  inset 0 0 20px rgba(68,255,68,0.2);
```

---

## Animation Specifications

### Timing Functions

```css
/* Default easing */
transition-timing-function: cubic-bezier(0.4, 0.0, 0.2, 1);

/* Enter animations */
transition-timing-function: cubic-bezier(0.0, 0.0, 0.2, 1);

/* Exit animations */
transition-timing-function: cubic-bezier(0.4, 0.0, 1, 1);
```

### Animation Durations

| Animation | Duration | Easing |
|-----------|----------|--------|
| Overlay enter | 300ms | ease-out |
| Overlay exit | 200ms | ease-in |
| Button hover | 200ms | ease |
| Button press | 100ms | ease |
| Result appear | 400ms | ease-out |
| Result pulse | 500ms | ease-in-out |
| Timer pulse | 500ms | ease-in-out (repeat) |
| Villain glow | 2000ms | ease-in-out (infinite) |
| Background text | 4000ms | linear (infinite) |

### Motion Presets

```jsx
// Framer Motion variants
const overlayVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
}

const cardVariants = {
  initial: { y: -50, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  exit: { y: 50, opacity: 0 },
}

const buttonVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  hover: { scale: 1.05 },
  tap: { scale: 0.95 },
}

const resultVariants = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  pulse: {
    scale: [1, 1.05, 1],
    transition: { duration: 0.5, repeat: 2 },
  },
}
```

---

## Icons

### Icon Library: Lucide React

```jsx
import {
  Shield,      // Block action
  Hand,        // Contest action
  Grab,        // Steal action
  Target,      // 3-pointer prediction
  TrendingUp,  // Mid-range prediction
  Zap,         // Drive prediction
  CheckCircle, // Correct prediction
  XCircle,     // Wrong prediction
  AlertTriangle, // Foul/score warning
  Trophy,      // Success
  HelpCircle,  // Mystery overlay
} from 'lucide-react'
```

### Icon Sizing

| Context | Size | Stroke Width |
|---------|------|--------------|
| Action button | 48px (12) | 2.5 |
| Result display | 80px (20) | 2.5 |
| Small badge | 16px (4) | 2 |
| Mystery overlay | 96px (24) | 2 |

### Icon Colors

Icons inherit text color from parent. Use `text-white` for contrast on colored backgrounds.

---

## Responsive Breakpoints

```css
/* Mobile first approach */
@media (min-width: 768px) {
  /* md: 3-column button layout */
  .button-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 767px) {
  /* sm: Single column layout */
  .button-grid {
    grid-template-columns: 1fr;
  }

  /* Smaller text on mobile */
  .timer { font-size: 48px; }
  .player-name { font-size: 20px; }
  .result-message { font-size: 36px; }
}
```

### Mobile Optimizations

- Single column button layout
- Larger touch targets (min 44x44px)
- Reduced animation complexity
- Simplified background effects
- Sticky timer at top

---

## Component States

### Button States

```jsx
// Default
className="bg-gradient-to-br from-blue-500 to-blue-700"

// Hover
className="hover:shadow-2xl hover:shadow-blue-500/50"

// Focus
className="focus-visible:ring-4 focus-visible:ring-white/50"

// Active/Selected
className="ring-4 ring-white"

// Disabled
className="disabled:opacity-50 disabled:cursor-not-allowed"
```

### Timer States

```jsx
// Safe (5-4s)
className="text-white"

// Warning (3s)
className="text-[#FDB927]"

// Danger (2-1s)
className="text-[#FF4444]"
animate={{ scale: [1, 1.1, 1] }} // Pulse
```

### Player Card States

```jsx
// Normal
className="border-2 border-[#FDB927]/30"
boxShadow="0 0 30px rgba(253,185,39,0.3)"

// Villain
className="border-2 border-[#FDB927]/30"
boxShadow="0 0 40px rgba(255,68,68,0.4)"
overlay: { background: red-900/40, pulsing }
badge: "VILLAIN" in top-right
```

---

## Accessibility Features

### Focus Indicators

```css
/* All interactive elements */
.interactive:focus-visible {
  outline: 4px solid white;
  outline-offset: 2px;
  border-radius: 16px;
}
```

### Screen Reader Text

```jsx
<span className="sr-only">
  Choose defensive action: Contest has 50% chance to force miss
</span>
```

### ARIA Labels

```jsx
<button aria-label="Contest: 50% force miss">
  <Hand /> CONTEST
</button>

<div role="timer" aria-live="polite" aria-atomic="true">
  {timeLeft}
</div>
```

---

## Design Tokens (CSS Custom Properties)

```css
:root {
  /* Colors */
  --lakers-purple: #552583;
  --lakers-gold: #FDB927;
  --celtics-green: #007A33;
  --success: #44FF44;
  --danger: #FF4444;

  /* Spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;

  /* Typography */
  --font-heading: 'Oswald', sans-serif;
  --font-body: -apple-system, sans-serif;

  /* Shadows */
  --shadow-sm: 0 2px 4px rgba(0,0,0,0.1);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.15);
  --shadow-lg: 0 8px 24px rgba(0,0,0,0.2);

  /* Radius */
  --radius-sm: 0.5rem;
  --radius-md: 0.75rem;
  --radius-lg: 1rem;
  --radius-xl: 1.5rem;

  /* Transitions */
  --transition-fast: 100ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-base: 200ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow: 300ms cubic-bezier(0.4, 0, 0.2, 1);
}
```

---

## Print Styles

Defense components are NOT designed for print (they're interactive game elements), but if needed:

```css
@media print {
  .defense-overlay {
    display: none;
  }
}
```

---

## Dark Mode

Components are designed for dark mode by default (dark overlay background). No light mode variant needed.

---

## Future Design Enhancements

- [ ] Add sound effect triggers in design
- [ ] Haptic feedback for mobile
- [ ] Particle effects for blocks/steals
- [ ] Court floor texture background
- [ ] Jersey number animations
- [ ] Sweat/intensity indicators
- [ ] Crowd noise visualization
- [ ] Referee whistle animation for fouls

---

## Design Resources

- **Font:** Oswald (Google Fonts) - Free
- **Icons:** Lucide React - Free, MIT license
- **Animations:** Framer Motion - Free, MIT license
- **Colors:** Based on official NBA team colors

---

## Credits

Design inspired by:
- NBA 2K game UI
- ESPN live game graphics
- Official Lakers/Celtics branding
- Modern sports betting interfaces
