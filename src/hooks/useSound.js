import { useCallback, useRef, useState, useEffect } from 'react'

/**
 * Enhanced Web Audio API Sound System
 * Full arena music, beats, and high-quality synthesized sounds
 */

// Shared AudioContext
let audioContext = null
let masterGain = null

function getAudioContext() {
  if (!audioContext || audioContext.state === 'closed') {
    audioContext = new (window.AudioContext || window.webkitAudioContext)()
    masterGain = audioContext.createGain()
    masterGain.connect(audioContext.destination)
    masterGain.gain.value = 0.6
  }
  if (audioContext.state === 'suspended') {
    audioContext.resume()
  }
  return audioContext
}

function getMasterGain() {
  getAudioContext()
  return masterGain
}

// Note frequencies for music
const NOTES = {
  C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.00, A3: 220.00, B3: 246.94,
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.00, B5: 987.77,
  C6: 1046.50
}

// Drum kit synthesis
function kick(time = 0, volume = 0.8) {
  const ctx = getAudioContext()
  const now = ctx.currentTime + time

  const osc = ctx.createOscillator()
  const gain = ctx.createGain()

  osc.type = 'sine'
  osc.frequency.setValueAtTime(150, now)
  osc.frequency.exponentialRampToValueAtTime(40, now + 0.1)

  gain.gain.setValueAtTime(volume, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3)

  osc.connect(gain)
  gain.connect(getMasterGain())

  osc.start(now)
  osc.stop(now + 0.3)
}

function snare(time = 0, volume = 0.6) {
  const ctx = getAudioContext()
  const now = ctx.currentTime + time

  // Noise for snare body
  const bufferSize = ctx.sampleRate * 0.15
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1
  }

  const noise = ctx.createBufferSource()
  noise.buffer = buffer

  const noiseFilter = ctx.createBiquadFilter()
  noiseFilter.type = 'highpass'
  noiseFilter.frequency.value = 1000

  const noiseGain = ctx.createGain()
  noiseGain.gain.setValueAtTime(volume, now)
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15)

  noise.connect(noiseFilter)
  noiseFilter.connect(noiseGain)
  noiseGain.connect(getMasterGain())

  // Tone for snare punch
  const osc = ctx.createOscillator()
  const oscGain = ctx.createGain()
  osc.type = 'triangle'
  osc.frequency.setValueAtTime(180, now)
  osc.frequency.exponentialRampToValueAtTime(100, now + 0.05)
  oscGain.gain.setValueAtTime(volume * 0.5, now)
  oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1)

  osc.connect(oscGain)
  oscGain.connect(getMasterGain())

  noise.start(now)
  noise.stop(now + 0.15)
  osc.start(now)
  osc.stop(now + 0.1)
}

function hihat(time = 0, open = false, volume = 0.3) {
  const ctx = getAudioContext()
  const now = ctx.currentTime + time
  const duration = open ? 0.3 : 0.08

  const bufferSize = ctx.sampleRate * duration
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1
  }

  const noise = ctx.createBufferSource()
  noise.buffer = buffer

  const filter = ctx.createBiquadFilter()
  filter.type = 'highpass'
  filter.frequency.value = 7000

  const gain = ctx.createGain()
  gain.gain.setValueAtTime(volume, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration)

  noise.connect(filter)
  filter.connect(gain)
  gain.connect(getMasterGain())

  noise.start(now)
  noise.stop(now + duration + 0.01)
}

function clap(time = 0, volume = 0.5) {
  const ctx = getAudioContext()
  const now = ctx.currentTime + time

  // Multiple short bursts for clap texture
  for (let i = 0; i < 3; i++) {
    const bufferSize = ctx.sampleRate * 0.02
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let j = 0; j < bufferSize; j++) {
      data[j] = Math.random() * 2 - 1
    }

    const noise = ctx.createBufferSource()
    noise.buffer = buffer

    const filter = ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.value = 2500

    const gain = ctx.createGain()
    const startTime = now + i * 0.01
    gain.gain.setValueAtTime(volume * (1 - i * 0.2), startTime)
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.1)

    noise.connect(filter)
    filter.connect(gain)
    gain.connect(getMasterGain())

    noise.start(startTime)
    noise.stop(startTime + 0.1)
  }
}

