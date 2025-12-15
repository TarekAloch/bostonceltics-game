import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Trophy, Volume2, VolumeX, ChevronRight, Clock, Users, ChevronLeft } from 'lucide-react'
import { ROSTER_TYPES, ROSTER_LABELS } from '../../data/players'

const difficulties = [
  { id: 'easy', name: 'ROOKIE', description: 'Lakers shoot 35%', color: 'from-green-600 to-green-700' },
  { id: 'medium', name: 'ALL-STAR', description: 'Lakers shoot 45%', color: 'from-yellow-600 to-yellow-700' },
  { id: 'hard', name: 'FINALS', description: 'Lakers shoot 55%', color: 'from-red-600 to-red-700' },
]

const rosterOptions = [
  { id: ROSTER_TYPES.CURRENT_2025, name: '2024-25', description: 'Current Rosters', emoji: String.fromCodePoint(0x1F3C0) },
  { id: ROSTER_TYPES.ALL_TIME, name: 'ALL-TIME', description: 'Legends Forever', emoji: String.fromCodePoint(0x1F451) },
  { id: ROSTER_TYPES.CENTURY_21, name: '21ST CENTURY', description: 'Modern Legends', emoji: String.fromCodePoint(0x1F31F) },
]

export default function StartScreen({
  onStart,
  difficulty,
  setDifficulty,
  rosterType,
  setRosterType,
  quarterLength,
  setQuarterLength,
  isMuted,
  toggleMute
}) {
  const [step, setStep] = useState('start')

  const handleNext = () => {
    if (step === 'start') setStep('difficulty')
    else if (step === 'difficulty') setStep('roster')
    else if (step === 'roster') setStep('settings')
  }

  const handleBack = () => {
    if (step === 'settings') setStep('roster')
    else if (step === 'roster') setStep('difficulty')
    else if (step === 'difficulty') setStep('start')
  }

  return (
    <div className="relative w-full h-full overflow-hidden flex flex-col items-center justify-center">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0A1612] via-[#0f2018] to-[#0A1612]">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Ctext x='30' y='35' font-size='30' text-anchor='middle' fill='%23007A33'%3E%E2%98%98%3C/text%3E%3C/svg%3E\")",
            backgroundSize: '60px 60px',
          }} />
        </div>
        <motion.div
          className="absolute w-96 h-96 bg-[#007A33] rounded-full blur-[150px] opacity-30"
          animate={{ x: [0, 100, 0], y: [0, -50, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          style={{ top: '10%', left: '10%' }}
        />
        <motion.div
          className="absolute w-64 h-64 bg-[#BA9653] rounded-full blur-[120px] opacity-20"
          animate={{ x: [0, -80, 0], y: [0, 60, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          style={{ bottom: '20%', right: '15%' }}
        />
      </div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={toggleMute}
        className="absolute top-4 right-4 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-50"
      >
        {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
      </motion.button>

      <div className="relative z-10 flex flex-col items-center text-center px-4 w-full max-w-2xl">
        <AnimatePresence mode="wait">
          {step === 'start' && (
            <motion.div
              key="start"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, x: -50 }}
              className="flex flex-col items-center"
            >
              <motion.div
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="flex items-center gap-3 mb-4"
              >
                <div className="w-16 h-1 bg-gradient-to-r from-transparent to-[#BA9653]" />
                <Trophy className="w-8 h-8 text-[#BA9653]" />
                <div className="w-16 h-1 bg-gradient-to-l from-transparent to-[#BA9653]" />
              </motion.div>

              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.6, type: 'spring' }}
                className="text-7xl md:text-8xl mb-4"
              >
                {String.fromCodePoint(0x2618, 0xFE0F)}
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-['Oswald'] text-5xl md:text-7xl font-bold tracking-tight mb-2"
              >
                <span className="text-[#007A33] drop-shadow-[0_0_30px_rgba(0,122,51,0.5)]">CELTICS</span>
                <span className="text-white mx-3 text-3xl md:text-4xl">vs</span>
                <span className="text-[#552583] drop-shadow-[0_0_30px_rgba(85,37,131,0.5)]">LAKERS</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-[#BA9653] font-['Oswald'] text-xl md:text-2xl tracking-widest mb-8"
              >
                TD GARDEN - BOSTON
              </motion.p>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleNext}
                className="group px-12 py-4 bg-gradient-to-r from-[#007A33] to-[#005a25] rounded-full font-['Oswald'] text-2xl tracking-wider shadow-[0_0_40px_rgba(0,122,51,0.4)] hover:shadow-[0_0_60px_rgba(0,122,51,0.6)] transition-shadow"
              >
                <span className="flex items-center gap-3">
                  <Play className="w-6 h-6 fill-current" />
                  START GAME
                  <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </span>
              </motion.button>
            </motion.div>
          )}

          {step === 'difficulty' && (
            <motion.div
              key="difficulty"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="flex flex-col items-center w-full"
            >
              <p className="font-['Oswald'] text-2xl tracking-wider text-white/60 mb-6">SELECT DIFFICULTY</p>

              <div className="flex flex-col md:flex-row gap-3 mb-8 w-full justify-center">
                {difficulties.map((diff, i) => (
                  <motion.button
                    key={diff.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setDifficulty(diff.id)}
                    className={`px-8 py-4 rounded-xl font-['Oswald'] tracking-wider transition-all ${
                      difficulty === diff.id
                        ? `bg-gradient-to-r ${diff.color} shadow-lg ring-2 ring-white/30`
                        : 'bg-white/10 hover:bg-white/20'
                    }`}
                  >
                    <span className="text-xl">{diff.name}</span>
                    <span className="block text-sm opacity-70">{diff.description}</span>
                  </motion.button>
                ))}
              </div>

              <div className="flex gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleBack}
                  className="px-6 py-3 bg-white/10 rounded-full font-['Oswald'] tracking-wider flex items-center gap-2"
                >
                  <ChevronLeft className="w-5 h-5" />
                  BACK
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleNext}
                  className="px-8 py-3 bg-gradient-to-r from-[#007A33] to-[#005a25] rounded-full font-['Oswald'] tracking-wider flex items-center gap-2"
                >
                  NEXT
                  <ChevronRight className="w-5 h-5" />
                </motion.button>
              </div>
            </motion.div>
          )}

          {step === 'roster' && (
            <motion.div
              key="roster"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="flex flex-col items-center w-full"
            >
              <div className="flex items-center gap-2 mb-6">
                <Users className="w-6 h-6 text-[#BA9653]" />
                <p className="font-['Oswald'] text-2xl tracking-wider text-white/60">SELECT ROSTERS</p>
              </div>

              <div className="flex flex-col gap-3 mb-8 w-full max-w-md">
                {rosterOptions.map((roster, i) => (
                  <motion.button
                    key={roster.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setRosterType(roster.id)}
                    className={`px-6 py-4 rounded-xl font-['Oswald'] tracking-wider transition-all text-left flex items-center gap-4 ${
                      rosterType === roster.id
                        ? 'bg-gradient-to-r from-[#007A33] to-[#005a25] shadow-lg ring-2 ring-[#BA9653]'
                        : 'bg-white/10 hover:bg-white/20'
                    }`}
                  >
                    <span className="text-3xl">{roster.emoji}</span>
                    <div>
                      <span className="text-xl block">{roster.name}</span>
                      <span className="text-sm opacity-70">{roster.description}</span>
                    </div>
                  </motion.button>
                ))}
              </div>

              <div className="flex gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleBack}
                  className="px-6 py-3 bg-white/10 rounded-full font-['Oswald'] tracking-wider flex items-center gap-2"
                >
                  <ChevronLeft className="w-5 h-5" />
                  BACK
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleNext}
                  className="px-8 py-3 bg-gradient-to-r from-[#007A33] to-[#005a25] rounded-full font-['Oswald'] tracking-wider flex items-center gap-2"
                >
                  NEXT
                  <ChevronRight className="w-5 h-5" />
                </motion.button>
              </div>
            </motion.div>
          )}

          {step === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="flex flex-col items-center w-full"
            >
              <div className="flex items-center gap-2 mb-6">
                <Clock className="w-6 h-6 text-[#BA9653]" />
                <p className="font-['Oswald'] text-2xl tracking-wider text-white/60">QUARTER LENGTH</p>
              </div>

              <div className="w-full max-w-md mb-8">
                <div className="bg-white/10 rounded-2xl p-6">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-4xl font-['Oswald'] text-[#007A33]">{quarterLength}</span>
                    <span className="text-xl text-white/60 font-['Oswald']">MINUTES / QUARTER</span>
                  </div>

                  <input
                    type="range"
                    min="1"
                    max="12"
                    value={quarterLength}
                    onChange={(e) => setQuarterLength(Number(e.target.value))}
                    className="w-full h-3 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#007A33]"
                  />

                  <div className="flex justify-between text-sm text-white/40 mt-2">
                    <span>1 min</span>
                    <span>6 min</span>
                    <span>12 min</span>
                  </div>
                </div>

                <p className="text-white/40 text-sm mt-4 text-center">
                  Total game time: {quarterLength * 4} minutes
                </p>
              </div>

              <div className="flex gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleBack}
                  className="px-6 py-3 bg-white/10 rounded-full font-['Oswald'] tracking-wider flex items-center gap-2"
                >
                  <ChevronLeft className="w-5 h-5" />
                  BACK
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onStart}
                  className="px-10 py-4 bg-gradient-to-r from-[#007A33] to-[#005a25] rounded-full font-['Oswald'] text-xl tracking-wider shadow-[0_0_40px_rgba(0,122,51,0.4)] hover:shadow-[0_0_60px_rgba(0,122,51,0.6)] flex items-center gap-2"
                >
                  <Play className="w-5 h-5 fill-current" />
                  LET'S GO CELTICS!
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {step !== 'start' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-2 mt-8"
          >
            {['difficulty', 'roster', 'settings'].map((s, i) => (
              <div
                key={s}
                className={`w-3 h-3 rounded-full transition-colors ${
                  step === s ? 'bg-[#007A33]' :
                  ['difficulty', 'roster', 'settings'].indexOf(step) > i ? 'bg-[#BA9653]' : 'bg-white/20'
                }`}
              />
            ))}
          </motion.div>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#007A33] to-transparent"
      />
    </div>
  )
}
