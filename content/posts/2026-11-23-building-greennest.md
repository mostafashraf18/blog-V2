---
title: "Building GreenNest: Real-Time Plant Disease Detection with Deep Learning and Flutter"
summary: "How I designed, trained, and deployed a 99% accurate CNN model to diagnose plant diseases directly on mobile devices."
tags: ["Machine Learning", "Computer Vision", "Flutter", "Python"]
---

Plant diseases cause severe agricultural losses every year, often because farmers and growers lack immediate access to expert plant pathology diagnostics. Early detection can mean the difference between losing an entire crop and containing the infection with minimal treatment.

During my final year of study, I set out to build **GreenNest**—a cross-platform mobile application that allows anyone to point their smartphone camera at a damaged leaf and receive an instant, highly accurate disease diagnosis and treatment recommendation.

Here is a breakdown of how I designed the machine learning pipeline, trained the convolutional neural network (CNN), and deployed it to mobile devices with Flutter.

---

### 1. The Machine Learning Pipeline

Building a reliable computer vision classifier is 80% data engineering and 20% model tuning. Real-world photos taken in fields have uneven lighting, shadows, soil background clutter, and varying camera angles.

```
+--------------------+      +--------------------+      +---------------------+
| Image Acquisition  | ---> | Preprocessing &    | ---> | CNN Feature         |
| (PlantVillage Data)|      | Augmentation       |      | Extraction          |
+--------------------+      +--------------------+      +---------------------+
                                                                   │
                                                                   ▼
+--------------------+      +--------------------+      +---------------------+
| Treatment Engine   | <--- | Mobile Inference   | <--- | Quantization        |
| & Recommendations  |      | (Flutter + TFLite) |      | (TensorFlow Lite)   |
+--------------------+      +--------------------+      +---------------------+
```

#### Data Augmentation
To prevent overfitting and ensure the model generalizes well to diverse field conditions, I applied random transformations to training batches:
- Random rotations (-25° to +25°)
- Horizontal and vertical flips
- Brightness and contrast jittering
- Zoom and shear variations

```python
from tensorflow.keras.preprocessing.image import ImageDataGenerator

datagen = ImageDataGenerator(
    rescale=1.0 / 255,
    rotation_range=25,
    width_shift_range=0.15,
    height_shift_range=0.15,
    shear_range=0.15,
    zoom_range=0.15,
    horizontal_flip=True,
    fill_mode="nearest",
)
```

---

### 2. Model Architecture & Training

I experimented with several architectures, balancing model size against accuracy. Since the model needed to run inference on edge mobile devices without relying on slow internet connections in rural areas, keeping the parameter count lean was critical.

- **Base Architecture:** Transfer learning with MobileNetV2 and customized top classification layers.
- **Optimization:** Adam optimizer with categorical cross-entropy loss and learning rate decay (`ReduceLROnPlateau`).
- **Regularization:** Dropout (0.35) and Batch Normalization after convolutional blocks.

```python
import tensorflow as tf
from tensorflow.keras import layers, models

base_model = tf.keras.applications.MobileNetV2(
    input_shape=(224, 224, 3),
    include_top=False,
    weights="imagenet",
)
base_model.trainable = False  # Freeze base weights for initial epochs

model = models.Sequential([
    base_model,
    layers.GlobalAveragePooling2D(),
    layers.Dropout(0.35),
    layers.Dense(256, activation="relu"),
    layers.BatchNormalization(),
    layers.Dense(NUM_CLASSES, activation="softmax"),
])

model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=1e-3),
    loss="categorical_crossentropy",
    metrics=["accuracy"],
)
```

After fine-tuning the top layers and unfreezing the last 20 layers of the base model with a lower learning rate (`1e-5`), the model reached a **99% validation accuracy** across 38 distinct plant disease classes.

---

### 3. Deploying to Mobile with Flutter & TFLite

A high-accuracy model is useless if it sits in a Jupyter Notebook. To put it into users' hands:

1. **Quantization:** I converted the trained model to TensorFlow Lite (TFLite) using FP16 quantization, shrinking the file size from over 85MB down to under 12MB with zero perceptible drop in classification accuracy.
2. **On-Device Inference:** Using Flutter's `tflite_flutter` package, the entire inference executes directly on the smartphone's Neural Processing Unit / GPU in **under 85ms**:

```dart
// Flutter TFLite inference snippet
Future<List<Recognition>> runInference(File imageFile) async {
  var inputImage = await preprocessImage(imageFile);
  var outputBuffer = List.filled(numClasses, 0.0).reshape([1, numClasses]);
  
  _interpreter.run(inputImage, outputBuffer);
  
  return parseTopPredictions(outputBuffer[0]);
}
```

3. **Treatment Recommendation Engine:**
When a disease (such as Tomato Early Blight or Apple Scab) is identified with high confidence, GreenNest immediately queries an offline database of organic and chemical remediation guidelines, helping farmers take immediate corrective action.

---

### What's Next?

GreenNest demonstrated the power of bringing modern deep learning out of the cloud and into local edge devices. Moving forward, I plan to:
- Add multi-leaf multi-label segmentation using YOLOv8
- Support offline Arabic localization for regional farmers across North Africa and the Middle East
- Integrate real-time weather forecasts to predict disease outbreak probabilities before visible symptoms appear

If you are working on edge ML, computer vision, or mobile systems, feel free to reach out through my [contact page](/contact) or connect on [LinkedIn](https://linkedin.com/in/mostafaashraf23)!
