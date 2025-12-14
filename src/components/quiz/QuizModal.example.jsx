import { useState } from 'react'
import QuizModal from './QuizModal'

/**
 * Example Usage: QuizModal Component
 *
 * Integration examples for the trivia quiz mechanic
 */

// Example 1: Basic usage
export function BasicExample() {
  const [showQuiz, setShowQuiz] = useState(false)
  const [boostApplied, setBoostApplied] = useState(false)

  const handleQuizComplete = (isCorrect, questionIndex) => {
    console.log(`Question ${questionIndex}: ${isCorrect ? 'Correct' : 'Wrong'}`)

    if (isCorrect) {
      setBoostApplied(true)
      // Apply +15% to next shot accuracy
    }

    setShowQuiz(false)
  }

  return (
    <div>
      <button onClick={() => setShowQuiz(true)}>
        Answer Trivia for Boost
      </button>

      {showQuiz && (
        <QuizModal
          question={{
            question: "Who holds the Celtics career scoring record?",
            answers: ["Larry Bird", "John Havlicek", "Paul Pierce", "Bill Russell"],
            correct: 2,
            index: 0
          }}
          onComplete={handleQuizComplete}
        />
      )}

      {boostApplied && <div className="boost-indicator">+15% Accuracy!</div>}
    </div>
  )
}

// Example 2: Multiple questions in sequence
export function MultiQuestionExample() {
  const questions = [
    {
      question: "Who holds the Celtics career scoring record?",
      answers: ["Larry Bird", "John Havlicek", "Paul Pierce", "Bill Russell"],
      correct: 2,
      index: 0
    },
    {
      question: "How many NBA championships have the Celtics won?",
      answers: ["15", "17", "18", "16"],
      correct: 1,
      index: 1
    },
    {
      question: "What year did the Celtics win their first championship?",
      answers: ["1955", "1957", "1959", "1961"],
      correct: 1,
      index: 2
    },
    {
      question: "Who is the Celtics' all-time leader in assists?",
      answers: ["Bob Cousy", "Rajon Rondo", "Marcus Smart", "Isaiah Thomas"],
      correct: 0,
      index: 3
    }
  ]

  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [showQuiz, setShowQuiz] = useState(true)
  const [correctAnswers, setCorrectAnswers] = useState(0)

  const handleComplete = (isCorrect) => {
    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1)
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1)
    } else {
      setShowQuiz(false)
      console.log(`Quiz complete: ${correctAnswers}/${questions.length}`)
    }
  }

  return (
    <div>
      {showQuiz && (
        <QuizModal
          question={questions[currentQuestion]}
          onComplete={handleComplete}
        />
      )}

      <div className="progress">
        Question {currentQuestion + 1} of {questions.length}
        <br />
        Correct: {correctAnswers}
      </div>
    </div>
  )
}

// Example 3: Dynamic questions based on game context
export function DynamicQuestionsExample() {
  const [gameState, setGameState] = useState({
    currentPlayer: 'Jayson Tatum',
    action: 'three-point'
  })

  // Generate relevant question based on current player
  const getPlayerQuestion = (playerName) => {
    const playerQuestions = {
      'Jayson Tatum': {
        question: "What year was Jayson Tatum drafted by the Celtics?",
        answers: ["2016", "2017", "2018", "2019"],
        correct: 1,
        index: 0
      },
      'Jaylen Brown': {
        question: "What college did Jaylen Brown attend?",
        answers: ["Duke", "Kentucky", "Cal Berkeley", "UCLA"],
        correct: 2,
        index: 0
      }
    }

    return playerQuestions[playerName] || playerQuestions['Jayson Tatum']
  }

  return (
    <QuizModal
      question={getPlayerQuestion(gameState.currentPlayer)}
      onComplete={(isCorrect) => console.log(isCorrect)}
    />
  )
}

// Example 4: Integration with shot accuracy system
export function AccuracyBoostExample() {
  const [shotAccuracy, setShotAccuracy] = useState(0.65) // 65% base
  const [quizBoost, setQuizBoost] = useState(0)

  const handleQuizComplete = (isCorrect) => {
    if (isCorrect) {
      setQuizBoost(0.15) // +15%
      // Boost lasts for next shot only
    } else {
      setQuizBoost(0)
    }
  }

  const takeShot = () => {
    const finalAccuracy = shotAccuracy + quizBoost
    const made = Math.random() < finalAccuracy

    console.log(`Shot ${made ? 'made' : 'missed'} (${(finalAccuracy * 100).toFixed(0)}% accuracy)`)

    // Reset boost after shot
    setQuizBoost(0)

    return made
  }

  return (
    <div>
      <div className="accuracy-display">
        Base Accuracy: {(shotAccuracy * 100).toFixed(0)}%
        {quizBoost > 0 && (
          <span className="boost">+{(quizBoost * 100).toFixed(0)}%</span>
        )}
      </div>

      <QuizModal
        question={{
          question: "Who holds the Celtics career scoring record?",
          answers: ["Larry Bird", "John Havlicek", "Paul Pierce", "Bill Russell"],
          correct: 2
        }}
        onComplete={handleQuizComplete}
      />

      <button onClick={takeShot}>Take Shot</button>
    </div>
  )
}

