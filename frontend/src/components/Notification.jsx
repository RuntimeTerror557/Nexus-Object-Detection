/**
 * Notification.jsx
 * Transient toast notification shown when a new object is first detected.
 */
import { AnimatePresence, motion } from 'framer-motion'
import { TbBell } from 'react-icons/tb'

export default function Notification({ message, visible }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.96 }}
          transition={{ duration: 0.25 }}
          className="fixed bottom-6 right-6 z-50 glass border border-accent/30 rounded-xl px-4 py-3 flex items-center gap-3 glow-accent"
        >
          <TbBell className="text-accent text-lg" />
          <span className="text-sm font-mono text-text">{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
