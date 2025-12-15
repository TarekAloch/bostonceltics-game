import { motion } from 'framer-motion'
import { useEffect, useState, useRef } from 'react'

/**
 * ShotArc Component
 * Memory-leak-safe version using refs for all timers
 */
export default function ShotArc({ from, to, shotType, result, onComplete }) {
  const [showSwish, setShowSwish] = useState(false)
  const [showRimBounce, setShowRimBounce] = useState(false)
  const [showBlock, setShowBlock] = useState(false)
  
  // Refs for timer cleanup
  const outerTimerRef = useRef(null)
  const innerTimerRef = useRef(null)

  const getArcPath = () => {
    const dx = to.x - from.x
    const dy = to.y - from.y
    const arcHeight = shotType === 'three-point' ? 80 :
                      shotType === 'mid-range' ? 50 : 20
    const controlX = from.x + dx * 0.5
    const controlY = from.y + dy * 0.5 - arcHeight
    return `M ${from.x} ${from.y} Q ${controlX} ${controlY} ${to.x} ${to.y}`
  }

  const duration = shotType === 'three-point' ? 0.8 :
                   shotType === 'mid-range' ? 0.6 : 0.4

  useEffect(() => {
    if (!result || !onComplete) return

    // Clear any existing timers
    if (outerTimerRef.current) clearTimeout(outerTimerRef.current)
    if (innerTimerRef.current) clearTimeout(innerTimerRef.current)

    outerTimerRef.current = setTimeout(() => {
      if (result === 'made') {
        setShowSwish(true)
        innerTimerRef.current = setTimeout(() => {
          setShowSwish(false)
          onComplete()
        }, 600)
      } else if (result === 'missed') {
        setShowRimBounce(true)
        innerTimerRef.current = setTimeout(() => {
          setShowRimBounce(false)
          onComplete()
        }, 800)
      } else if (result === 'blocked') {
        setShowBlock(true)
        innerTimerRef.current = setTimeout(() => {
          setShowBlock(false)
          onComplete()
        }, 500)
      }
    }, duration * 1000)

    return () => {
      if (outerTimerRef.current) clearTimeout(outerTimerRef.current)
      if (innerTimerRef.current) clearTimeout(innerTimerRef.current)
    }
  }, [result, duration, onComplete])

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 400 200"
      preserveAspectRatio="xMidYMid slice"
    >
      {result !== 'blocked' && (
        <motion.g
          initial={{ offsetDistance: '0%' }}
          animate={{ offsetDistance: result === 'blocked' ? '50%' : '100%' }}
          transition={{ duration, ease: 'easeOut' }}
        >
          <motion.circle
            cx={from.x}
            cy={from.y}
            r="4"
            fill="#FF6600"
            stroke="#000"
            strokeWidth="0.5"
            style={{
              offsetPath: `path('${getArcPath()}')`,
              offsetRotate: '0deg',
            }}
          >
            <animateMotion
              dur={`${duration}s`}
              path={getArcPath()}
              fill="freeze"
            />
          </motion.circle>
          <motion.circle
            cx={from.x}
            cy={from.y}
            r="4"
            fill="none"
            stroke="#000"
            strokeWidth="0.3"
            opacity="0.5"
          >
            <animateMotion
              dur={`${duration}s`}
              path={getArcPath()}
              fill="freeze"
            />
          </motion.circle>
        </motion.g>
      )}

      {result === 'blocked' && showBlock && (
        <motion.g>
          <motion.circle
            cx={from.x + (to.x - from.x) * 0.5}
            cy={from.y + (to.y - from.y) * 0.5 - 40}
            r="4"
            fill="#FF6600"
            stroke="#000"
            strokeWidth="0.5"
            initial={{ opacity: 1, x: 0, y: 0 }}
            animate={{
              opacity: 0,
              x: Math.random() > 0.5 ? 30 : -30,
              y: -20
            }}
            transition={{ duration: 0.5 }}
          />
          <motion.circle
            cx={from.x + (to.x - from.x) * 0.5}
            cy={from.y + (to.y - from.y) * 0.5 - 40}
            r="15"
            fill="none"
            stroke="#FF4444"
            strokeWidth="2"
            initial={{ scale: 0.5, opacity: 1 }}
            animate={{ scale: 2, opacity: 0 }}
            transition={{ duration: 0.5 }}
          />
        </motion.g>
      )}

      {showSwish && (
        <motion.g>
          {[0, 1, 2].map((i) => (
            <motion.circle
              key={i}
              cx={to.x}
              cy={to.y}
              r="6"
              fill="none"
              stroke="#00FF00"
              strokeWidth="2"
              initial={{ scale: 1, opacity: 0.8 }}
              animate={{ scale: 2 + i, opacity: 0 }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
            />
          ))}
          <motion.text
            x={to.x}
            y={to.y + 20}
            textAnchor="middle"
            fill="#00FF00"
            fontSize="12"
            fontWeight="bold"
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: [0, 1, 0], y: 10 }}
            transition={{ duration: 0.6 }}
          >
            SWISH!
          </motion.text>
        </motion.g>
      )}

      {showRimBounce && (
        <motion.g>
          <motion.circle
            cx={to.x}
            cy={to.y}
            r="4"
            fill="#FF6600"
            stroke="#000"
            strokeWidth="0.5"
            animate={{
              cx: [to.x, to.x + 10, to.x + 5],
              cy: [to.y, to.y - 15, to.y + 30],
              opacity: [1, 1, 0],
            }}
            transition={{ duration: 0.8, times: [0, 0.4, 1] }}
          />
          <motion.circle
            cx={to.x}
            cy={to.y}
            r="5"
            fill="none"
            stroke="#FF4444"
            strokeWidth="2"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0, 0],
            }}
            transition={{ duration: 0.3, repeat: 2 }}
          />
        </motion.g>
      )}
    </svg>
  )
}
