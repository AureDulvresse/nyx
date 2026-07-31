# Serves the lab's raw log files over HTTP with directory listing enabled, so the player can
# download and grep them from the Kali attack box exactly as the lab/TP instructions describe.
FROM nginx:alpine
RUN rm -rf /usr/share/nginx/html/*
COPY auth.log proxy.log /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
