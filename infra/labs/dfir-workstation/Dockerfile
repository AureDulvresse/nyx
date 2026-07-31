# Serves pre-extracted forensic artifacts (prefetch exports, MACB timeline) over HTTP for the
# player to download and analyze from the Kali box, matching the "La Boîte à Souvenirs" lab
# narrative. A real Windows memory/disk image is out of scope for a lightweight lab container;
# these text-form artifacts reproduce the same investigative reasoning (prefetch run history,
# timeline correlation) with tools already in the kali-tools image (curl, grep, strings).
FROM nginx:alpine
RUN rm -rf /usr/share/nginx/html/*
COPY html/ /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
