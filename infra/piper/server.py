"""Petit serveur HTTP autour de Piper : POST /tts {text} -> audio/wav."""

import io
import os
import wave

from fastapi import FastAPI, HTTPException
from fastapi.responses import Response
from piper import PiperVoice, SynthesisConfig
from pydantic import BaseModel, Field

VOICE_NAME = os.environ.get("PIPER_VOICE", "fr_FR-siwis-medium")
voice = PiperVoice.load(f"/app/voices/{VOICE_NAME}.onnx")

# Réglages pour une lecture plus naturelle qu'avec les valeurs par défaut :
# - length_scale > 1 ralentit légèrement le débit (plus posé, plus clair pour un cours)
# - noise_scale / noise_w_scale ajoutent de la variation d'intonation et de rythme (moins monotone)
SYNTHESIS = SynthesisConfig(
    length_scale=float(os.environ.get("PIPER_LENGTH_SCALE", "1.08")),
    noise_scale=float(os.environ.get("PIPER_NOISE_SCALE", "0.667")),
    noise_w_scale=float(os.environ.get("PIPER_NOISE_W", "0.8")),
)
# Silence inséré entre deux phrases : Piper enchaîne sinon les phrases sans respirer.
SENTENCE_SILENCE_SECONDS = float(os.environ.get("PIPER_SENTENCE_SILENCE", "0.3"))

app = FastAPI()


class SpeakRequest(BaseModel):
    text: str = Field(min_length=1, max_length=4000)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "voice": VOICE_NAME}


@app.post("/tts")
def tts(req: SpeakRequest) -> Response:
    buffer = io.BytesIO()
    with wave.open(buffer, "wb") as wav_file:
        header_written = False
        silence = b""
        for chunk in voice.synthesize(req.text, syn_config=SYNTHESIS):
            if not header_written:
                wav_file.setnchannels(chunk.sample_channels)
                wav_file.setsampwidth(chunk.sample_width)
                wav_file.setframerate(chunk.sample_rate)
                frames = int(chunk.sample_rate * SENTENCE_SILENCE_SECONDS)
                silence = b"\x00" * frames * chunk.sample_width * chunk.sample_channels
                header_written = True
            else:
                wav_file.writeframes(silence)
            wav_file.writeframes(chunk.audio_int16_bytes)

        if not header_written:
            raise HTTPException(status_code=422, detail="Aucun contenu audio généré pour ce texte.")

    return Response(content=buffer.getvalue(), media_type="audio/wav")
