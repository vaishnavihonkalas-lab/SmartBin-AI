# Smart Bin AI

Smart Bin AI is a browser-based waste image-classification demo. It loads a trained TensorFlow.js model in the browser and predicts the most likely category for an uploaded image.

## Features

- Upload or drag and drop a JPG, PNG or WEBP image
- Client-side inference using TensorFlow.js
- MobileNetV2-style image model with 224 × 224 input
- Top prediction plus a score for every model class
- Low-confidence guidance instead of presenting an uncertain result as fact
- Responsive interface with no application server or user-uploaded images

## Model classes

The supplied model metadata contains these seven labels:

`plastic`, `paper`, `metal`, `glass`, `nothing`, `Ewaste`, `cloth`

The model archive was exported from Teachable Machine as a TensorFlow.js Layers Model. The model is loaded from `model/model.json` and `model/weights.bin`.

## Run locally

Browsers block some model-file requests when an HTML file is opened directly with `file://`. Start a small local server from this directory:

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

No build step or API key is required. TensorFlow.js is loaded from jsDelivr, so an internet connection is needed unless the library is vendored locally.

## How it works

1. The selected image is resized to 224 × 224 pixels.
2. Pixel values are normalized to the range expected by the exported model.
3. The model returns a score for each class.
4. The interface sorts the scores and displays the highest-scoring class.

## Limitations

This is an image-classification prototype, not an automated physical sorting system. Predictions depend on the training data and image quality. The result should be treated as guidance, especially for unfamiliar, mixed, dirty or poorly lit objects. The app does not identify hazardous material or guarantee disposal safety.

The original training notebook, dataset, split details and training metrics were not included in the supplied model archive. Therefore this repository does not claim a new accuracy measurement.

## Suggested next steps

- Re-train with a documented dataset split and reproducible training script
- Add per-class precision, recall, F1 score and a confusion matrix
- Test with real-world images under varied lighting and backgrounds
- Add a backend or mobile deployment only after the model is validated

## License

Add the appropriate license and dataset/model attribution before publishing. Check the source and license of any Kaggle dataset used for training.
