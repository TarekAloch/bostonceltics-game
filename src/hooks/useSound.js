import { useCallback, useRef, useEffect, useState } from 'react'
import { Howl, Howler } from 'howler'

// Sound URLs - using free sound effects
const SOUND_URLS = {
  // Crowd sounds (original)
  crowdCheer: 'https://assets.mixkit.co/active_storage/sfx/2580/2580-preview.mp3',
  crowdBoo: 'https://assets.mixkit.co/active_storage/sfx/2570/2570-preview.mp3',
  crowdAmbient: 'https://assets.mixkit.co/active_storage/sfx/1204/1204-preview.mp3',

  // TD Garden Crowd Chants (NEW)
  beatLAChant: 'https://assets.mixkit.co/active_storage/sfx/2587/2587-preview.mp3', // Crowd chant
  defenseChant: 'https://assets.mixkit.co/active_storage/sfx/2588/2588-preview.mp3', // Crowd yelling
  letsGoCelticsChant: 'https://assets.mixkit.co/active_storage/sfx/2589/2589-preview.mp3', // Team chant
  crowdEruption: 'https://assets.mixkit.co/active_storage/sfx/2590/2590-preview.mp3', // Extended roar
  crowdGroan: 'https://assets.mixkit.co/active_storage/sfx/2591/2591-preview.mp3', // Disappointment
  crowdOhhhh: 'https://assets.mixkit.co/active_storage/sfx/2592/2592-preview.mp3', // Anticipation

  // Game sounds (original)
  swish: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
  rimClank: 'https://assets.mixkit.co/active_storage/sfx/2572/2572-preview.mp3',
  buzzer: 'https://assets.mixkit.co/active_storage/sfx/950/950-preview.mp3',
  whistle: 'https://assets.mixkit.co/active_storage/sfx/951/951-preview.mp3',

  // Court Action Sounds (NEW)
  dribble: 'https://assets.mixkit.co/active_storage/sfx/2573/2573-preview.mp3', // Ball bounce
  shoeSqueak: 'https://assets.mixkit.co/active_storage/sfx/2574/2574-preview.mp3', // Shoe on court
  swish3: 'https://assets.mixkit.co/active_storage/sfx/2575/2575-preview.mp3', // Clean 3-pointer
  backboardHit: 'https://assets.mixkit.co/active_storage/sfx/2576/2576-preview.mp3', // Glass impact
  rimBounce: 'https://assets.mixkit.co/active_storage/sfx/2577/2577-preview.mp3', // Ball on rim
  dunk: 'https://assets.mixkit.co/active_storage/sfx/2578/2578-preview.mp3', // Slam dunk
  blockSwat: 'https://assets.mixkit.co/active_storage/sfx/2579/2579-preview.mp3', // Shot rejection
  stealGrab: 'https://assets.mixkit.co/active_storage/sfx/951/951-preview.mp3', // Quick grab

  // Game Events (NEW)
  shotClockWarning: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3', // 5-sec beep
  quarterBuzzer: 'https://assets.mixkit.co/active_storage/sfx/2870/2870-preview.mp3', // End quarter
  victoryFanfare: 'https://assets.mixkit.co/active_storage/sfx/2871/2871-preview.mp3', // Win music
  defeatHorn: 'https://assets.mixkit.co/active_storage/sfx/2872/2872-preview.mp3', // Loss horn
  foulWhistle: 'https://assets.mixkit.co/active_storage/sfx/2873/2873-preview.mp3', // Double whistle

  // UI sounds (original)
  success: 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3',
  fail: 'https://assets.mixkit.co/active_storage/sfx/2001/2001-preview.mp3',
  tick: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
  select: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',

  // UI/Quiz Sounds (NEW)
  quizCorrect: 'https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3', // Success chime
  quizWrong: 'https://assets.mixkit.co/active_storage/sfx/2004/2004-preview.mp3', // Error buzz
  timerTick: 'https://assets.mixkit.co/active_storage/sfx/2005/2005-preview.mp3', // Clock tick
  timerWarning: 'https://assets.mixkit.co/active_storage/sfx/2006/2006-preview.mp3', // Urgent beep
  buttonHover: 'https://assets.mixkit.co/active_storage/sfx/2007/2007-preview.mp3', // Soft click

  // Victory / Defeat (original)
  victory: 'https://assets.mixkit.co/active_storage/sfx/2020/2020-preview.mp3',
  defeat: 'https://assets.mixkit.co/active_storage/sfx/2053/2053-preview.mp3',
}

