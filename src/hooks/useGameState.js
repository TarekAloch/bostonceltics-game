import { useReducer, useCallback, useEffect, useRef } from 'react'
import { getRandomPlayer, celtics, lakers, getRosters, ROSTER_TYPES } from '../data/players'
import { getRandomQuestion } from '../data/questions'

const DEFAULT_QUARTER_LENGTH = 60 // seconds
const SHOT_CLOCK = 24
const PHASE_TIMEOUT = 30000 // 30 seconds - auto-advance if stuck

const initialState = {
  // Game setup
  difficulty: 'medium', // easy, medium, hard
  gameStatus: 'start', // start, playing, halftime, ended

  // Score & Time
  quarter: 1,
  timeRemaining: DEFAULT_QUARTER_LENGTH,
  shotClock: SHOT_CLOCK,
  score: { celtics: 0, lakers: 0 },

  // Possession
  possession: 'celtics',
  phase: 'offense-trivia', // offense-trivia, offense-play-call, defense-choice, defense-predict, result, transition

  // Mode tracking (alternates each possession)
  offenseMode: 1, // 1 = pure trivia, 2 = play-call + trivia
  defenseMode: 1, // 1 = choice-based, 2 = prediction

  // Active play
  activePlayer: null,
  selectedAction: null, // For Lakers offense (three-point, mid-range, drive)
  playSelection: null, // For Celtics offense mode 2 (pick-roll, iso, fast-break)
  defenseChoice: null, // contest, block, steal
  predictionResult: null, // correct, wrong
  triviaResult: null, // correct, wrong
  currentQuestion: null,

  // Last play info for commentary
  lastPlay: null,

  // Tracking
  usedQuestionIndices: [],
  stats: {
    celtics: { fg: 0, fga: 0, threes: 0, threesA: 0, steals: 0, blocks: 0, fouls: 0 },
    lakers: { fg: 0, fga: 0, threes: 0, threesA: 0, fouls: 0 }
  },

  // Crowd state
  crowdMood: 'neutral', // neutral, hyped, angry, chanting
  showBeatLA: false,

  // Error guards
  phaseStartTime: Date.now(),
  stateVersion: 0, // Increment on each state change for debugging

  // Player rosters
  celticsRoster: celtics,
  lakersRoster: lakers,
  rosterType: "current2025",
  quarterLength: 1,
}

/**
 * Calculate shot success for Celtics offense
 * Mode 1 (Pure Trivia): Correct = 100% make, Wrong = 100% miss
 * Mode 2 (Play Call + Trivia):
 *   - Pick & Roll + Correct = 90% make
 *   - Iso + Correct = 80% make
 *   - Fast Break + Correct = 95% make
 *   - Any + Wrong = 30% make
 */
function calculateCelticsShotSuccess(mode, triviaResult, playSelection) {
  if (!triviaResult) {
    console.warn('[GAME STATE] calculateCelticsShotSuccess called without triviaResult')
    return 0.5
  }

  if (mode === 1) {
    // Pure trivia mode
    return triviaResult === 'correct' ? 1.0 : 0.0
  }

  if (mode === 2) {
    // Play call + trivia mode
    if (!playSelection) {
      console.warn('[GAME STATE] Mode 2 offense without playSelection')
      return 0.5
    }

    if (triviaResult === 'wrong') {
      return 0.30
    }

    // Correct trivia + play type
    const playBonus = {
      'pick-roll': 0.90,
      'iso': 0.80,
      'fast-break': 0.95,
    }

    return playBonus[playSelection] || 0.85
  }

  console.warn('[GAME STATE] Invalid offense mode:', mode)
  return 0.5
}

/**
 * Calculate Lakers shot success based on defense mode
 * Mode 1 (Choice):
 *   - Contest: 50% Lakers miss
 *   - Block: 30% block (miss), 20% foul (auto FT score 1-2)
 *   - Steal: 25% steal (Celtics ball), 25% foul, 50% Lakers score
 * Mode 2 (Predict):
 *   - Correct prediction: 70% Lakers miss
 *   - Wrong prediction: 30% Lakers miss
 */
