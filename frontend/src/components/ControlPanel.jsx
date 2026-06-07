/**
 * ControlPanel.jsx
 * Confidence threshold slider and object class filter checkboxes.
 */
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TbAdjustments } from 'react-icons/tb'
import { setThreshold, setClassFilter } from '../api'

const COMMON_CLASSES = [
  'person','car','bicycle','motorcycle','bus','truck',
  'dog','cat','bird','bottle','chair','laptop','cell phone',
]

export default function ControlPanel() {
  const [threshold, setLocal] = useState(40)
  const [selected, setSelected] = useState([]) // empty = all classes

  // Debounce threshold update
  useEffect(() => {
    const t = setTimeout(() => setThreshold(threshold / 100), 400)
    return () => clearTimeout(t)
  }, [threshold])

  const toggleClass = async (cls) => {
    const next = selected.includes(cls)
      ? selected.filter(c => c !== cls)
      : [...selected, cls]
    setSelected(next)
    await setClassFilter(next)
  }

  const clearFilter = async () => {
    setSelected([])
    await setClassFilter([])
  }

  return (
    <div className="glass border border-border rounded-xl p-4">
      <div className="flex items-center gap-2 mb-4">
        <TbAdjustments className="text-accent" />
        <p className="text-xs font-mono text-muted uppercase tracking-wider">Detection Controls</p>
      </div>

      {/* Threshold slider */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-mono text-muted">Confidence Threshold</span>
          <span className="text-xs font-mono text-accent font-bold">{threshold}%</span>
        </div>
        <input
          type="range"
          min={10} max={95} step={5}
          value={threshold}
          onChange={e => setLocal(Number(e.target.value))}
          className="w-full accent-[#00e5ff] h-1 rounded-full cursor-pointer"
          style={{ accentColor: '#00e5ff' }}
        />
        <div className="flex justify-between text-[10px] font-mono text-muted/50 mt-1">
          <span>10%</span><span>95%</span>
        </div>
      </div>

      {/* Class filter */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-mono text-muted">Class Filter</span>
          {selected.length > 0 && (
            <button onClick={clearFilter} className="text-[10px] font-mono text-red hover:text-red/80">
              Clear All
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {COMMON_CLASSES.map(cls => {
            const active = selected.includes(cls)
            return (
              <motion.button
                key={cls}
                whileTap={{ scale: 0.94 }}
                onClick={() => toggleClass(cls)}
                className={`text-[10px] font-mono rounded px-2 py-0.5 border transition-colors ${
                  active
                    ? 'bg-accent/20 border-accent/50 text-accent'
                    : 'bg-transparent border-border text-muted hover:border-muted'
                }`}
              >
                {cls}
              </motion.button>
            )
          })}
        </div>
        <p className="text-[10px] font-mono text-muted/40 mt-2">
          {selected.length === 0 ? 'Detecting all classes' : `Filtering: ${selected.join(', ')}`}
        </p>
      </div>
    </div>
  )
}
