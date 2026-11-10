FROM python:3.11-slim

# Voix française Piper (https://huggingface.co/rhasspy/piper-voices) — téléchargée à la construction
# pour que le conteneur démarre sans réseau. Autres voix FR : fr_FR-upmc-medium, fr_FR-tom-medium.
ARG PIPER_VOICE=fr_FR-siwis-medium
ARG VOICE_PATH=fr/fr_FR/siwis/medium

ENV PIPER_VOICE=${PIPER_VOICE} \
    PYTHONUNBUFFERED=1

WORKDIR /app

RUN pip install --no-cache-dir "piper-tts==1.3.0" "fastapi==0.115.6" "uvicorn==0.34.0"

ADD https://huggingface.co/rhasspy/piper-voices/resolve/main/${VOICE_PATH}/${PIPER_VOICE}.onnx /app/voices/
ADD https://huggingface.co/rhasspy/piper-voices/resolve/main/${VOICE_PATH}/${PIPER_VOICE}.onnx.json /app/voices/

COPY server.py .

EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')"
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8000"]