// Synth bass
function bass(note, time = 0, duration = 0.2, volume = 0.5) {
  const ctx = getAudioContext()
  const now = ctx.currentTime + time
  const freq = NOTES[note] || note

  const osc = ctx.createOscillator()
  const osc2 = ctx.createOscillator()
  const gain = ctx.createGain()
  const filter = ctx.createBiquadFilter()

  osc.type = 'sawtooth'
  osc.frequency.value = freq / 2

  osc2.type = 'square'
  osc2.frequency.value = freq / 2

  filter.type = 'lowpass'
  filter.frequency.setValueAtTime(1000, now)
  filter.frequency.exponentialRampToValueAtTime(200, now + duration)

  gain.gain.setValueAtTime(volume, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration)

  osc.connect(filter)
  osc2.connect(filter)
  filter.connect(gain)
  gain.connect(getMasterGain())

  osc.start(now)
  osc2.start(now)
  osc.stop(now + duration + 0.1)
  osc2.stop(now + duration + 0.1)
}

// Synth lead/stab
function synth(note, time = 0, duration = 0.15, volume = 0.35) {
  const ctx = getAudioContext()
  const now = ctx.currentTime + time
  const freq = NOTES[note] || note

  const osc = ctx.createOscillator()
  const osc2 = ctx.createOscillator()
  const gain = ctx.createGain()

  osc.type = 'square'
  osc.frequency.value = freq

  osc2.type = 'sawtooth'
  osc2.frequency.value = freq * 1.005 // slight detune for thickness

  gain.gain.setValueAtTime(volume, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration)

  osc.connect(gain)
  osc2.connect(gain)
  gain.connect(getMasterGain())

  osc.start(now)
  osc2.start(now)
  osc.stop(now + duration + 0.1)
  osc2.stop(now + duration + 0.1)
}

// Arena organ stab
function organ(notes, time = 0, duration = 0.3, volume = 0.3) {
  const ctx = getAudioContext()
  const now = ctx.currentTime + time
  const noteArray = Array.isArray(notes) ? notes : [notes]

  noteArray.forEach(note => {
    const freq = NOTES[note] || note

    const osc = ctx.createOscillator()
    const osc2 = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.value = freq

    osc2.type = 'sine'
    osc2.frequency.value = freq * 2 // octave up

    gain.gain.setValueAtTime(volume / noteArray.length, now)
    gain.gain.setValueAtTime(volume / noteArray.length, now + duration * 0.8)
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration)

    osc.connect(gain)
    osc2.connect(gain)
    gain.connect(getMasterGain())

    osc.start(now)
    osc2.start(now)
    osc.stop(now + duration + 0.1)
    osc2.stop(now + duration + 0.1)
  })
}

// Music loop controllers
let musicInterval = null
let beatCount = 0

// Stadium pump-up beat (Think "Seven Nation Army" style)
function playPumpUpBeat() {
  const ctx = getAudioContext()
  if (!ctx) return

  const beat = beatCount % 8

  // Kick on 1, 3, 5, 7
  if (beat % 2 === 0) {
    kick(0, 0.7)
  }

  // Snare on 3 and 7
  if (beat === 2 || beat === 6) {
    snare(0, 0.5)
  }

  // Hi-hats
  hihat(0, false, 0.2)

  // Clap on 4 and 8
  if (beat === 3 || beat === 7) {
    clap(0, 0.4)
  }

  // Bass line (simple but catchy)
  const bassNotes = ['E3', 'E3', 'G3', 'E3', 'D3', 'D3', 'C3', 'B3']
  bass(bassNotes[beat], 0, 0.18, 0.4)

  beatCount++
}

// Defense chant beat
function playDefenseBeat() {
  const ctx = getAudioContext()
  if (!ctx) return

  const beat = beatCount % 4

  // Stomp stomp - clap pattern
  if (beat === 0 || beat === 1) {
    kick(0, 0.9)
  } else if (beat === 2) {
    clap(0, 0.7)
  }

  // "DE-FENSE" synth stabs
  if (beat === 0) {
    organ(['G4', 'D4'], 0, 0.15, 0.4)
  } else if (beat === 2) {
    organ(['A4', 'E4'], 0, 0.2, 0.4)
  }

  beatCount++
}

