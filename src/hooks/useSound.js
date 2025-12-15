import { useCallback, useRef, useState, useEffect } from 'react'

/**
 * Web Audio API Sound System
 * All sounds are synthesized - no external URLs needed
 */

// Shared AudioContext
let audioContext = null

function getAudioContext() {
  if (!audioContext || audioContext.state === 'closed') {
    audioContext = new (window.AudioContext || window.webkitAudioContext)()
  }
  // Resume if suspended (browser autoplay policy)
  if (audioContext.state === 'suspended') {
    audioContext.resume()
  }
  return audioContext
}

// Core synthesis functions
function playTone(frequencies, duration = 0.3, type = 'sine', volume = 0.3) {
  const ctx = getAudioContext()
  const now = ctx.currentTime
  const freqs = Array.isArray(frequencies) ? frequencies : [frequencies]
  
  freqs.forEach((freq, i) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    
    osc.type = type
    osc.frequency.value = freq
    
    gain.gain.setValueAtTime(volume / freqs.length, now + i * 0.05)
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration + i * 0.05)
    
    osc.connect(gain)
    gain.connect(ctx.destination)
    
    osc.start(now + i * 0.05)
    osc.stop(now + duration + i * 0.05 + 0.1)
  })
}

function playNoise(duration = 0.2, filterType = 'lowpass', frequency = 1000, volume = 0.2) {
  const ctx = getAudioContext()
  const now = ctx.currentTime
  
  // Create noise buffer
  const bufferSize = ctx.sampleRate * duration
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1
  }
  
  const source = ctx.createBufferSource()
  source.buffer = buffer
  
  const filter = ctx.createBiquadFilter()
  filter.type = filterType
  filter.frequency.value = frequency
  
  const gain = ctx.createGain()
  gain.gain.setValueAtTime(volume, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration)
  
  source.connect(filter)
  filter.connect(gain)
  gain.connect(ctx.destination)
  
  source.start(now)
  source.stop(now + duration + 0.1)
}

function playChirp(startFreq, endFreq, duration = 0.15, volume = 0.3) {
  const ctx = getAudioContext()
  const now = ctx.currentTime
  
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  
  osc.type = 'sine'
  osc.frequency.setValueAtTime(startFreq, now)
  osc.frequency.exponentialRampToValueAtTime(endFreq, now + duration)
  
  gain.gain.setValueAtTime(volume, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration)
  
  osc.connect(gain)
  gain.connect(ctx.destination)
  
  osc.start(now)
  osc.stop(now + duration + 0.1)
}