// Example 5: Difficulty-based questions
export function DifficultyBasedExample() {
  const [difficulty, setDifficulty] = useState('medium')

  const questionsByDifficulty = {
    easy: {
      question: "What city are the Celtics based in?",
      answers: ["New York", "Boston", "Philadelphia", "Chicago"],
      correct: 1
    },
    medium: {
      question: "Who holds the Celtics career scoring record?",
      answers: ["Larry Bird", "John Havlicek", "Paul Pierce", "Bill Russell"],
      correct: 2
    },
    hard: {
      question: "What was the Celtics' record in the 1985-86 championship season?",
      answers: ["67-15", "65-17", "62-20", "69-13"],
      correct: 0
    }
  }

  return (
    <div>
      <select onChange={(e) => setDifficulty(e.target.value)} value={difficulty}>
        <option value="easy">Easy</option>
        <option value="medium">Medium</option>
        <option value="hard">Hard</option>
      </select>

      <QuizModal
        question={questionsByDifficulty[difficulty]}
        onComplete={(isCorrect) => {
          const boost = isCorrect ? { easy: 10, medium: 15, hard: 20 }[difficulty] : 0
          console.log(`Boost: +${boost}%`)
        }}
      />
    </div>
  )
}

// Example 6: Question pool with random selection
export function RandomQuestionExample() {
  const questionPool = [
    {
      question: "Who holds the Celtics career scoring record?",
      answers: ["Larry Bird", "John Havlicek", "Paul Pierce", "Bill Russell"],
      correct: 2
    },
    {
      question: "How many NBA championships have the Celtics won?",
      answers: ["15", "17", "18", "16"],
      correct: 1
    },
    {
      question: "What are the Celtics' team colors?",
      answers: ["Green and Gold", "Green and White", "Green and Silver", "Green and Black"],
      correct: 1
    },
    {
      question: "Who coached the Celtics to 9 championships?",
      answers: ["Red Auerbach", "Doc Rivers", "K.C. Jones", "Bill Russell"],
      correct: 0
    }
  ]

  const [usedQuestions, setUsedQuestions] = useState([])
  const [currentQuestion, setCurrentQuestion] = useState(null)

  const getRandomQuestion = () => {
    const available = questionPool.filter((_, index) => !usedQuestions.includes(index))
    if (available.length === 0) {
      setUsedQuestions([]) // Reset pool
      return questionPool[0]
    }

    const randomIndex = Math.floor(Math.random() * available.length)
    const question = available[randomIndex]
    const poolIndex = questionPool.indexOf(question)

    setUsedQuestions(prev => [...prev, poolIndex])
    return { ...question, index: poolIndex }
  }

  const showQuiz = () => {
    setCurrentQuestion(getRandomQuestion())
  }

  return (
    <div>
      <button onClick={showQuiz}>Random Trivia</button>

      {currentQuestion && (
        <QuizModal
          question={currentQuestion}
          onComplete={(isCorrect, index) => {
            console.log(`Question ${index}: ${isCorrect ? 'Correct' : 'Wrong'}`)
            setCurrentQuestion(null)
          }}
        />
      )}

      <div>
        Questions answered: {usedQuestions.length}/{questionPool.length}
      </div>
    </div>
  )
}

// Example 7: With AnimatePresence for smooth modal transitions
import { AnimatePresence } from 'framer-motion'

export function AnimatedExample() {
  const [showQuiz, setShowQuiz] = useState(false)

  return (
    <div>
      <button onClick={() => setShowQuiz(true)}>Show Quiz</button>

      <AnimatePresence>
        {showQuiz && (
          <QuizModal
            question={{
              question: "Who holds the Celtics career scoring record?",
              answers: ["Larry Bird", "John Havlicek", "Paul Pierce", "Bill Russell"],
              correct: 2
            }}
            onComplete={(isCorrect) => {
              console.log(isCorrect)
              setShowQuiz(false)
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// Example 8: Streak tracking
export function StreakTrackingExample() {
  const [streak, setStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)

  const handleComplete = (isCorrect) => {
    if (isCorrect) {
      const newStreak = streak + 1
      setStreak(newStreak)
      if (newStreak > bestStreak) {
        setBestStreak(newStreak)
      }
    } else {
      setStreak(0)
    }
  }

  return (
    <div>
      <div className="stats">
        <div>Current Streak: {streak}</div>
        <div>Best Streak: {bestStreak}</div>
      </div>

      <QuizModal
        question={{
          question: "Who holds the Celtics career scoring record?",
          answers: ["Larry Bird", "John Havlicek", "Paul Pierce", "Bill Russell"],
          correct: 2
        }}
        onComplete={handleComplete}
      />
    </div>
  )
}
