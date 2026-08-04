FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y --no-install-recommends bash coreutils grep git jq && rm -rf /var/lib/apt/lists/*

WORKDIR /root
COPY data/ /root/data/

CMD ["/bin/bash"]
