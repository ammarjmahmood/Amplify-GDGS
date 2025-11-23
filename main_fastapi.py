# main_fastapi.py

from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional
import io

from emotional_interface_module2 import predict_emotion_from_audio_bytes
from llm_compose_module4 import generate_sentence, synthesize_speech



app = FastAPI(
    title="AAC Emotion Communication API",
    description="Audio → emotion + icons → spoken sentence.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # lock down later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------- 1) Emotion analysis from audio ----------

@app.post("/analyze-emotion")
async def analyze_emotion(file: UploadFile = File(...)):
    """
    Frontend uploads recorded audio.
    Backend returns detected emotion + confidence.
    """
    audio_bytes = await file.read()
    raw_label, confidence = predict_emotion_from_audio_bytes(audio_bytes)
    simple_label = map_to_simple_emotion(raw_label)
    return {
        "raw_emotion": raw_label,
        "emotion": simple_label,
        "confidence": confidence,
    }


def map_to_simple_emotion(raw_label: str) -> str:
    rl = raw_label.lower()

    if "distress" in rl or "dysregulation" in rl or "sick" in rl:
        return "distressed"
    if "sad" in rl or "whine" in rl:
        return "sad"
    if "delighted" in rl or "laugh" in rl or "happy" in rl:
        return "happy"

    return "neutral"


# ---------- 2) Compose sentence + return audio ----------

class ComposeRequest(BaseModel):
    emotion: str           # e.g. "happy", "distressed"
    choices: List[str]     # e.g. ["home", "pizza", "mom"]
    context: Optional[str] = None  # reserved for SAM3D / vision in future


@app.post("/compose-and-speak")
async def compose_and_speak(body: ComposeRequest):
    """
    Caregiver presses one button: Generate & Speak.
    - input: emotion + choices (icon IDs)
    - output: TTS audio stream
    """
    sentence = generate_sentence(body.emotion, body.choices)

    # TODO: plug in real TTS
    audio_bytes, mime_type = synthesize_speech(sentence)

    return StreamingResponse(
        io.BytesIO(audio_bytes),
        media_type=mime_type,
        headers={"Content-Disposition": 'inline; filename="output.wav"'},
    )
