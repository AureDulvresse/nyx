import io
import wave

from fastapi import FastAPI, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel
from piper import PiperVoice

app = FastAPI()
voice = PiperVoice.load("/app/voices/fr_FR-siwis-medium.onnx")


class SpeakRequest(BaseModel):
    text: str


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/tts")
def tts(req: SpeakRequest):
    # piper-tts synthesize() is a generator of AudioChunk objects (one per sentence), not a
    # function that writes a wave file directly — the wave header must be configured from the
    # first chunk's format before any frames can be written.
    buffer = io.BytesIO()
    with wave.open(buffer, "wb") as wav_file:
        header_written = False
        for chunk in voice.synthesize(req.text):
            if not header_written:
                wav_file.setnchannels(chunk.sample_channels)
                wav_file.setsampwidth(chunk.sample_width)
                wav_file.setframerate(chunk.sample_rate)
                header_written = True
            wav_file.writeframes(chunk.audio_int16_bytes)

        if not header_written:
            # No chunks at all (e.g. empty/whitespace-only text after cleanup) — a "valid" WAV
            # with zero audio frames plays inconsistently across browsers (some report
            # NotSupportedError instead of just a zero-length clip). Fail loudly instead so the
            # client shows a clear error rather than a cryptic playback failure.
            raise HTTPException(status_code=422, detail="Aucun contenu audio généré pour ce texte.")

    return Response(content=buffer.getvalue(), media_type="audio/wav")