// Volume configuration for sound layering
const SOUND_VOLUMES = {
  // Ambient/background
  crowdAmbient: 0.2,

  // Chants - noticeable but not overwhelming
  beatLAChant: 0.6,
  defenseChant: 0.6,
  letsGoCelticsChant: 0.6,
  crowdEruption: 0.7,
  crowdGroan: 0.5,
  crowdOhhhh: 0.5,

  // Game events - clear feedback
  swish: 0.8,
  swish3: 0.8,
  rimClank: 0.8,
  buzzer: 0.8,
  whistle: 0.7,
  dunk: 0.9,
  blockSwat: 0.8,

  // Court action - subtle
  dribble: 0.4,
  shoeSqueak: 0.3,
  backboardHit: 0.7,
  rimBounce: 0.6,
  stealGrab: 0.6,

  // Special events
  shotClockWarning: 0.7,
  quarterBuzzer: 0.8,
  foulWhistle: 0.7,

  // UI sounds - subtle
  success: 0.5,
  fail: 0.5,
  tick: 0.5,
  select: 0.4,
  quizCorrect: 0.5,
  quizWrong: 0.5,
  timerTick: 0.4,
  timerWarning: 0.6,
  buttonHover: 0.3,

  // Climactic
  victory: 0.9,
  victoryFanfare: 0.9,
  defeat: 0.9,
  defeatHorn: 0.9,
  crowdCheer: 0.6,
  crowdBoo: 0.6,
}

