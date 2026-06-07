"""
detector.py
-----------
YOLOv8 object detection module.
Loads the pretrained model and performs inference on video frames.
"""

from ultralytics import YOLO
import numpy as np

# COCO class names supported by YOLOv8
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
    """
    Wraps YOLOv8 inference.
    Returns bounding boxes, class names and confidence scores per frame.
    """

    def __init__(self, model_name: str = "yolov8n.pt", confidence_threshold: float = 0.4):
        # Load pretrained YOLOv8 nano model (downloads automatically on first run)
        self.model = YOLO(model_name)
        self.confidence_threshold = confidence_threshold
        self.class_filter = None  # None = detect all classes

    def set_confidence_threshold(self, threshold: float):
        """Dynamically update confidence threshold."""
        self.confidence_threshold = max(0.1, min(0.99, threshold))

    def set_class_filter(self, classes: list):
        """Filter to only detect specific classes. Pass None to detect all."""
        self.class_filter = classes if classes else None

    def detect(self, frame: np.ndarray) -> list:
        """
        Run YOLOv8 inference on a single BGR frame.

        Returns a list of dicts:
            {
                'bbox':       [x1, y1, x2, y2],  # pixel coords
                'class_name': str,
                'class_id':   int,
                'confidence': float (0-1)
            }
        """
        results = self.model(frame, verbose=False)[0]
        detections = []

        for box in results.boxes:
            confidence = float(box.conf[0])
            if confidence < self.confidence_threshold:
                continue

            class_id = int(box.cls[0])
            class_name = COCO_CLASSES[class_id] if class_id < len(COCO_CLASSES) else "unknown"

            # Apply optional class filter
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
