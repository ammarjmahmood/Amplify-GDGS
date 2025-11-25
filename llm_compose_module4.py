# llm_compose.py
from typing import List, Tuple

# Optional: map icon IDs to nicer phrases
ID_TO_PHRASE = {
    "home": "to go home",
    "park": "to go to the park",
    "pizza": "to eat pizza",
    "apple": "to eat an apple",
    "mom": "to be with mom",
    "dad": "to be with dad",
    "school": "to go to school",
    "bathroom": "to go to the washroom",
    "help": "to get help",
    # add more IDs from your VOCABULARY as needed
}


def choices_to_text(choices: List[str]) -> str:
    if not choices:
        return ""
    phrases = [ID_TO_PHRASE.get(ch, ch) for ch in choices]
    if len(phrases) == 1:
        return phrases[0]
    return ", ".join(phrases[:-1]) + " and " + phrases[-1]


def generate_sentence(emotion: str, choices: List[str]) -> str:
    """
    Compose a simple first-person sentence based on:
    - detected emotion (e.g. "happy", "distressed", "sad")
    - selected icon IDs (e.g. ["home", "pizza", "mom"])
    """
    emo = emotion.lower()
    what_i_want = choices_to_text(choices)

    if not what_i_want:
        return f"I feel {emo}."

    if emo in ["distressed", "sad", "upset", "angry"]:
        return f"I feel {emo} and I want {what_i_want}."
    elif emo in ["happy", "excited", "delighted"]:
        return f"I feel {emo} and I would like {what_i_want}."
    else:
        return f"I feel {emo} and I want {what_i_want}."


def synthesize_speech(sentence: str) -> Tuple[bytes, str]:
    """
    Placeholder TTS – text → audio bytes.

    For now this is just a stub. Later you can connect:
    - ElevenLabs
    - Azure / Google / Amazon TTS
    - or a local engine

    Must return:
      (audio_bytes, mime_type)
    e.g. (b"...", "audio/wav")
    """
    raise NotImplementedError("Connect this to your TTS provider and return (audio_bytes, mime_type).")
