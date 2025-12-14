import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

/**
 * ShotArc Component
 *
 * Animates a basketball shot from shooter to basket with realistic arc.
 *
 * Props:
 * - from: { x, y } shooter position (0-400 coord system)
 * - to: { x, y } basket position (0-400 coord system)
 * - shotType: 'three-point' | 'mid-range' | 'layup'
 * - result: 'made' | 'missed' | 'blocked'
 * - onComplete: callback when animation finishes
 *
 * Usage:
 * <ShotArc
 *   from={{ x: 300, y: 100 }}
 *   to={{ x: 25, y: 100 }}
 *   shotType="three-point"
 *   result="made"
 *   onComplete={() => console.log('Shot complete!')}
 * />
 */
export default function ShotArc({ from, to, shotType, result, onComplete }) {
  const [showSwish, setShowSwish] = useState(false)
  const [showRimBounce, setShowRimBounce] = useState(false)
  const [showBlock, setShowBlock] = useState(false)

  // Calculate arc path
  const getArcPath = () => {
    const dx = to.x - from.x
    const dy = to.y - from.y

    // Control point for bezier curve (determines arc height)
    const arcHeight = shotType === 'three-point' ? 80 :
                      shotType === 'mid-range' ? 50 :
                      20 // layup

    const controlX = from.x + dx * 0.5
    const controlY = from.y + dy * 0.5 - arcHeight

    return `M ${from.x} ${from.y} Q ${controlX} ${controlY} ${to.x} ${to.y}`
  }

  // Animation duration based on shot type
  const duration = shotType === 'three-point' ? 0.8 :
                   shotType === 'mid-range' ? 0.6 :
                   0.4 // layup

  // Handle animation completion
  useEffect(() => {
    if (!result || !onComplete) return

    const timer = setTimeout(() => {
      if (result === 'made') {
        setShowSwish(true)
        const swishTimer = setTimeout(() => {
          setShowSwish(false)
          onComplete()
        }, 600)
        return () => clearTimeout(swishTimer)
      } else if (result === 'missed') {
        setShowRimBounce(true)
        const bounceTimer = setTimeout(() => {
          setShowRimBounce(false)
          onComplete()
        }, 800)
        return () => clearTimeout(bounceTimer)
      } else if (result === 'blocked') {
        setShowBlock(true)
        const blockTimer = setTimeout(() => {
          setShowBlock(false)
          onComplete()
        }, 500)
        return () => clearTimeout(blockTimer)
      }
    }, duration * 1000)

    return () => clearTimeout(timer)
  }, [result, duration, onComplete])

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 400 200"
      preserveAspectRatio="xMidYMid slice"
    >
      {/* Shot arc path (for visualization in dev) */}
      {/* <path
        d={getArcPath()}
        fill="none"
        stroke="rgba(255,255,255,0.2)"
        strokeWidth="1"
        strokeDasharray="5,5"
      /> */}

      {/* Basketball traveling along arc */}
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

          {/* Ball seams */}
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

      {/* Blocked shot - ball deflects */}
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

          {/* Block effect */}
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

      {/* Swish effect (made shot) */}
      {showSwish && (
        <motion.g>
          {/* Net ripple */}
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

          {/* Swish text */}
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

      {/* Rim bounce effect (missed shot) */}
      {showRimBounce && (
        <motion.g>
          {/* Ball bouncing off rim */}
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

          {/* Rim shake */}
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
