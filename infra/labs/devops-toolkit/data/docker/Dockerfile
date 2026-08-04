FROM ubuntu:latest

RUN apt-get update && apt-get install -y curl openssh-server

ADD http://example-cdn.nyxcorp.io/releases/app-latest.tar.gz /app/
RUN tar -xzf /app/app-latest.tar.gz -C /app

USER root
EXPOSE 22
EXPOSE 8080

CMD ["/app/start.sh"]
