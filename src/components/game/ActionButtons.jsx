import { motion } from 'framer-motion'
import { Target, Crosshair, Zap, HelpCircle } from 'lucide-react'

const actions = [
  {
    id: 'three-point',
    name: '3-POINTER',
    description: 'High risk, 3 points',
    icon: Target,
    color: 'from-red-600 to-red-700',
    glow: 'rgba(220,38,38,0.4)',
  },
  {
    id: 'mid-range',
    name: 'MID-RANGE',
    description: 'Medium risk, 2 points',
    icon: Crosshair,
    color: 'from-yellow-600 to-yellow-700',
    glow: 'rgba(202,138,4,0.4)',
  },
  {
    id: 'drive',
    name: 'DRIVE',
    description: 'Lower risk, 2 points',
    icon: Zap,
    color: 'from-green-600 to-green-700',
    glow: 'rgba(22,163,74,0.4)',
  },
  {
    id: 'quiz',
    name: 'TRIVIA',
    description: 'Answer to boost shot',
    icon: HelpCircle,
    color: 'from-[#007A33] to-[#005a25]',
    glow: 'rgba(0,122,51,0.4)',
  },
]

export default function ActionButtons({ onSelect, disabled }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full max-w-2xl mx-auto px-4"
    >
      {actions.map((action, i) => {
        const Icon = action.icon
        return (
          <motion.button
            key={action.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => !disabled && onSelect(action.id)}
            disabled={disabled}
            className={`relative p-4 rounded-xl bg-gradient-to-br ${action.color}
              border border-white/10 shadow-lg transition-all
              disabled:opacity-50 disabled:cursor-not-allowed
              hover:shadow-xl active:shadow-md`}
            style={{
              boxShadow: `0 10px 30px ${action.glow}`,
            }}
          >
            {/* Icon */}
            <div className="flex justify-center mb-2">
              <Icon className="w-8 h-8 text-white" />
            </div>

            {/* Name */}
            <p className="font-['Oswald'] text-lg font-semibold text-white tracking-wider">
              {action.name}
            </p>

            {/* Description */}
            <p className="text-xs text-white/70 mt-1">
              {action.description}
            </p>

            {/* Shine effect */}
            <motion.div
              className="absolute inset-0 rounded-xl bg-gradient-to-tr from-white/0 via-white/10 to-white/0 pointer-events-none"
              animate={{
                opacity: [0, 0.5, 0],
                x: ['-100%', '100%'],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 3,
              }}
            />
          </motion.button>
        )
      })}
    </motion.div>
  )
}