function calculateLakersShotSuccess(mode, defenseChoice, predictionResult, difficulty) {
  const difficultyBonus = {
    easy: -0.15,
    medium: 0,
    hard: 0.15,
  }

  let baseChance = 0.50 + (difficultyBonus[difficulty] || 0)

  if (mode === 1) {
    // Choice-based defense
    if (!defenseChoice) {
      console.warn('[GAME STATE] Mode 1 defense without defenseChoice')
      return { chance: baseChance, special: null }
    }

    if (defenseChoice === 'contest') {
      return { chance: 0.50, special: null } // 50% Lakers make
    }

    if (defenseChoice === 'block') {
      const roll = Math.random()
      if (roll < 0.30) return { chance: 0, special: 'blocked' }
      if (roll < 0.50) return { chance: 1.0, special: 'foul' } // 20% foul
      return { chance: 0.50, special: null }
    }

    if (defenseChoice === 'steal') {
      const roll = Math.random()
      if (roll < 0.25) return { chance: 0, special: 'steal' }
      if (roll < 0.50) return { chance: 1.0, special: 'foul' } // 25% foul
      return { chance: 0.50, special: null }
    }
  }

  if (mode === 2) {
    // Prediction-based defense
    if (predictionResult === null || predictionResult === undefined) {
      console.warn('[GAME STATE] Mode 2 defense without predictionResult')
      return { chance: baseChance, special: null }
    }

    if (predictionResult === 'correct') {
      return { chance: 0.30, special: null } // 70% stop
    } else {
      return { chance: 0.70, special: null } // 30% stop
    }
  }

  console.warn('[GAME STATE] Invalid defense mode:', mode)
  return { chance: baseChance, special: null }
}

/**
 * Validate phase transition to prevent impossible states
 */
function isValidTransition(currentPhase, nextPhase, possession) {
  const validTransitions = {
    'offense-trivia': ['result', 'transition'],
    'offense-play-call': ['result', 'transition'],
    'defense-choice': ['result', 'transition'],
    'defense-predict': ['result', 'transition'],
    'result': ['transition'],
    'transition': ['offense-trivia', 'offense-play-call', 'defense-choice', 'defense-predict'],
  }

  if (!validTransitions[currentPhase]?.includes(nextPhase)) {
    console.warn(`[GAME STATE] Invalid transition: ${currentPhase} -> ${nextPhase}`)
    return false
  }

  return true
}

