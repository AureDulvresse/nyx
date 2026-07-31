import io
import wave

from fastapi import FastAPI
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
    buffer = io.BytesIO()
    with wave.open(buffer, "wb") as wav_file:
        voice.synthesize(req.text, wav_file)
    return Response(content=buffer.getvalue(), media_type="audio/wav")
