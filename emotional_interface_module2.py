# emotion_inference.py

import io
import numpy as np
import joblib
import soundfile as sf

from feature_extraction import extract_features

# paths to Module 2 artifacts
BASE_DIR = r"C:\Users\rohan\OneDrive\Desktop\Datathon\models"
MODEL_PATH = BASE_DIR + r"\emotion_model.pkl"
SCALER_PATH = BASE_DIR + r"\scaler.pkl"

# load model + scaler once
emotion_model = joblib.load(MODEL_PATH)
scaler = joblib.load(SCALER_PATH)

def predict_emotion_from_audio_bytes(audio_bytes: bytes):
    # write bytes to buffer and read with soundfile
    data, sr = sf.read(io.BytesIO(audio_bytes))
    # if stereo, make mono
    if data.ndim > 1:
        data = np.mean(data, axis=1)

    # temp save to features using your pipeline
    # here we assume extract_features works with an ndarray+sr version
    # if extract_features expects a path, you can instead write to temp file;
    # but conceptually:
    # feature_vector = extract_features_from_array(data, sr)
    # for now, if your extract_features only takes paths, we’ll adapt later

    # assuming feature_extraction.extract_features(audio_path) for now:
    # for bytes → we normally round-trip through a temp file
    import tempfile, os
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
        sf.write(tmp.name, data, sr)
        temp_path = tmp.name

    try:
        feature_vector = extract_features(temp_path).reshape(1, -1)
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

    # scale + predict
    feature_scaled = scaler.transform(feature_vector)
    pred_label = emotion_model.predict(feature_scaled)[0]

    # optional: confidence
    if hasattr(emotion_model, "predict_proba"):
        proba = emotion_model.predict_proba(feature_scaled)[0]
        class_idx = list(emotion_model.classes_).index(pred_label)
        confidence = float(proba[class_idx])
    else:
        confidence = 0.0

    return pred_label, confidence