function gameReducer(state, action) {
  // Increment state version for debugging
  const newState = { ...state, stateVersion: state.stateVersion + 1 }

  switch (action.type) {
    case 'SET_DIFFICULTY':
      return { ...newState, difficulty: action.payload }

    case 'SET_ROSTER_TYPE':
      return { ...newState, rosterType: action.payload }

    case 'SET_QUARTER_LENGTH':
      return { ...newState, quarterLength: action.payload }

    case 'START_GAME': {
      const { question, index } = getRandomQuestion([])
      return {
        ...initialState,
        difficulty: state.difficulty,
        rosterType: state.rosterType,
        quarterLength: state.quarterLength,
        timeRemaining: state.quarterLength * 60,
        gameStatus: 'playing',
        phase: 'offense-trivia',
        offenseMode: 1,
        defenseMode: 1,
        activePlayer: getRandomPlayer('celtics'),
        possession: 'celtics',
        currentQuestion: { ...question, index },
        crowdMood: 'hyped',
        phaseStartTime: Date.now(),
      }
    }

    case 'TICK': {
      if (state.gameStatus !== 'playing') {
        return newState
      }

      // Only tick during certain phases
      const tickPhases = ['offense-trivia', 'offense-play-call', 'defense-choice', 'defense-predict']
      if (!tickPhases.includes(state.phase)) {
        return newState
      }

      const newTime = state.timeRemaining - 1
      const newShotClock = state.shotClock - 1

      // Quarter ended
      if (newTime <= 0) {
        if (state.quarter >= 4) {
          // Game over
          const winner = state.score.celtics > state.score.lakers ? 'celtics' :
                        state.score.lakers > state.score.celtics ? 'lakers' : 'tie'
          return {
            ...newState,
            timeRemaining: 0,
            gameStatus: 'ended',
            lastPlay: { type: 'game-end', winner },
            crowdMood: winner === 'celtics' ? 'hyped' : 'angry',
          }
        }

        // Halftime or next quarter
        const isHalftime = state.quarter === 2
        const nextPossession = state.quarter % 2 === 0 ? 'celtics' : 'lakers'
        const nextPhase = nextPossession === 'celtics' ? 'offense-trivia' : 'defense-choice'

        return {
          ...newState,
          quarter: state.quarter + 1,
          timeRemaining: state.quarterLength * 60,
          shotClock: SHOT_CLOCK,
          gameStatus: isHalftime ? 'halftime' : 'playing',
          possession: nextPossession,
          phase: nextPhase,
          activePlayer: getRandomPlayer(nextPossession),
          phaseStartTime: Date.now(),
        }
      }

      // Shot clock violation
      if (newShotClock <= 0) {
        const nextTeam = state.possession === 'celtics' ? 'lakers' : 'celtics'
        const nextPhase = nextTeam === 'celtics'
          ? (state.offenseMode === 1 ? 'offense-trivia' : 'offense-play-call')
          : (state.defenseMode === 1 ? 'defense-choice' : 'defense-predict')

        return {
          ...newState,
          timeRemaining: newTime,
          shotClock: SHOT_CLOCK,
          possession: nextTeam,
          phase: nextPhase,
          activePlayer: getRandomPlayer(nextTeam),
          lastPlay: { type: 'shot-clock', team: state.possession },
          crowdMood: state.possession === 'celtics' ? 'angry' : 'hyped',
          phaseStartTime: Date.now(),
        }
      }

      return {
        ...newState,
        timeRemaining: newTime,
        shotClock: newShotClock,
      }
    }

    case 'SELECT_PLAY': {
      // For offense mode 2 - player picks a play type first
      if (state.phase !== 'offense-play-call') {
        console.warn('[GAME STATE] SELECT_PLAY called in wrong phase:', state.phase)
        return newState
      }

      const { question, index } = getRandomQuestion(state.usedQuestionIndices)

      return {
        ...newState,
        playSelection: action.payload, // pick-roll, iso, fast-break
        currentQuestion: { ...question, index },
        phaseStartTime: Date.now(),
      }
    }

    case 'ANSWER_TRIVIA': {
      const { correct, questionIndex } = action.payload

      if (!state.currentQuestion) {
        console.warn('[GAME STATE] ANSWER_TRIVIA called without currentQuestion')
        return newState
      }

      return {
        ...newState,
        triviaResult: correct ? 'correct' : 'wrong',
        usedQuestionIndices: [...state.usedQuestionIndices, questionIndex],
        currentQuestion: null,
        phaseStartTime: Date.now(),
      }
    }

    case 'ANSWER_TRIVIA_WITH_PLAY': {
      // Combined action for Mode 2 offense - sets both playSelection AND triviaResult atomically
      const { correct, questionIndex, play } = action.payload

      if (!state.currentQuestion) {
        console.warn('[GAME STATE] ANSWER_TRIVIA_WITH_PLAY called without currentQuestion')
        return newState
      }

      if (state.phase !== 'offense-play-call') {
        console.warn('[GAME STATE] ANSWER_TRIVIA_WITH_PLAY called in wrong phase:', state.phase)
        return newState
      }

      return {
        ...newState,
        triviaResult: correct ? 'correct' : 'wrong',
        playSelection: play,
        usedQuestionIndices: [...state.usedQuestionIndices, questionIndex],
        currentQuestion: null,
        phaseStartTime: Date.now(),
      }
    }

    case 'RESOLVE_CELTICS_SHOT': {
      if (!state.activePlayer) {
        console.warn('[GAME STATE] RESOLVE_CELTICS_SHOT without activePlayer')
        return newState
      }

      if (!state.triviaResult) {
        console.warn('[GAME STATE] RESOLVE_CELTICS_SHOT without triviaResult')
        return newState
      }

      const successChance = calculateCelticsShotSuccess(
        state.offenseMode,
        state.triviaResult,
        state.playSelection
      )

      const made = Math.random() < successChance

      // Determine if it's a 3-pointer or 2-pointer (random for now)
      const isThree = Math.random() > 0.65 // 35% chance of 3pt
      const points = isThree ? 3 : 2

      const newStats = { ...state.stats }
      newStats.celtics.fga++
      if (isThree) newStats.celtics.threesA++

      if (made) {
        newStats.celtics.fg++
        if (isThree) newStats.celtics.threes++
      }

      const shotType = isThree ? 'three-point' :
                       state.playSelection === 'fast-break' ? 'drive' : 'mid-range'

      return {
        ...newState,
        score: made
          ? { ...state.score, celtics: state.score.celtics + points }
          : state.score,
        stats: newStats,
        lastPlay: {
          type: made ? 'made' : 'missed',
          team: 'celtics',
          player: state.activePlayer?.name,
          points: made ? points : 0,
          action: shotType,
          triviaCorrect: state.triviaResult === 'correct',
          playType: state.playSelection,
        },
        crowdMood: made ? 'hyped' : 'neutral',
        phase: 'transition',
        triviaResult: null,
        playSelection: null,
        phaseStartTime: Date.now(),
      }
    }

    case 'START_LAKERS_POSSESSION': {
      const lakersAction = ['three-point', 'mid-range', 'drive'][Math.floor(Math.random() * 3)]
      const lakersPlayer = getRandomPlayer('lakers')

      // Determine which defense mode to use
      const nextPhase = state.defenseMode === 1 ? 'defense-choice' : 'defense-predict'

      return {
        ...newState,
        possession: 'lakers',
        phase: nextPhase,
        activePlayer: lakersPlayer,
        selectedAction: lakersAction,
        shotClock: SHOT_CLOCK,
        showBeatLA: Math.random() > 0.6, // 40% chance for Beat LA chant
        phaseStartTime: Date.now(),
      }
    }

    case 'SELECT_DEFENSE_CHOICE': {
      // For defense mode 1 - pick Contest, Block, or Steal
      if (state.phase !== 'defense-choice') {
        console.warn('[GAME STATE] SELECT_DEFENSE_CHOICE called in wrong phase:', state.phase)
        return newState
      }

      return {
        ...newState,
        defenseChoice: action.payload, // contest, block, steal
        phaseStartTime: Date.now(),
      }
    }

    case 'SUBMIT_PREDICTION': {
      // For defense mode 2 - guess Lakers play type
      if (state.phase !== 'defense-predict') {
        console.warn('[GAME STATE] SUBMIT_PREDICTION called in wrong phase:', state.phase)
        return newState
      }

      const { prediction } = action.payload
      const actualAction = state.selectedAction // three-point, mid-range, drive
      const correct = prediction === actualAction

      return {
        ...newState,
        predictionResult: correct ? 'correct' : 'wrong',
        phaseStartTime: Date.now(),
      }
    }

    case 'RESOLVE_LAKERS_SHOT': {
      if (!state.activePlayer) {
        console.warn('[GAME STATE] RESOLVE_LAKERS_SHOT without activePlayer')
        return newState
      }

      const result = calculateLakersShotSuccess(
        state.defenseMode,
        state.defenseChoice,
        state.predictionResult,
        state.difficulty
      )

      const { chance, special } = result
      const newStats = { ...state.stats }

      // Handle special cases
      if (special === 'steal') {
        newStats.celtics.steals++
        return {
          ...newState,
          stats: newStats,
          possession: 'celtics',
          phase: 'transition',
          lastPlay: {
            type: 'steal',
            team: 'celtics',
            against: state.activePlayer?.name,
          },
          crowdMood: 'hyped',
          showBeatLA: false,
          defenseChoice: null,
          predictionResult: null,
          selectedAction: null,
          phaseStartTime: Date.now(),
        }
      }

      if (special === 'blocked') {
        newStats.celtics.blocks++
        newStats.lakers.fga++
        if (state.selectedAction === 'three-point') newStats.lakers.threesA++

        return {
          ...newState,
          stats: newStats,
          possession: 'celtics',
          phase: 'transition',
          lastPlay: {
            type: 'blocked',
            team: 'celtics',
            against: state.activePlayer?.name,
            action: state.selectedAction,
          },
          crowdMood: 'hyped',
          showBeatLA: false,
          defenseChoice: null,
          predictionResult: null,
          selectedAction: null,
          phaseStartTime: Date.now(),
        }
      }

      if (special === 'foul') {
        // Lakers get free throws - auto score 1-2 points
        const ftPoints = Math.random() > 0.5 ? 2 : 1
        newStats.celtics.fouls++
        newStats.lakers.fg++ // Count as made

        return {
          ...newState,
          score: { ...state.score, lakers: state.score.lakers + ftPoints },
          stats: newStats,
          lastPlay: {
            type: 'foul',
            team: 'lakers',
            player: state.activePlayer?.name,
            points: ftPoints,
            foulOn: 'celtics',
          },
          crowdMood: 'angry',
          showBeatLA: false,
          phase: 'transition',
          defenseChoice: null,
          predictionResult: null,
          selectedAction: null,
          phaseStartTime: Date.now(),
        }
      }

      // Regular shot outcome
      const made = Math.random() < chance
      const points = state.selectedAction === 'three-point' ? 3 : 2

      newStats.lakers.fga++
      if (state.selectedAction === 'three-point') newStats.lakers.threesA++

      if (made) {
        newStats.lakers.fg++
        if (state.selectedAction === 'three-point') newStats.lakers.threes++
      }

      return {
        ...newState,
        score: made
          ? { ...state.score, lakers: state.score.lakers + points }
          : state.score,
        stats: newStats,
        lastPlay: {
          type: made ? 'made' : 'missed',
          team: 'lakers',
          player: state.activePlayer?.name,
          points: made ? points : 0,
          action: state.selectedAction,
          contested: state.defenseChoice === 'contest',
          predicted: state.defenseMode === 2,
        },
        crowdMood: made ? 'angry' : 'hyped',
        showBeatLA: false,
        phase: 'transition',
        defenseChoice: null,
        predictionResult: null,
        selectedAction: null,
        phaseStartTime: Date.now(),
      }
    }

    case 'NEXT_POSSESSION': {
      const nextTeam = state.possession === 'celtics' ? 'lakers' : 'celtics'

      if (nextTeam === 'lakers') {
        // Start Lakers possession with appropriate defense mode
        const lakersAction = ['three-point', 'mid-range', 'drive'][Math.floor(Math.random() * 3)]
        const nextPhase = state.defenseMode === 1 ? 'defense-choice' : 'defense-predict'

        // Alternate defense mode for next Lakers possession
        const newDefenseMode = state.defenseMode === 1 ? 2 : 1

        return {
          ...newState,
          possession: 'lakers',
          phase: nextPhase,
          defenseMode: newDefenseMode, // Switch for next time
          activePlayer: getRandomPlayer('lakers'),
          selectedAction: lakersAction,
          shotClock: SHOT_CLOCK,
          showBeatLA: Math.random() > 0.5,
          phaseStartTime: Date.now(),
        }
      }

      // Celtics possession - determine offense mode and load trivia if needed
      const nextPhase = state.offenseMode === 1 ? 'offense-trivia' : 'offense-play-call'

      // Alternate offense mode for next possession
      const newOffenseMode = state.offenseMode === 1 ? 2 : 1

      let currentQuestion = null
      if (nextPhase === 'offense-trivia') {
        const { question, index } = getRandomQuestion(state.usedQuestionIndices)
        currentQuestion = { ...question, index }
      }

      return {
        ...newState,
        possession: 'celtics',
        phase: nextPhase,
        offenseMode: newOffenseMode, // Switch for next time
        activePlayer: getRandomPlayer('celtics'),
        selectedAction: null,
        currentQuestion,
        shotClock: SHOT_CLOCK,
        showBeatLA: false,
        phaseStartTime: Date.now(),
      }
    }

    case 'CONTINUE_FROM_HALFTIME': {
      const nextPhase = state.possession === 'celtics'
        ? (state.offenseMode === 1 ? 'offense-trivia' : 'offense-play-call')
        : (state.defenseMode === 1 ? 'defense-choice' : 'defense-predict')

      let currentQuestion = null
      if (nextPhase === 'offense-trivia') {
        const { question, index } = getRandomQuestion(state.usedQuestionIndices)
        currentQuestion = { ...question, index }
      }

      return {
        ...newState,
        gameStatus: 'playing',
        phase: nextPhase,
        currentQuestion,
        activePlayer: getRandomPlayer(state.possession),
        phaseStartTime: Date.now(),
      }
    }

    case 'RESTART_GAME':
      return {
        ...initialState,
        difficulty: state.difficulty,
        rosterType: state.rosterType,
        quarterLength: state.quarterLength,
        timeRemaining: state.quarterLength * 60,
      }

    case 'SET_CROWD_MOOD':
      return { ...newState, crowdMood: action.payload }

    case 'FORCE_ADVANCE_PHASE':
      // Emergency fallback if phase gets stuck
      console.warn('[GAME STATE] Force advancing from stuck phase:', state.phase)

      const fallbackPhase = state.possession === 'celtics' ? 'offense-trivia' : 'defense-choice'
      return {
        ...newState,
        phase: fallbackPhase,
        activePlayer: getRandomPlayer(state.possession),
        phaseStartTime: Date.now(),
      }

    default:
      return newState
  }
}

