/**
 * App.jsx
 * Root component. Orchestrates layout, polling, and state management.
 */
import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'

import Navbar from './components/Navbar'
import VideoFeed from './components/VideoFeed'
import Dashboard from './components/Dashboard'
import DetectionTable from './components/DetectionTable'
import UploadVideo from './components/UploadVideo'
import Statistics from './components/Statistics'
import ControlPanel from './components/ControlPanel'
import Notification from './components/Notification'

import { getStats, getDetections } from './api'

const POLL_INTERVAL_MS = 800 // fetch stats & detections every 800ms

export default function App() {
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [stats, setStats] = useState({
    total_detections: 0,
    active_objects: 0,
    fps: 0,
    processing_time_ms: 0,
    avg_confidence: 0,
  })
  const [detections, setDetections] = useState([])
  const [notification, setNotification] = useState({ visible: false, message: '' })
  const prevActiveRef = useRef(0)
  const pollRef = useRef(null)

  // ---- Notification helper ----
  const notify = useCallback((msg) => {
    setNotification({ visible: true, message: msg })
    setTimeout(() => setNotification(n => ({ ...n, visible: false })), 3000)
  }, [])

  // ---- Polling logic ----
  useEffect(() => {
    const poll = async () => {
      if (!isRunning) return
      try {
        const [sRes, dRes] = await Promise.all([getStats(), getDetections(50)])
        const s = sRes.data
        const d = dRes.data

        setStats(s)
        setDetections(d)

        // Notify when new objects appear
        if (s.active_objects > prevActiveRef.current && s.active_objects > 0) {
          notify(`${s.active_objects} object${s.active_objects > 1 ? 's' : ''} detected`)
        }
        prevActiveRef.current = s.active_objects
      } catch (_) {}
    }

    if (isRunning) {
      poll()
      pollRef.current = setInterval(poll, POLL_INTERVAL_MS)
    } else {
      clearInterval(pollRef.current)
    }

    return () => clearInterval(pollRef.current)
  }, [isRunning, notify])

  // ---- State change handler from UploadVideo ----
  const handleStateChange = ({ running, paused }) => {
    setIsRunning(running)
    setIsPaused(paused)
    if (running) notify(paused ? 'Feed paused' : 'Detection started')
  }

  const handleClear = () => setDetections([])

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar isRunning={isRunning && !isPaused} />

      <main className="flex-1 p-4 md:p-6 max-w-[1600px] mx-auto w-full">
        {/* Page title */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="font-display font-extrabold text-3xl text-white tracking-tight">
            Real-Time Object Detection
            <span className="text-accent"> & Tracking</span>
          </h1>
          <p className="text-sm text-muted mt-1 font-mono">
            YOLOv8 · DeepSORT · Live MJPEG Stream
          </p>
        </motion.div>

        {/* Main two-column grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-4">

          {/* ---- Left: Video + Detection Table ---- */}
          <div className="flex flex-col gap-4">
            <VideoFeed
              isRunning={isRunning}
              isPaused={isPaused}
              onScreenshot={() => notify('Screenshot saved')}
            />
            <DetectionTable detections={detections} onClear={handleClear} />
          </div>

          {/* ---- Right: Controls + Stats ---- */}
          <div className="flex flex-col gap-4">
            <UploadVideo
              isRunning={isRunning}
              isPaused={isPaused}
              onStateChange={handleStateChange}
            />
            <Dashboard stats={stats} />
            <Statistics stats={stats} />
            <ControlPanel />
          </div>
        </div>
      </main>

      {/* Toast notifications */}
      <Notification visible={notification.visible} message={notification.message} />
    </div>
  )
}
