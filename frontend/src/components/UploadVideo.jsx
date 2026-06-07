/**
 * UploadVideo.jsx
 * Video source controls: webcam start/stop, file upload, pause/resume.
 */
import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import {
  TbVideo, TbVideoOff, TbPlayerPause, TbPlayerPlay, TbUpload, TbLoader,
} from 'react-icons/tb'
import { startWebcam, stopFeed, pauseFeed, resumeFeed, uploadVideo } from '../api'

export default function UploadVideo({ isRunning, isPaused, onStateChange }) {
  const fileRef = useRef(null)
  const [loading, setLoading] = useState(null) // 'webcam'|'upload'|null

  const call = async (fn, key, successState) => {
    setLoading(key)
    try {
      await fn()
      onStateChange(successState)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(null)
    }
  }

  const handleUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const fd = new FormData()
    fd.append('video', file)
    setLoading('upload')
    try {
      await uploadVideo(fd)
      onStateChange({ running: true, paused: false })
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(null)
      e.target.value = ''
    }
  }

  return (
    <div className="glass border border-border rounded-xl p-4">
      <p className="text-xs font-mono text-muted uppercase tracking-wider mb-3">
        Video Controls
      </p>

      <div className="grid grid-cols-2 gap-2">
        {/* Start Webcam */}
        <Btn
          onClick={() => call(startWebcam, 'webcam', { running: true, paused: false })}
          disabled={isRunning || loading}
          loading={loading === 'webcam'}
          color="accent"
          icon={<TbVideo />}
          label="Webcam"
        />

        {/* Stop */}
        <Btn
          onClick={() => call(stopFeed, 'stop', { running: false, paused: false })}
          disabled={!isRunning || loading}
          color="red"
          icon={<TbVideoOff />}
          label="Stop"
        />

        {/* Upload */}
        <Btn
          onClick={() => fileRef.current?.click()}
          disabled={loading}
          loading={loading === 'upload'}
          color="purple"
          icon={<TbUpload />}
          label="Upload Video"
        />

        {/* Pause / Resume */}
        {isPaused ? (
          <Btn
            onClick={() => call(resumeFeed, 'resume', { running: true, paused: false })}
            disabled={!isRunning || loading}
            color="green"
            icon={<TbPlayerPlay />}
            label="Resume"
          />
        ) : (
          <Btn
            onClick={() => call(pauseFeed, 'pause', { running: true, paused: true })}
            disabled={!isRunning || loading}
            color="amber"
            icon={<TbPlayerPause />}
            label="Pause"
          />
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileRef}
        type="file"
        accept=".mp4,.avi,.mov,.mkv"
        className="hidden"
        onChange={handleUpload}
      />
    </div>
  )
}

/* ---- small reusable button ---- */
const colorMap = {
  accent: 'border-accent/30 text-accent hover:bg-accent/10 disabled:opacity-30',
  red:    'border-red/30 text-red-400 hover:bg-red/10 disabled:opacity-30',
  green:  'border-green/30 text-green hover:bg-green/10 disabled:opacity-30',
  amber:  'border-amber-400/30 text-amber-400 hover:bg-amber-400/10 disabled:opacity-30',
  purple: 'border-purple-400/30 text-purple-400 hover:bg-purple-400/10 disabled:opacity-30',
}

function Btn({ onClick, disabled, loading, color = 'accent', icon, label }) {
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-2 border rounded-lg px-3 py-2.5 text-sm font-mono transition-colors ${colorMap[color]}`}
    >
      {loading ? <TbLoader className="animate-spin text-base" /> : <span className="text-base">{icon}</span>}
      <span>{label}</span>
    </motion.button>
  )
}
