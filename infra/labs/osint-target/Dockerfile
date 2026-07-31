# Build stage: generate a placeholder JPEG and embed EXIF metadata containing the lab's first
# flag (Author/Comment fields) — exactly what a player is expected to extract with `exiftool`.
FROM python:3.12-slim AS build
RUN apt-get update && apt-get install -y --no-install-recommends libimage-exiftool-perl \
    && pip install --no-cache-dir pillow \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /build
COPY generate_photo.py .
RUN python generate_photo.py \
    && exiftool -overwrite_original \
         -Artist="Marc Dubois" \
         -Comment="FLAG{metadonnees_exposees}" \
         -Software="CorpFictive BadgePrinter v2" \
         badge.jpg

FROM nginx:alpine
RUN rm -rf /usr/share/nginx/html/*
COPY html/ /usr/share/nginx/html/
COPY --from=build /build/badge.jpg /usr/share/nginx/html/badge.jpg
EXPOSE 80