// Victory celebration beat
function playVictoryBeat() {
  const ctx = getAudioContext()
  if (!ctx) return

  const beat = beatCount % 8

  kick(0, 0.6)
  hihat(0, beat % 2 === 1, 0.25)

  if (beat === 2 || beat === 6) {
    snare(0, 0.5)
    clap(0, 0.4)
  }

  // Triumphant chord progression
  const chords = [
    ['C4', 'E4', 'G4'],
    ['C4', 'E4', 'G4'],
    ['F4', 'A4', 'C5'],
    ['F4', 'A4', 'C5'],
    ['G4', 'B4', 'D5'],
    ['G4', 'B4', 'D5'],
    ['C4', 'E4', 'G4'],
    ['C4', 'E4', 'G4'],
  ]

  if (beat % 2 === 0) {
    organ(chords[beat], 0, 0.25, 0.35)
  }

  beatCount++
}

// Sound effects
const sounds = {
  // CROWD SOUNDS - Enhanced
  crowdCheer: () => {
    const ctx = getAudioContext()
    const now = ctx.currentTime

    // Layered crowd noise
    for (let i = 0; i < 3; i++) {
      const bufferSize = ctx.sampleRate * (1 + i * 0.5)
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
      const data = buffer.getChannelData(0)
      for (let j = 0; j < bufferSize; j++) {
        data[j] = Math.random() * 2 - 1
      }

      const noise = ctx.createBufferSource()
      noise.buffer = buffer

      const filter = ctx.createBiquadFilter()
      filter.type = 'bandpass'
      filter.frequency.value = 1500 + i * 500
      filter.Q.value = 0.5

      const gain = ctx.createGain()
      gain.gain.setValueAtTime(0, now)
      gain.gain.linearRampToValueAtTime(0.15 - i * 0.03, now + 0.1)
      gain.gain.setValueAtTime(0.15 - i * 0.03, now + 0.8)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5 + i * 0.3)

      noise.connect(filter)
      filter.connect(gain)
      gain.connect(getMasterGain())

      noise.start(now + i * 0.05)
      noise.stop(now + 2 + i * 0.3)
    }
  },

  crowdRoar: () => {
    const ctx = getAudioContext()
    const now = ctx.currentTime

    // Big explosive crowd roar
    for (let i = 0; i < 5; i++) {
      const bufferSize = ctx.sampleRate * 2
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
      const data = buffer.getChannelData(0)
      for (let j = 0; j < bufferSize; j++) {
        data[j] = Math.random() * 2 - 1
      }

      const noise = ctx.createBufferSource()
      noise.buffer = buffer

      const filter = ctx.createBiquadFilter()
      filter.type = 'bandpass'
      filter.frequency.value = 1000 + i * 400
      filter.Q.value = 0.3

      const gain = ctx.createGain()
      gain.gain.setValueAtTime(0.001, now)
      gain.gain.exponentialRampToValueAtTime(0.2 - i * 0.02, now + 0.05)
      gain.gain.setValueAtTime(0.2 - i * 0.02, now + 1)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 2)

      noise.connect(filter)
      filter.connect(gain)
      gain.connect(getMasterGain())

      noise.start(now)
      noise.stop(now + 2.1)
    }
  },

  crowdBoo: () => {
    const ctx = getAudioContext()
    const now = ctx.currentTime

    // Lower frequency "boo" sound
    const bufferSize = ctx.sampleRate * 1.5
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1
    }

    const noise = ctx.createBufferSource()
    noise.buffer = buffer

    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 600

    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.2, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5)

    noise.connect(filter)
    filter.connect(gain)
    gain.connect(getMasterGain())

    noise.start(now)
    noise.stop(now + 1.6)
  },

  crowdGroan: () => {
    const ctx = getAudioContext()
    const now = ctx.currentTime

    // Disappointed "aww" sound
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(300, now)
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.8)

    gain.gain.setValueAtTime(0.1, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8)

    osc.connect(gain)
    gain.connect(getMasterGain())

    osc.start(now)
    osc.stop(now + 0.9)

    // Add noise texture
    const bufferSize = ctx.sampleRate * 0.8
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1
    }

    const noise = ctx.createBufferSource()
    noise.buffer = buffer

    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 500

    const noiseGain = ctx.createGain()
    noiseGain.gain.setValueAtTime(0.08, now)
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8)

    noise.connect(filter)
    filter.connect(noiseGain)
    noiseGain.connect(getMasterGain())

    noise.start(now)
    noise.stop(now + 0.9)
  },

  // BASKETBALL SOUNDS - Realistic
  swish: () => {
    const ctx = getAudioContext()
    const now = ctx.currentTime

    // Swoosh through net
    const bufferSize = ctx.sampleRate * 0.4
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1
    }

    const noise = ctx.createBufferSource()
    noise.buffer = buffer

    const filter = ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.setValueAtTime(4000, now)
    filter.frequency.exponentialRampToValueAtTime(2000, now + 0.3)
    filter.Q.value = 2

    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.3, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4)

    noise.connect(filter)
    filter.connect(gain)
    gain.connect(getMasterGain())

    noise.start(now)
    noise.stop(now + 0.5)
  },

  swish3: () => {
    sounds.swish()

    // Extra "splash" effect for 3-pointer
    const ctx = getAudioContext()
    const now = ctx.currentTime

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(1200, now + 0.1)
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.3)

    gain.gain.setValueAtTime(0.15, now + 0.1)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3)

    osc.connect(gain)
    gain.connect(getMasterGain())

    osc.start(now + 0.1)
    osc.stop(now + 0.4)
  },

  rimClank: () => {
    const ctx = getAudioContext()
    const now = ctx.currentTime

    // Metallic rim hit
    const frequencies = [800, 1200, 1800, 2400]
    frequencies.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sine'
      osc.frequency.value = freq

      gain.gain.setValueAtTime(0.2 / (i + 1), now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3 - i * 0.05)

      osc.connect(gain)
      gain.connect(getMasterGain())

      osc.start(now)
      osc.stop(now + 0.4)
    })
  },

  dunk: () => {
    const ctx = getAudioContext()
    const now = ctx.currentTime

    // Deep thump
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(100, now)
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.2)

    gain.gain.setValueAtTime(0.6, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3)

    osc.connect(gain)
    gain.connect(getMasterGain())

    osc.start(now)
    osc.stop(now + 0.4)

    // Backboard rattle
    setTimeout(() => {
      const osc2 = ctx.createOscillator()
      const gain2 = ctx.createGain()

      osc2.type = 'square'
      osc2.frequency.value = 180

      gain2.gain.setValueAtTime(0.15, ctx.currentTime)
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15)

      osc2.connect(gain2)
      gain2.connect(getMasterGain())

      osc2.start(ctx.currentTime)
      osc2.stop(ctx.currentTime + 0.2)
    }, 100)
  },

  block: () => {
    const ctx = getAudioContext()
    const now = ctx.currentTime

    // Sharp hit sound
    const bufferSize = ctx.sampleRate * 0.15
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1
    }

    const noise = ctx.createBufferSource()
    noise.buffer = buffer

    const filter = ctx.createBiquadFilter()
    filter.type = 'highpass'
    filter.frequency.value = 2000

    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.4, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15)

    noise.connect(filter)
    filter.connect(gain)
    gain.connect(getMasterGain())

    noise.start(now)
    noise.stop(now + 0.2)

    // Low thump
    kick(0, 0.5)
  },

  steal: () => {
    const ctx = getAudioContext()
    const now = ctx.currentTime

    // Quick swipe sound
    const bufferSize = ctx.sampleRate * 0.1
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1
    }

    const noise = ctx.createBufferSource()
    noise.buffer = buffer

    const filter = ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.setValueAtTime(3000, now)
    filter.frequency.exponentialRampToValueAtTime(1500, now + 0.1)

    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.3, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1)

    noise.connect(filter)
    filter.connect(gain)
    gain.connect(getMasterGain())

    noise.start(now)
    noise.stop(now + 0.15)
  },

  // ARENA SOUNDS
  buzzer: () => {
    const ctx = getAudioContext()
    const now = ctx.currentTime

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sawtooth'
    osc.frequency.value = 220

    gain.gain.setValueAtTime(0.4, now)
    gain.gain.setValueAtTime(0.4, now + 0.8)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1)

    osc.connect(gain)
    gain.connect(getMasterGain())

    osc.start(now)
    osc.stop(now + 1.1)
  },

  whistle: () => {
    const ctx = getAudioContext()
    const now = ctx.currentTime

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.value = 3200

    // Vibrato
    const lfo = ctx.createOscillator()
    const lfoGain = ctx.createGain()
    lfo.frequency.value = 6
    lfoGain.gain.value = 50
    lfo.connect(lfoGain)
    lfoGain.connect(osc.frequency)

    gain.gain.setValueAtTime(0.25, now)
    gain.gain.setValueAtTime(0.25, now + 0.3)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5)

    osc.connect(gain)
    gain.connect(getMasterGain())

    lfo.start(now)
    osc.start(now)
    lfo.stop(now + 0.6)
    osc.stop(now + 0.6)
  },

  // UI SOUNDS
  quizCorrect: () => {
    const ctx = getAudioContext()
    const now = ctx.currentTime

    // Triumphant rising arpeggio
    const notes = [NOTES.C5, NOTES.E5, NOTES.G5, NOTES.C6]
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sine'
      osc.frequency.value = freq

      gain.gain.setValueAtTime(0.25, now + i * 0.08)
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.3)

      osc.connect(gain)
      gain.connect(getMasterGain())

      osc.start(now + i * 0.08)
      osc.stop(now + i * 0.08 + 0.4)
    })

    // Success chime
    setTimeout(() => {
      organ(['C5', 'E5', 'G5'], 0, 0.4, 0.3)
    }, 300)
  },

  quizWrong: () => {
    const ctx = getAudioContext()
    const now = ctx.currentTime

    // Descending "wrong" sound
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'square'
    osc.frequency.setValueAtTime(300, now)
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.4)

    gain.gain.setValueAtTime(0.2, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4)

    osc.connect(gain)
    gain.connect(getMasterGain())

    osc.start(now)
    osc.stop(now + 0.5)
  },

  tick: () => {
    const ctx = getAudioContext()
    const now = ctx.currentTime

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.value = 1000

    gain.gain.setValueAtTime(0.1, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03)

    osc.connect(gain)
    gain.connect(getMasterGain())

    osc.start(now)
    osc.stop(now + 0.05)
  },

  select: () => {
    const ctx = getAudioContext()
    const now = ctx.currentTime

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(400, now)
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.08)

    gain.gain.setValueAtTime(0.15, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1)

    osc.connect(gain)
    gain.connect(getMasterGain())

    osc.start(now)
    osc.stop(now + 0.15)
  },

  // VICTORY / DEFEAT
  victory: () => {
    // Triumphant fanfare
    organ(['C4', 'E4', 'G4'], 0, 0.3, 0.35)
    setTimeout(() => organ(['D4', 'F4', 'A4'], 0, 0.3, 0.35), 300)
    setTimeout(() => organ(['E4', 'G4', 'B4'], 0, 0.3, 0.35), 600)
    setTimeout(() => organ(['C5', 'E5', 'G5'], 0, 0.6, 0.4), 900)
  },

  defeat: () => {
    const ctx = getAudioContext()
    const now = ctx.currentTime

    // Sad trombone
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(300, now)
    osc.frequency.exponentialRampToValueAtTime(280, now + 0.3)
    osc.frequency.exponentialRampToValueAtTime(260, now + 0.6)
    osc.frequency.exponentialRampToValueAtTime(200, now + 1.2)

    gain.gain.setValueAtTime(0.2, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5)

    osc.connect(gain)
    gain.connect(getMasterGain())

    osc.start(now)
    osc.stop(now + 1.6)
  },
}