// Sound definitions using synthesis
const sounds = {
  // CROWD SOUNDS
  crowdCheer: () => {
    playNoise(1.5, 'bandpass', 2000, 0.15)
    setTimeout(() => playNoise(0.8, 'bandpass', 1500, 0.1), 200)
  },
  crowdBoo: () => {
    playNoise(1.2, 'lowpass', 500, 0.15)
  },
  crowdAmbient: () => {
    playNoise(3, 'bandpass', 1000, 0.05)
  },
  crowdEruption: () => {
    playNoise(2, 'bandpass', 2500, 0.2)
    setTimeout(() => playNoise(1.5, 'bandpass', 2000, 0.15), 300)
    setTimeout(() => playNoise(1, 'bandpass', 1500, 0.1), 600)
  },
  crowdGroan: () => {
    playNoise(0.8, 'lowpass', 400, 0.12)
  },
  crowdOhhhh: () => {
    playTone([200, 250], 0.8, 'sine', 0.1)
    playNoise(0.6, 'bandpass', 800, 0.08)
  },
  
  // TD GARDEN CHANTS
  beatLAChant: () => {
    [0, 300, 600].forEach((delay, i) => {
      setTimeout(() => playNoise(0.15, 'bandpass', 1200 + i * 200, 0.12), delay)
    })
  },
  defenseChant: () => {
    setTimeout(() => playNoise(0.2, 'bandpass', 1500, 0.15), 0)
    setTimeout(() => playNoise(0.3, 'bandpass', 1800, 0.15), 250)
  },
  letsGoCelticsChant: () => {
    [0, 150, 300, 500, 650].forEach((delay) => {
      setTimeout(() => playNoise(0.12, 'bandpass', 1400, 0.1), delay)
    })
  },
  
  // GAME SOUNDS - BASKETBALL
  swish: () => {
    playNoise(0.25, 'highpass', 3000, 0.25)
    playChirp(4000, 2000, 0.15, 0.15)
  },
  swish3: () => {
    playNoise(0.3, 'highpass', 3500, 0.3)
    playChirp(5000, 2000, 0.2, 0.2)
    setTimeout(() => playTone(880, 0.1, 'sine', 0.1), 150)
  },
  rimClank: () => {
    playTone([800, 1200, 1600], 0.15, 'square', 0.2)
    playNoise(0.1, 'highpass', 2000, 0.15)
  },
  rimBounce: () => {
    playTone([700, 1000], 0.1, 'square', 0.15)
    setTimeout(() => playTone([650, 950], 0.08, 'square', 0.1), 100)
  },
  backboardHit: () => {
    playTone([400, 600], 0.12, 'square', 0.2)
    playNoise(0.08, 'lowpass', 1500, 0.15)
  },
  dunk: () => {
    playTone([150, 200], 0.2, 'square', 0.3)
    playNoise(0.15, 'lowpass', 800, 0.25)
    setTimeout(() => playNoise(0.2, 'highpass', 3000, 0.2), 100)
  },
  dribble: () => {
    playTone(150, 0.08, 'sine', 0.2)
    playNoise(0.05, 'lowpass', 500, 0.15)
  },
  shoeSqueak: () => {
    playChirp(2000, 3500, 0.1, 0.1)
  },
  blockSwat: () => {
    playNoise(0.15, 'highpass', 1500, 0.25)
    playTone([300, 400], 0.1, 'square', 0.2)
  },
  stealGrab: () => {
    playNoise(0.1, 'highpass', 2000, 0.2)
    playTone(500, 0.05, 'sine', 0.15)
  },
  
  // WHISTLES & BUZZERS
  buzzer: () => {
    playTone(200, 0.6, 'square', 0.25)
  },
  whistle: () => {
    playTone([2800, 3200], 0.4, 'sine', 0.2)
  },
  foulWhistle: () => {
    playTone([2800, 3200], 0.25, 'sine', 0.2)
    setTimeout(() => playTone([2800, 3200], 0.25, 'sine', 0.2), 300)
  },
  quarterBuzzer: () => {
    playTone(180, 0.8, 'square', 0.3)
  },
  shotClockWarning: () => {
    playTone(1000, 0.1, 'square', 0.25)
    setTimeout(() => playTone(1000, 0.1, 'square', 0.25), 200)
    setTimeout(() => playTone(1000, 0.1, 'square', 0.25), 400)
  },
  
  // UI / QUIZ SOUNDS
  success: () => {
    playTone([523, 659, 784], 0.3, 'sine', 0.2)
  },
  quizCorrect: () => {
    playTone(523, 0.1, 'sine', 0.2)
    setTimeout(() => playTone(659, 0.1, 'sine', 0.2), 100)
    setTimeout(() => playTone(784, 0.2, 'sine', 0.25), 200)
  },
  fail: () => {
    playTone([200, 150], 0.4, 'square', 0.15)
  },
  quizWrong: () => {
    playTone(200, 0.15, 'square', 0.2)
    setTimeout(() => playTone(150, 0.25, 'square', 0.15), 150)
  },
  tick: () => {
    playTone(800, 0.03, 'sine', 0.15)
  },
  timerTick: () => {
    playTone(1000, 0.02, 'sine', 0.1)
  },
  timerWarning: () => {
    playTone(1200, 0.08, 'square', 0.2)
  },
  select: () => {
    playChirp(400, 600, 0.08, 0.15)
  },
  buttonHover: () => {
    playTone(600, 0.02, 'sine', 0.08)
  },
  
  // VICTORY / DEFEAT
  victory: () => {
    const notes = [523, 659, 784, 1047]
    notes.forEach((freq, i) => {
      setTimeout(() => playTone(freq, 0.3, 'sine', 0.2), i * 150)
    })
    setTimeout(() => {
      playTone([523, 659, 784, 1047], 0.6, 'sine', 0.25)
    }, 600)
  },
  victoryFanfare: () => {
    sounds.victory()
    setTimeout(() => sounds.crowdEruption(), 400)
  },
  defeat: () => {
    playTone([300, 280, 260], 0.8, 'square', 0.15)
  },
  defeatHorn: () => {
    playTone(150, 1, 'sawtooth', 0.2)
  },
}

