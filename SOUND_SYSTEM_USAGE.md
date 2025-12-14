# TD Garden Sound System - Usage Guide

## Overview
The sound system now includes 30+ sound effects for an immersive Boston Celtics game experience.

## File Location
`/var/www/html/bostonceltics.com/src/hooks/useSound.js`

---

## Quick Start

```javascript
import { useSound } from '@/hooks/useSound'

function GameComponent() {
  const sound = useSound()

  // Start ambient crowd noise
  useEffect(() => {
    sound.startAmbient()
    return () => sound.stopAmbient()
  }, [])

  // Play a 3-pointer with eruption
  sound.playCelticsScore(true)
}
```

---

## Sound Categories

### Core Controls
```javascript
sound.play('soundName')      // Play any sound by key
sound.stop('soundName')      // Stop a sound
sound.startAmbient()         // Start crowd ambient loop
sound.stopAmbient()          // Stop ambient
sound.toggleMute()           // Toggle all sounds
sound.setVolume(0.8)         // Set master volume (0-1)
```

### Game Actions (Original)
```javascript
sound.playCelticsScore()       // Regular basket + cheer
sound.playCelticsScore(true)   // 3-pointer + eruption!
sound.playCelticsMiss()        // Miss + groan
sound.playLakersScore()        // Opponent scores + boo
sound.playLakersMiss()         // Opponent miss + cheer
sound.playBlock()              // Block swat + eruption
sound.playSteal()              // Steal grab + cheer
sound.playBuzzer()             // Game buzzer
```

### Enhanced Game Actions (NEW)
```javascript
sound.playDunk()               // Slam dunk + eruption
sound.playDribble()            // Ball bounce (subtle)
sound.playShoeSqueak()         // Court squeak (subtle)
sound.playBackboardHit()       // Glass impact
sound.playRimBounce()          // Ball bouncing on rim
```

### TD Garden Chants (NEW)
```javascript
sound.playBeatLAChant()        // "BEAT LA!" chant
sound.playDefenseChant()       // "DEF-ENSE!" crowd
sound.playLetsGoCelticsChant() // "Let's Go Celtics!"
```

### Crowd Reactions (NEW)
```javascript
sound.playCrowdEruption()      // Extended roar (5 sec)
sound.playCrowdGroan()         // Disappointed "awww"
sound.playCrowdOhhhh()         // Building anticipation
```

### Game Events (NEW)
```javascript
sound.playShotClockWarning()   // 5-second beep
sound.playQuarterBuzzer()      // End of quarter
sound.playFoulWhistle()        // Double whistle
sound.playVictory()            // Win fanfare + eruption
sound.playDefeat()             // Loss horn + boo
```

### Quiz/UI Sounds (NEW)
```javascript
sound.playQuizResult(true)     // Correct + cheer
sound.playQuizResult(false)    // Wrong + groan
sound.playTimerTick()          // Clock tick
sound.playTimerWarning()       // 3 seconds left!
sound.playButtonHover()        // UI hover (subtle)
sound.playQTESuccess()         // Quick time event success
sound.playQTEFail()            // Quick time event fail
sound.playTick()               // Generic tick
sound.playSelect()             // Selection sound
```

---

## Volume Layering

All sounds have pre-configured volumes for optimal mixing:

| Type | Volume | Purpose |
|------|--------|---------|
| Ambient | 0.2 | Background crowd noise |
| Chants | 0.6 | TD Garden atmosphere |
| Game Events | 0.8 | Clear feedback |
| Dunk/Victory | 0.9 | Climactic moments |
| UI Sounds | 0.3-0.5 | Subtle interaction |

---

## Usage Examples

### Game Simulation
```javascript
// Celtics possession
sound.playDribble()
sound.playShoeSqueak()

// Shot goes up
sound.playCrowdOhhhh()

// 3-pointer scores!
sound.playCelticsScore(true)  // swish3 + eruption

// Lakers possession
sound.playDefenseChant()

// Block!
sound.playBlock()  // blockSwat + eruption
```

### Quiz Component
```javascript
function QuizQuestion({ onAnswer }) {
  const sound = useSound()

  const handleAnswer = (correct) => {
    sound.playQuizResult(correct)
    onAnswer(correct)
  }

  // Timer countdown
  useEffect(() => {
    const interval = setInterval(() => {
      if (timeLeft <= 3) {
        sound.playTimerWarning()
      } else {
        sound.playTimerTick()
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [timeLeft])
}
```

### Interactive Buttons
```javascript
<button
  onMouseEnter={() => sound.playButtonHover()}
  onClick={() => sound.playSelect()}
>
  Start Game
</button>
```

### Game Finale
```javascript
function GameEnd({ celticsWon }) {
  const sound = useSound()

  useEffect(() => {
    if (celticsWon) {
      sound.playVictory()        // victoryFanfare + eruption
      setTimeout(() => {
        sound.playLetsGoCelticsChant()
      }, 2000)
    } else {
      sound.playDefeat()         // defeatHorn + boo
    }
  }, [celticsWon])
}
```

### Shot Clock Warning
```javascript
useEffect(() => {
  if (shotClock <= 5) {
    sound.playShotClockWarning()
  }
}, [shotClock])
```

---

## Error Handling

All sounds include automatic error handling:
- Failed loads log warnings in development mode
- Failed plays fail silently (won't crash the app)
- Missing sounds are gracefully skipped

---

## Performance Notes

- All sounds are preloaded on mount
- Sounds use Howler.js for efficient playback
- Multiple sounds can play simultaneously
- Ambient sound loops automatically
- Cleanup happens on unmount

---

## Sound Sources

All sounds from Mixkit.co (free license):
- Example IDs: 2587-2592 (chants), 2573-2579 (court), etc.
- Format: MP3 preview files
- License: Free for use

---

## API Summary

Total exported functions: **30+**

**Core:** play, stop, startAmbient, stopAmbient, toggleMute, setVolume
**Game Actions:** 10 functions
**Chants:** 3 functions
**Crowd:** 3 functions
**Events:** 3 functions
**UI/Quiz:** 8 functions

---

## Integration Checklist

- [x] 26+ new sounds added
- [x] Volume layering configured
- [x] Error handling implemented
- [x] Preloading enabled
- [x] Backward compatible with existing code
- [x] TypeScript-friendly (via PropTypes)
- [x] Performance optimized
- [x] Development warnings enabled