export function useSound() {
  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolume] = useState(0.6)

  useEffect(() => {
    return () => {
      if (musicInterval) {
        clearInterval(musicInterval)
        musicInterval = null
      }
    }
  }, [])

  useEffect(() => {
    if (masterGain) {
      masterGain.gain.value = isMuted ? 0 : volume
    }
  }, [isMuted, volume])

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

  const stop = useCallback(() => {
    if (musicInterval) {
      clearInterval(musicInterval)
      musicInterval = null
    }
  }, [])

  // Music control
  const startPumpUpMusic = useCallback(() => {
    if (isMuted || musicInterval) return
    beatCount = 0
    playPumpUpBeat()
    musicInterval = setInterval(playPumpUpBeat, 250) // 120 BPM
  }, [isMuted])

  const startDefenseMusic = useCallback(() => {
    if (isMuted || musicInterval) return
    beatCount = 0
    playDefenseBeat()
    musicInterval = setInterval(playDefenseBeat, 400) // Slower stomp
  }, [isMuted])

  const startVictoryMusic = useCallback(() => {
    if (isMuted) return
    if (musicInterval) {
      clearInterval(musicInterval)
    }
    beatCount = 0
    playVictoryBeat()
    musicInterval = setInterval(playVictoryBeat, 250)

    // Auto-stop after 5 seconds
    setTimeout(() => {
      if (musicInterval) {
        clearInterval(musicInterval)
        musicInterval = null
      }
    }, 5000)
  }, [isMuted])

  const stopMusic = useCallback(() => {
    if (musicInterval) {
      clearInterval(musicInterval)
      musicInterval = null
    }
  }, [])

  // Game sounds
  const playCelticsScore = useCallback((isThree = false) => {
    if (isMuted) return
    if (isThree) {
      sounds.swish3()
      setTimeout(() => sounds.crowdRoar(), 200)
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
    sounds.block()
    setTimeout(() => sounds.crowdRoar(), 100)
  }, [isMuted])

  const playSteal = useCallback(() => {
    if (isMuted) return
    sounds.steal()
    setTimeout(() => sounds.crowdCheer(), 200)
  }, [isMuted])

  const playDunk = useCallback(() => {
    if (isMuted) return
    sounds.dunk()
    setTimeout(() => sounds.crowdRoar(), 150)
  }, [isMuted])

  const playQuizResult = useCallback((correct) => {
    if (isMuted) return
    if (correct) {
      sounds.quizCorrect()
      setTimeout(() => sounds.crowdCheer(), 400)
    } else {
      sounds.quizWrong()
      setTimeout(() => sounds.crowdGroan(), 200)
    }
  }, [isMuted])

  const playVictory = useCallback(() => {
    if (isMuted) return
    sounds.victory()
    setTimeout(() => sounds.crowdRoar(), 500)
    setTimeout(() => startVictoryMusic, 1000)
  }, [isMuted, startVictoryMusic])

  const playDefeat = useCallback(() => {
    if (isMuted) return
    sounds.defeat()
    setTimeout(() => sounds.crowdBoo(), 300)
  }, [isMuted])

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev)
  }, [])

  return {
    play,
    stop,
    stopMusic,
    isMuted,
    toggleMute,
    volume,
    setVolume,
    // Music
    startPumpUpMusic,
    startDefenseMusic,
    startVictoryMusic,
    // Game sounds
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
    // Individual sounds
    playBuzzer: useCallback(() => !isMuted && sounds.buzzer(), [isMuted]),
    playTick: useCallback(() => !isMuted && sounds.tick(), [isMuted]),
    playSelect: useCallback(() => !isMuted && sounds.select(), [isMuted]),
    playWhistle: useCallback(() => !isMuted && sounds.whistle(), [isMuted]),
    playCrowdCheer: useCallback(() => !isMuted && sounds.crowdCheer(), [isMuted]),
    playCrowdRoar: useCallback(() => !isMuted && sounds.crowdRoar(), [isMuted]),
    playCrowdBoo: useCallback(() => !isMuted && sounds.crowdBoo(), [isMuted]),
    playCrowdGroan: useCallback(() => !isMuted && sounds.crowdGroan(), [isMuted]),
    playSwish: useCallback(() => !isMuted && sounds.swish(), [isMuted]),
    playRimClank: useCallback(() => !isMuted && sounds.rimClank(), [isMuted]),
  }
}
