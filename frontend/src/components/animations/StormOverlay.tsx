import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'

interface StormOverlayProps {
  isActive: boolean
  severity: number
}

export default function StormOverlay({ isActive, severity }: StormOverlayProps) {
  const [lightningFlashes, setLightningFlashes] = useState<{ id: number; x: number; y: number; delay: number }[]>([])

  useEffect(() => {
    if (isActive) {
      const flashes = Array.from({ length: 8 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 3,
      }))
      setLightningFlashes(flashes)
    } else {
      setLightningFlashes([])
    }
  }, [isActive])

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 z-40 pointer-events-none overflow-hidden rounded-xl"
        >
          {/* Dark overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.55 + severity * 0.003 }}
            className="absolute inset-0 bg-black"
          />

          {/* Storm spiral */}
          <motion.div
            initial={{ scale: 0, rotate: 0, opacity: 0 }}
            animate={{ scale: 1.5, rotate: 360, opacity: 0.3 }}
            transition={{ duration: 3, ease: 'easeInOut' }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          >
            <svg width="300" height="300" viewBox="0 0 300 300">
              <motion.path
                d="M150,150 Q180,120 200,150 Q220,180 180,200 Q140,220 160,250 Q180,280 150,280"
                fill="none"
                stroke="white"
                strokeWidth="3"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, ease: 'easeInOut' }}
              />
            </svg>
          </motion.div>

          {/* Lightning flashes */}
          {lightningFlashes.map(flash => (
            <motion.div
              key={flash.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.8, 0, 0.6, 0] }}
              transition={{
                duration: 0.3,
                delay: flash.delay,
                repeat: Infinity,
                repeatDelay: Math.random() * 2 + 1,
              }}
              className="absolute w-2 bg-yellow-300 rounded-full"
              style={{
                left: `${flash.x}%`,
                top: `${flash.y}%`,
                height: `${40 + Math.random() * 60}px`,
                filter: 'blur(1px)',
                boxShadow: '0 0 20px #FBBF24, 0 0 40px #F59E0B',
              }}
            />
          ))}

          {/* Rain lines */}
          {Array.from({ length: 30 }, (_, i) => (
            <motion.div
              key={`rain-${i}`}
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 600, opacity: [0, 0.6, 0] }}
              transition={{
                duration: 0.8,
                delay: Math.random() * 2,
                repeat: Infinity,
                repeatDelay: Math.random() * 0.5,
              }}
              className="absolute w-px bg-blue-200/40"
              style={{
                left: `${Math.random() * 100}%`,
                height: `${20 + Math.random() * 30}px`,
              }}
            />
          ))}

          {/* Warning text */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="absolute top-1/4 left-1/2 -translate-x-1/2 text-center"
          >
            <p className="text-white text-3xl font-bold drop-shadow-lg">🌪️ STORM ACTIVE</p>
            <p className="text-white/80 text-lg">Severity: {severity}%</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}