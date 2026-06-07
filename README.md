# NEXUS — Real-Time Object Detection & Tracking System

A full-stack AI dashboard combining **YOLOv8** object detection and **DeepSORT** tracking,
streamed live to a React frontend via MJPEG.

---

## Project Structure

```
project/
├── backend/
│   ├── app.py          # Flask entry point
│   ├── detector.py     # YOLOv8 inference wrapper
│   ├── tracker.py      # DeepSORT tracking wrapper
│   ├── routes.py       # API endpoints + frame generator
│   ├── requirements.txt
│   └── uploads/        # Uploaded video files (auto-created)
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── VideoFeed.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── DetectionTable.jsx
    │   │   ├── UploadVideo.jsx
    │   │   ├── Statistics.jsx
    │   │   ├── ControlPanel.jsx
    │   │   └── Notification.jsx
    │   ├── App.jsx
    │   ├── main.jsx
    │   ├── api.js
    │   └── index.css
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── tailwind.config.js
```

---

## Prerequisites

| Tool    | Version   |
|---------|-----------|
| Python  | 3.10+     |
| Node.js | 18+       |
| npm     | 9+        |
| Webcam  | Optional  |

> **GPU**: YOLOv8 works on CPU but runs much faster with a CUDA-enabled GPU.

---

## 1 — Backend Setup

```bash
cd project/backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the Flask server (port 5000)
python app.py
```

On first run, Ultralytics will automatically download `yolov8n.pt` (~6 MB).

---

## 2 — Frontend Setup

```bash
cd project/frontend

# Install Node dependencies
npm install

# Start the Vite dev server (port 3000)
npm run dev
```

Open **http://localhost:3000** in your browser.

---

## API Endpoints

| Method | Endpoint              | Description                        |
|--------|-----------------------|------------------------------------|
| POST   | `/start-webcam`       | Open webcam and start detection    |
| POST   | `/stop-feed`          | Stop video capture                 |
| POST   | `/pause-feed`         | Pause frame processing             |
| POST   | `/resume-feed`        | Resume frame processing            |
| POST   | `/upload-video`       | Upload `.mp4/.avi/.mov` file       |
| GET    | `/video-feed`         | MJPEG stream (consumed by `<img>`) |
| GET    | `/detection-stats`    | FPS, counts, confidence            |
| GET    | `/recent-detections`  | Last N detection records           |
| POST   | `/set-threshold`      | Update confidence threshold        |
| POST   | `/set-class-filter`   | Filter object classes              |
| GET    | `/export-csv`         | Download detection history as CSV  |
| POST   | `/clear-history`      | Clear detection log                |

---

## Usage

1. Click **Webcam** to start live detection, or **Upload Video** to process a file.
2. Adjust the **Confidence Threshold** slider to filter weak detections.
3. Use **Class Filter** chips to detect only specific object types.
4. Click **CSV** in the detection table header to export logs.
5. Click the camera icon on the video feed for a screenshot.

---

## Tips

- On CPU, lower resolution and the `yolov8n` (nano) model give the best FPS.
- For higher accuracy at the cost of speed, edit `detector.py` and change `"yolov8n.pt"` to `"yolov8s.pt"` or `"yolov8m.pt"`.
- The MJPEG stream is consumed directly by the `<img>` tag — no WebSocket needed.
