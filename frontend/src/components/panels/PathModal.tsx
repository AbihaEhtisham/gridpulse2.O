import { motion, AnimatePresence } from 'framer-motion'
import { X, MapPin, Target, ChevronDown, Zap } from 'lucide-react'
import type { Vertex } from '../../types/grid'
import { useState } from 'react'

interface PathModalProps {
  isOpen: boolean
  onClose: () => void
  source: Vertex | null
  target: Vertex | null
  selectedAlgorithm: string
  onAlgorithmChange: (algo: string) => void
  onFindPath: () => void
  algorithms: { id: string; name: string; description: string; icon: string }[]
}

export default function PathModal({
  isOpen, onClose, source, target, selectedAlgorithm,
  onAlgorithmChange, onFindPath, algorithms,
}: PathModalProps) {
  const [showAlgoDropdown, setShowAlgoDropdown] = useState(false)
  const selected = algorithms.find(a => a.id === selectedAlgorithm)

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[420px]"
          >
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-6 py-4 border-b border-amber-100 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">Find Path</h3>
                  <p className="text-xs text-gray-500">Select buildings and algorithm</p>
                </div>
                <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/60 transition-colors">
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-5">
                {/* Source */}
                <div>
                  <label className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    <MapPin className="w-3.5 h-3.5 text-green-600" />
                    Source Building
                  </label>
                  <div className={`
                    px-4 py-3 rounded-xl border-2 border-dashed transition-all
                    ${source 
                      ? 'border-green-300 bg-green-50' 
                      : 'border-gray-200 bg-gray-50'
                    }
                  `}>
                    {source ? (
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <span className="text-sm font-medium text-gray-800">{source.name}</span>
                        <span className="text-xs text-gray-400 ml-auto">ID: {source.id}</span>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400 text-center">Click a building on the map</p>
                    )}
                  </div>
                </div>

                {/* Target */}
                <div>
                  <label className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    <Target className="w-3.5 h-3.5 text-red-500" />
                    Target Building
                  </label>
                  <div className={`
                    px-4 py-3 rounded-xl border-2 border-dashed transition-all
                    ${target 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-gray-200 bg-gray-50'
                    }
                  `}>
                    {target ? (
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500" />
                        <span className="text-sm font-medium text-gray-800">{target.name}</span>
                        <span className="text-xs text-gray-400 ml-auto">ID: {target.id}</span>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400 text-center">Click a building on the map</p>
                    )}
                  </div>
                </div>

                {/* Algorithm Dropdown */}
                <div>
                  <label className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    Algorithm
                  </label>
                  <div className="relative">
                    <button
                      onClick={() => setShowAlgoDropdown(!showAlgoDropdown)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between hover:border-gray-300 transition-colors"
                    >
                      <span className="flex items-center gap-2 text-sm font-medium text-gray-800">
                        <span>{selected?.icon}</span>
                        {selected?.name}
                      </span>
                      <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showAlgoDropdown ? 'rotate-180' : ''}`} />
                    </button>

                    {showAlgoDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-10"
                      >
                        {algorithms.map(algo => (
                          <button
                            key={algo.id}
                            onClick={() => { onAlgorithmChange(algo.id); setShowAlgoDropdown(false) }}
                            className={`
                              w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3
                              ${selectedAlgorithm === algo.id ? 'bg-amber-50' : ''}
                            `}
                          >
                            <span className="text-lg">{algo.icon}</span>
                            <div>
                              <p className="text-sm font-medium text-gray-800">{algo.name}</p>
                              <p className="text-xs text-gray-400">{algo.description}</p>
                            </div>
                            {selectedAlgorithm === algo.id && (
                              <div className="ml-auto w-2 h-2 rounded-full bg-amber-500" />
                            )}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={onFindPath}
                  disabled={!source || !target}
                  className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl hover:from-amber-600 hover:to-orange-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                  Find Path
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}