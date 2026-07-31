FROM python:3.11-slim

RUN apt-get update && apt-get install -y --no-install-recommends wget && rm -rf /var/lib/apt/lists/*

WORKDIR /app

RUN pip install --no-cache-dir piper-tts fastapi "uvicorn[standard]"

# Voix française (Siwis, qualité medium) téléchargée à la construction de l'image —
# le conteneur démarre alors instantanément, sans dépendre du réseau au runtime.
RUN mkdir -p /app/voices && \
    wget -q -O /app/voices/fr_FR-siwis-medium.onnx \
      https://huggingface.co/rhasspy/piper-voices/resolve/main/fr/fr_FR/siwis/medium/fr_FR-siwis-medium.onnx && \
    wget -q -O /app/voices/fr_FR-siwis-medium.onnx.json \
      https://huggingface.co/rhasspy/piper-voices/resolve/main/fr/fr_FR/siwis/medium/fr_FR-siwis-medium.onnx.json

COPY server.py .

EXPOSE 8000
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8000"]
