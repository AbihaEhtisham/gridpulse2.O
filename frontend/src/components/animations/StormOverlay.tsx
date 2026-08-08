import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'

interface StormOverlayProps {
  isActive: boolean
  severity: number
}

export default function StormOverlay({ isActive, severity }: StormOverlayProps) {
  const [lightningBolts, setLightningBolts] = useState<{ id: number; x: number; delay: number; height: number }[]>([])
  const [phase, setPhase] = useState<'approaching' | 'active' | 'fading'>('approaching')

  useEffect(() => {
    if (isActive) {
      const bolts = Array.from({ length: 10 }, (_, i) => ({
        id: i,
        x: 10 + Math.random() * 80,
        delay: Math.random() * 3,
        height: 40 + Math.random() * 60,
      }))
      setLightningBolts(bolts)
      
      setPhase('approaching')
      const timer1 = setTimeout(() => setPhase('active'), 1800)
      const timer2 = setTimeout(() => setPhase('fading'), 4500)
      
      return () => {
        clearTimeout(timer1)
        clearTimeout(timer2)
      }
    } else {
      setLightningBolts([])
      setPhase('approaching')
    }
  }, [isActive])

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0 z-40 pointer-events-none overflow-hidden rounded-xl"
        >
{/* Dark overlay — chaotic flickering */}
<motion.div
  initial={{ opacity: 0 }}
  animate={{ 
    opacity: phase === 'approaching' 
      ? [0.3, 0.5, 0.25, 0.55, 0.35, 0.5, 0.3]
      : phase === 'active'
        ? [0.5, 0.75, 0.4, 0.8, 0.35, 0.7, 0.45, 0.8, 0.3, 0.65, 0.5]
        : [0.3, 0.4, 0.2, 0.3]
  }}
  transition={{ 
    duration: phase === 'approaching' ? 0.8 : phase === 'active' ? 0.4 : 0.6,
    repeat: Infinity,
    repeatType: 'reverse',
  }}
  className="absolute inset-0"
  style={{
    background: 'radial-gradient(ellipse at 30% 50%, #1a1a22 0%, #0d0d12 50%, #050508 100%)',
  }}
/>

          {/* Rumbling dark clouds — moving across */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={`cloud-${i}`}
              initial={{ x: '-100%', opacity: 0 }}
              animate={{ 
                x: '120%', 
                opacity: [0, 0.5, 0.6, 0.3, 0] 
              }}
              transition={{ 
                duration: 8 + i * 2, 
                delay: i * 1.2, 
                repeat: Infinity, 
                repeatDelay: 4 
              }}
              className="absolute h-full"
              style={{ 
                width: `${35 + i * 8}%`,
                top: `${-10 + i * 5}%`,
              }}
            >
              <div 
                className="w-full h-full"
                style={{
                  background: `radial-gradient(ellipse at ${30 + i * 10}% ${40 + i * 8}%, rgba(40,40,50,0.95) 0%, rgba(30,30,40,0.6) 40%, transparent 75%)`,
                  filter: 'blur(30px)',
                }}
              />
            </motion.div>
          ))}

          {/* Lightning bolts striking the city */}
          {lightningBolts.map(bolt => (
            <motion.div
              key={bolt.id}
              className="absolute"
              style={{ left: `${bolt.x}%`, top: '0%' }}
            >
              {/* Main bolt */}
              <motion.div
                initial={{ opacity: 0, scaleY: 0 }}
                animate={{ 
                  opacity: phase === 'approaching' ? [0, 0.2, 0] : [0, 1, 0, 0.8, 0],
                  scaleY: [0, 1, 0.9, 1, 0]
                }}
                transition={{
                  duration: phase === 'approaching' ? 2 : 0.2,
                  delay: bolt.delay,
                  repeat: Infinity,
                  repeatDelay: 0.8 + Math.random() * 3,
                }}
                style={{ transformOrigin: 'top center' }}
              >
                {/* White core */}
                <div
                  style={{
                    width: '3px',
                    height: `${bolt.height}%`,
                    background: 'linear-gradient(180deg, #FFFFFF 0%, #FFFDE7 20%, #FFF9C4 50%, #FFE082 80%, transparent 100%)',
                    boxShadow: '0 0 30px 10px rgba(255,255,255,0.9), 0 0 60px 20px rgba(255,235,150,0.6), 0 0 100px 40px rgba(255,200,50,0.3)',
                    filter: 'blur(0.5px)',
                    margin: '0 auto',
                  }}
                />
                
                {/* Branches */}
                {[...Array(4)].map((_, j) => (
                  <div
                    key={j}
                    className="absolute"
                    style={{
                      left: `${-8 + j * 6}px`,
                      top: `${15 + j * 18}%`,
                      width: '1.5px',
                      height: `${10 + Math.random() * 20}%`,
                      background: 'linear-gradient(180deg, #FFF9C4 0%, transparent 100%)',
                      boxShadow: '0 0 12px 4px rgba(255,235,150,0.7)',
                      transform: `rotate(${-25 + j * 18}deg)`,
                      transformOrigin: 'top center',
                    }}
                  />
                ))}
              </motion.div>
            </motion.div>
          ))}

          {/* Rain — only in active phase */}
          {phase === 'active' && (
            <div className="absolute inset-0">
              {[...Array(80)].map((_, i) => (
                <motion.div
                  key={`rain-${i}`}
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 650, opacity: [0, 0.4, 0.3, 0.1, 0] }}
                  transition={{
                    duration: 0.5 + Math.random() * 0.5,
                    delay: Math.random() * 2,
                    repeat: Infinity,
                    repeatDelay: Math.random() * 0.2,
                  }}
                  className="absolute"
                  style={{
                    left: `${Math.random() * 100}%`,
                    width: '1px',
                    height: `${12 + Math.random() * 30}px`,
                    background: 'linear-gradient(180deg, transparent 0%, rgba(180,195,220,0.7) 40%, rgba(140,160,200,0.4) 100%)',
                    transform: 'rotate(15deg)',
                  }}
                />
              ))}
            </div>
          )}

          {/* Warning banner — scrapped/torn look */}
          <motion.div
            initial={{ y: -120, opacity: 0 }}
            animate={{ 
              y: phase === 'fading' ? -120 : 20,
              opacity: phase === 'fading' ? 0 : 1
            }}
            transition={{ duration: 0.5, type: 'spring', stiffness: 200 }}
            className="absolute left-1/2 -translate-x-1/2"
          >
            <div className="relative">
              {/* Torn background */}
              <div className="relative px-10 py-3 text-white"
                style={{
                  background: 'linear-gradient(180deg, #3A3A45 0%, #2A2A35 50%, #3A3A45 100%)',
                  clipPath: 'polygon(3% 0%, 97% 0%, 100% 15%, 98% 50%, 100% 85%, 97% 100%, 3% 100%, 0% 85%, 2% 50%, 0% 15%)',
                  boxShadow: '0 4px 30px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
                }}
              >
                {/* Jagged edge overlay */}
                <div className="absolute top-0 left-0 right-0 h-1"
                  style={{
                    background: 'linear-gradient(90deg, #4A4A55 0%, #5A5A65 20%, #3A3A45 40%, #555 60%, #4A4A55 80%, #5A5A65 100%)',
                    clipPath: 'polygon(0% 0%, 3% 100%, 8% 0%, 12% 100%, 18% 0%, 22% 100%, 28% 0%, 33% 100%, 40% 0%, 45% 100%, 52% 0%, 58% 100%, 65% 0%, 70% 100%, 78% 0%, 83% 100%, 90% 0%, 95% 100%, 100% 0%)',
                  }}
                />
                
                <div className="flex items-center gap-4">
                  <span className="text-2xl"></span>
                  <div className="text-center">
                    <p className="text-base font-bold tracking-widest uppercase">
                      {phase === 'approaching' ? 'Storm Approaching' : 'Storm Active'}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      Severity {severity}% • {phase === 'approaching' ? 'Seeking cover...' : 'Infrastructure damage detected'}
                    </p>
                  </div>
                  <span className="text-2xl"></span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}