export function useSound() {
  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolume] = useState(0.5)
  const ambientIntervalRef = useRef(null)

  useEffect(() => {
    return () => {
      if (ambientIntervalRef.current) {
        clearInterval(ambientIntervalRef.current)
      }
    }
  }, [])

  const play = useCallback((soundName) => {
    if (isMuted) return
    const soundFn = sounds[soundName]
    if (soundFn) {
      try {
        soundFn()
      } catch (error) {
        console.warn(`Error playing sound: ${soundName}`, error)
      }
    }
  }, [isMuted])

  const stop = useCallback(() => {}, [])

  const startAmbient = useCallback(() => {
    if (ambientIntervalRef.current || isMuted) return
    sounds.crowdAmbient()
    ambientIntervalRef.current = setInterval(() => {
      if (!isMuted) sounds.crowdAmbient()
    }, 4000)
  }, [isMuted])

  const stopAmbient = useCallback(() => {
    if (ambientIntervalRef.current) {
      clearInterval(ambientIntervalRef.current)
      ambientIntervalRef.current = null
    }
  }, [])

  const playCelticsScore = useCallback((isThree = false) => {
    if (isMuted) return
    if (isThree) {
      sounds.swish3()
      setTimeout(() => sounds.crowdEruption(), 200)
    } else {
      sounds.swish()
      setTimeout(() => sounds.crowdCheer(), 200)
    }
  }, [isMuted])

  const playCelticsMiss = useCallback(() => {
    if (isMuted) return
    sounds.rimClank()
    setTimeout(() => sounds.crowdGroan(), 100)
  }, [isMuted])

  const playLakersScore = useCallback(() => {
    if (isMuted) return
    sounds.swish()
    setTimeout(() => sounds.crowdBoo(), 200)
  }, [isMuted])

  const playLakersMiss = useCallback(() => {
    if (isMuted) return
    sounds.rimClank()
    setTimeout(() => sounds.crowdCheer(), 300)
  }, [isMuted])

  const playBlock = useCallback(() => {
    if (isMuted) return
    sounds.blockSwat()
    setTimeout(() => sounds.crowdEruption(), 100)
  }, [isMuted])

  const playSteal = useCallback(() => {
    if (isMuted) return
    sounds.stealGrab()
    setTimeout(() => sounds.crowdCheer(), 200)
  }, [isMuted])

  const playDunk = useCallback(() => {
    if (isMuted) return
    sounds.dunk()
    setTimeout(() => sounds.crowdEruption(), 150)
  }, [isMuted])

  const playQuizResult = useCallback((correct) => {
    if (isMuted) return
    if (correct) {
      sounds.quizCorrect()
      setTimeout(() => sounds.crowdCheer(), 300)
    } else {
      sounds.quizWrong()
      setTimeout(() => sounds.crowdGroan(), 200)
    }
  }, [isMuted])

  const playVictory = useCallback(() => {
    if (isMuted) return
    sounds.victoryFanfare()
  }, [isMuted])

  const playDefeat = useCallback(() => {
    if (isMuted) return
    sounds.defeatHorn()
    setTimeout(() => sounds.crowdBoo(), 300)
  }, [isMuted])

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev)
  }, [])

  return {
    play,
    stop,
    startAmbient,
    stopAmbient,
    isMuted,
    toggleMute,
    volume,
    setVolume,
    playCelticsScore,
    playCelticsMiss,
    playLakersScore,
    playLakersMiss,
    playBlock,
    playSteal,
    playDunk,
    playQuizResult,
    playVictory,
    playDefeat,
    playBuzzer: useCallback(() => !isMuted && sounds.buzzer(), [isMuted]),
    playTick: useCallback(() => !isMuted && sounds.tick(), [isMuted]),
    playSelect: useCallback(() => !isMuted && sounds.select(), [isMuted]),
    playQTESuccess: useCallback(() => !isMuted && sounds.success(), [isMuted]),
    playQTEFail: useCallback(() => !isMuted && sounds.fail(), [isMuted]),
    playDribble: useCallback(() => !isMuted && sounds.dribble(), [isMuted]),
    playShoeSqueak: useCallback(() => !isMuted && sounds.shoeSqueak(), [isMuted]),
    playBackboardHit: useCallback(() => !isMuted && sounds.backboardHit(), [isMuted]),
    playRimBounce: useCallback(() => !isMuted && sounds.rimBounce(), [isMuted]),
    playBeatLAChant: useCallback(() => !isMuted && sounds.beatLAChant(), [isMuted]),
    playDefenseChant: useCallback(() => !isMuted && sounds.defenseChant(), [isMuted]),
    playLetsGoCelticsChant: useCallback(() => !isMuted && sounds.letsGoCelticsChant(), [isMuted]),
    playCrowdEruption: useCallback(() => !isMuted && sounds.crowdEruption(), [isMuted]),
    playCrowdGroan: useCallback(() => !isMuted && sounds.crowdGroan(), [isMuted]),
    playCrowdOhhhh: useCallback(() => !isMuted && sounds.crowdOhhhh(), [isMuted]),
    playShotClockWarning: useCallback(() => !isMuted && sounds.shotClockWarning(), [isMuted]),
    playQuarterBuzzer: useCallback(() => !isMuted && sounds.quarterBuzzer(), [isMuted]),
    playFoulWhistle: useCallback(() => !isMuted && sounds.foulWhistle(), [isMuted]),
    playTimerTick: useCallback(() => !isMuted && sounds.timerTick(), [isMuted]),
    playTimerWarning: useCallback(() => !isMuted && sounds.timerWarning(), [isMuted]),
    playButtonHover: useCallback(() => !isMuted && sounds.buttonHover(), [isMuted]),
  }
}
