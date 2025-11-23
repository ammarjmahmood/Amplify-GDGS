import librosa
import numpy as np
from scipy.signal import butter, lfilter

# Configuration Constant
SR = 22050

def _basic_denoise(y: np.ndarray, sr: int) -> np.ndarray:
    """Applies a high-pass Butterworth filter for basic noise reduction."""
    cutoff_freq = 100
    nyq = 0.5 * sr
    normalized_cutoff = cutoff_freq / nyq
    b, a = butter(5, normalized_cutoff, btype='highpass', analog=False)
    return lfilter(b, a, y)

def normalize_and_trim(audioBlob: str, sr: int = SR) -> tuple[np.ndarray, int]:
    """
    Loads audio, normalizes volume, trims silence, and denoises.
    """
    try:
        # Load with original SR first
        y, original_sr = librosa.load(audioBlob, sr=None)

        # Resample if necessary
        if original_sr != sr:
            y = librosa.resample(y, orig_sr=original_sr, target_sr=sr)

        # Normalize (Volume)
        y = librosa.util.normalize(y)

        # Trim Silence (Top 20dB)
        y_trimmed, _ = librosa.effects.trim(y, top_db=20)

        # Denoise
        y_filtered = _basic_denoise(y_trimmed, sr)

        return y_filtered, sr

    except Exception as e:
        print(f"Error loading {audioBlob}: {e}")
        return np.array([]), sr
