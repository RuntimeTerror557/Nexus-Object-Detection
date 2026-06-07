"""
detector.py - Lazy-loading YOLOv8 to save startup memory
"""
import numpy as np

COCO_CLASSES = [
    "person", "bicycle", "car", "motorcycle", "airplane", "bus", "train",
    "truck", "boat", "traffic light", "fire hydrant", "stop sign",
    "parking meter", "bench", "bird", "cat", "dog", "horse", "sheep",
    "cow", "elephant", "bear", "zebra", "giraffe", "backpack", "umbrella",
    "handbag", "tie", "suitcase", "frisbee", "skis", "snowboard",
    "sports ball", "kite", "baseball bat", "baseball glove", "skateboard",
    "surfboard", "tennis racket", "bottle", "wine glass", "cup", "fork",
    "knife", "spoon", "bowl", "banana", "apple", "sandwich", "orange",
    "broccoli", "carrot", "hot dog", "pizza", "donut", "cake", "chair",
    "couch", "potted plant", "bed", "dining table", "toilet", "tv",
    "laptop", "mouse", "remote", "keyboard", "cell phone", "microwave",
    "oven", "toaster", "sink", "refrigerator", "book", "clock", "vase",
    "scissors", "teddy bear", "hair drier", "toothbrush"
]

class ObjectDetector:
    def __init__(self, model_name="yolov8n.pt", confidence_threshold=0.4):
        self.model_name = model_name
        self.confidence_threshold = confidence_threshold
        self.class_filter = None
        self._model = None  # lazy load

    def _get_model(self):
        """Load model only when first detection is requested."""
        if self._model is None:
            from ultralytics import YOLO
            self._model = YOLO(self.model_name)
        return self._model

    def set_confidence_threshold(self, threshold):
        self.confidence_threshold = max(0.1, min(0.99, threshold))

    def set_class_filter(self, classes):
        self.class_filter = classes if classes else None

    def detect(self, frame: np.ndarray) -> list:
        model = self._get_model()
        results = model(frame, verbose=False)[0]
        detections = []

        for box in results.boxes:
            confidence = float(box.conf[0])
            if confidence < self.confidence_threshold:
                continue

            class_id = int(box.cls[0])
            class_name = COCO_CLASSES[class_id] if class_id < len(COCO_CLASSES) else "unknown"

            if self.class_filter and class_name not in self.class_filter:
                continue

            x1, y1, x2, y2 = map(int, box.xyxy[0].tolist())
            detections.append({
                "bbox": [x1, y1, x2, y2],
                "class_name": class_name,
                "class_id": class_id,
                "confidence": round(confidence, 3),
            })

        return detections