export function useGameState() {
  const [state, dispatch] = useReducer(gameReducer, initialState)
  const phaseTimeoutRef = useRef(null)

  // Game clock ticker
  useEffect(() => {
    if (state.gameStatus !== 'playing') return

    const tickPhases = ['offense-trivia', 'offense-play-call', 'defense-choice', 'defense-predict']
    if (!tickPhases.includes(state.phase)) return

    const interval = setInterval(() => {
      dispatch({ type: 'TICK' })
    }, 1000)

    return () => clearInterval(interval)
  }, [state.gameStatus, state.phase])

  // Phase timeout guard - auto-advance if stuck
  useEffect(() => {
    if (state.gameStatus !== 'playing') return

    // Clear existing timeout
    if (phaseTimeoutRef.current) {
      clearTimeout(phaseTimeoutRef.current)
    }

    // Set new timeout
    phaseTimeoutRef.current = setTimeout(() => {
      const elapsed = Date.now() - state.phaseStartTime
      if (elapsed > PHASE_TIMEOUT) {
        console.warn(`[GAME STATE] Phase timeout: ${state.phase} stuck for ${elapsed}ms`)
        dispatch({ type: 'FORCE_ADVANCE_PHASE' })
      }
    }, PHASE_TIMEOUT)

    return () => {
      if (phaseTimeoutRef.current) {
        clearTimeout(phaseTimeoutRef.current)
      }
    }
  }, [state.phase, state.phaseStartTime, state.gameStatus])
  const actions = {
    setDifficulty: useCallback((diff) =>
      dispatch({ type: 'SET_DIFFICULTY', payload: diff }), []),

    setRosterType: useCallback((type) =>
      dispatch({ type: 'SET_ROSTER_TYPE', payload: type }), []),

    setQuarterLength: useCallback((length) =>
      dispatch({ type: 'SET_QUARTER_LENGTH', payload: length }), []),

    startGame: useCallback(() =>
      dispatch({ type: 'START_GAME' }), []),

    selectPlay: useCallback((play) =>
      dispatch({ type: 'SELECT_PLAY', payload: play }), []),

    answerTrivia: useCallback((correct, questionIndex) =>
      dispatch({ type: 'ANSWER_TRIVIA', payload: { correct, questionIndex } }), []),

    answerTriviaWithPlay: useCallback((correct, questionIndex, play) =>
      dispatch({ type: 'ANSWER_TRIVIA_WITH_PLAY', payload: { correct, questionIndex, play } }), []),

    resolveCelticsShot: useCallback(() =>
      dispatch({ type: 'RESOLVE_CELTICS_SHOT' }), []),

    startLakersPossession: useCallback(() =>
      dispatch({ type: 'START_LAKERS_POSSESSION' }), []),

    selectDefenseChoice: useCallback((choice) =>
      dispatch({ type: 'SELECT_DEFENSE_CHOICE', payload: choice }), []),

    submitPrediction: useCallback((prediction) =>
      dispatch({ type: 'SUBMIT_PREDICTION', payload: { prediction } }), []),

    resolveLakersShot: useCallback(() =>
      dispatch({ type: 'RESOLVE_LAKERS_SHOT' }), []),

    nextPossession: useCallback(() =>
      dispatch({ type: 'NEXT_POSSESSION' }), []),

    continueFromHalftime: useCallback(() =>
      dispatch({ type: 'CONTINUE_FROM_HALFTIME' }), []),

    restartGame: useCallback(() =>
      dispatch({ type: 'RESTART_GAME' }), []),

    setCrowdMood: useCallback((mood) =>
      dispatch({ type: 'SET_CROWD_MOOD', payload: mood }), []),

    forceAdvancePhase: useCallback(() =>
      dispatch({ type: 'FORCE_ADVANCE_PHASE' }), []),
  }

  return { state, actions }
}