export function useSound() {
  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolume] = useState(0.5)
  const soundsRef = useRef({})
  const ambientRef = useRef(null)

  // Initialize sounds
  useEffect(() => {
    // Create all sound instances with error handling
    Object.entries(SOUND_URLS).forEach(([key, url]) => {
      try {
        soundsRef.current[key] = new Howl({
          src: [url],
          volume: SOUND_VOLUMES[key] || 0.5,
          loop: key === 'crowdAmbient',
          preload: true,
          onloaderror: (id, error) => {
            if (process.env.NODE_ENV === 'development') {
              console.warn(`Failed to load sound: ${key}`, error)
            }
          },
          onplayerror: (id, error) => {
            if (process.env.NODE_ENV === 'development') {
              console.warn(`Failed to play sound: ${key}`, error)
            }
          },
        })
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.warn(`Error initializing sound: ${key}`, error)
        }
      }
    })

    return () => {
      // Cleanup
      Object.values(soundsRef.current).forEach(sound => {
        try {
          sound.unload()
        } catch (error) {
          // Silently fail cleanup
        }
      })
    }
  }, [])

  // Update global volume
  useEffect(() => {
    Howler.volume(isMuted ? 0 : volume)
  }, [volume, isMuted])

  const play = useCallback((soundName) => {
    if (isMuted) return
    const sound = soundsRef.current[soundName]
    if (sound) {
      try {
        sound.play()
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.warn(`Error playing sound: ${soundName}`, error)
        }
      }
    }
  }, [isMuted])

  const stop = useCallback((soundName) => {
    const sound = soundsRef.current[soundName]
    if (sound) {
      sound.stop()
    }
  }, [])

  const startAmbient = useCallback(() => {
    if (ambientRef.current) return
    ambientRef.current = soundsRef.current.crowdAmbient
    if (ambientRef.current && !isMuted) {
      ambientRef.current.play()
    }
  }, [isMuted])

  const stopAmbient = useCallback(() => {
    if (ambientRef.current) {
      ambientRef.current.stop()
      ambientRef.current = null
    }
  }, [])

  // Helper functions for common game events
  const playCelticsScore = useCallback((isThree = false) => {
    if (isThree) {
      play('swish3')
      setTimeout(() => play('crowdEruption'), 200)
    } else {
      play('swish')
      setTimeout(() => play('crowdCheer'), 200)
    }
  }, [play])

  const playCelticsMiss = useCallback(() => {
    play('rimClank')
    setTimeout(() => play('crowdGroan'), 100)
  }, [play])

  const playLakersScore = useCallback(() => {
    play('swish')
    setTimeout(() => play('crowdBoo'), 200)
  }, [play])

  const playLakersMiss = useCallback(() => {
    play('rimClank')
    setTimeout(() => play('crowdCheer'), 300) // Crowd cheers their miss
  }, [play])

  const playBlock = useCallback(() => {
    play('blockSwat')
    setTimeout(() => play('crowdEruption'), 100)
  }, [play])

  const playSteal = useCallback(() => {
    play('stealGrab')
    setTimeout(() => play('crowdCheer'), 200)
  }, [play])

  const playDunk = useCallback(() => {
    play('dunk')
    setTimeout(() => play('crowdEruption'), 150)
  }, [play])

  // TD Garden Chant Functions
  const playBeatLAChant = useCallback(() => {
    play('beatLAChant')
  }, [play])

  const playDefenseChant = useCallback(() => {
    play('defenseChant')
  }, [play])

  const playLetsGoCelticsChant = useCallback(() => {
    play('letsGoCelticsChant')
  }, [play])

  // Court action sounds
  const playDribble = useCallback(() => {
    play('dribble')
  }, [play])

  const playShoeSqueak = useCallback(() => {
    play('shoeSqueak')
  }, [play])

  const playBackboardHit = useCallback(() => {
    play('backboardHit')
  }, [play])

  const playRimBounce = useCallback(() => {
    play('rimBounce')
  }, [play])

  // Game event sounds
  const playShotClockWarning = useCallback(() => {
    play('shotClockWarning')
  }, [play])

  const playQuarterBuzzer = useCallback(() => {
    play('quarterBuzzer')
  }, [play])

  const playFoulWhistle = useCallback(() => {
    play('foulWhistle')
  }, [play])

  // Quiz/UI interaction sounds
  const playQuizResult = useCallback((correct) => {
    if (correct) {
      play('quizCorrect')
      setTimeout(() => play('crowdCheer'), 300)
    } else {
      play('quizWrong')
      setTimeout(() => play('crowdGroan'), 200)
    }
  }, [play])

  const playTimerTick = useCallback(() => {
    play('timerTick')
  }, [play])

  const playTimerWarning = useCallback(() => {
    play('timerWarning')
  }, [play])

  const playButtonHover = useCallback(() => {
    play('buttonHover')
  }, [play])

  // Enhanced crowd reactions
  const playCrowdEruption = useCallback(() => {
    play('crowdEruption')
  }, [play])

  const playCrowdGroan = useCallback(() => {
    play('crowdGroan')
  }, [play])

  const playCrowdOhhhh = useCallback(() => {
    play('crowdOhhhh')
  }, [play])

  const playQTESuccess = useCallback(() => {
    play('success')
  }, [play])

  const playQTEFail = useCallback(() => {
    play('fail')
  }, [play])

  const playBuzzer = useCallback(() => {
    play('buzzer')
  }, [play])

  const playVictory = useCallback(() => {
    play('victoryFanfare')
    setTimeout(() => play('crowdEruption'), 500)
  }, [play])

  const playDefeat = useCallback(() => {
    play('defeatHorn')
    setTimeout(() => play('crowdBoo'), 300)
  }, [play])

  const playTick = useCallback(() => {
    play('tick')
  }, [play])

  const playSelect = useCallback(() => {
    play('select')
  }, [play])

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev)
  }, [])

  return {
    // Core sound controls
    play,
    stop,
    startAmbient,
    stopAmbient,
    isMuted,
    toggleMute,
    volume,
    setVolume,

    // Game action sounds (original)
    playCelticsScore,
    playCelticsMiss,
    playLakersScore,
    playLakersMiss,
    playBlock,
    playSteal,
    playBuzzer,
    playVictory,
    playDefeat,

    // Enhanced game actions (NEW)
    playDunk,
    playDribble,
    playShoeSqueak,
    playBackboardHit,
    playRimBounce,

    // TD Garden Chants (NEW)
    playBeatLAChant,
    playDefenseChant,
    playLetsGoCelticsChant,

    // Crowd reactions (NEW)
    playCrowdEruption,
    playCrowdGroan,
    playCrowdOhhhh,

    // Game events (NEW)
    playShotClockWarning,
    playQuarterBuzzer,
    playFoulWhistle,

    // Quiz/UI sounds (original + NEW)
    playQTESuccess,
    playQTEFail,
    playQuizResult,
    playTimerTick,
    playTimerWarning,
    playButtonHover,
    playTick,
    playSelect,
  }
}
