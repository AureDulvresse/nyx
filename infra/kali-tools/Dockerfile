# Kali Rolling ships as a bare base image: no cached package lists, no pentest tools, no sudo.
# Building this once (instead of relying on `kalilinux/kali-rolling` directly) means every lab
# session starts with a working, ready-to-use toolkit instead of failing on `nmap: command not found`.
FROM kalilinux/kali-rolling

RUN apt-get update && apt-get install -y --no-install-recommends \
    nmap \
    hydra \
    sqlmap \
    gobuster \
    john \
    netcat-traditional \
    dnsutils \
    whois \
    iputils-ping \
    iproute2 \
    net-tools \
    curl \
    wget \
    tcpdump \
    python3 \
    python3-pip \
    python3-venv \
    git \
    vim \
    less \
    libimage-exiftool-perl \
    procps \
    ca-certificates \
    sudo \
    krb5-user \
    smbclient \
    ldap-utils \
    jq \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# impacket (GetUserSPNs.py, secretsdump.py, ...), bloodhound-python (AD collector) and volatility3
# (memory forensics) aren't packaged for Kali's apt repos in a reliably current form — installed
# via pip instead, in an isolated venv so they can't clash with the system's apt-managed Python.
# Putting the venv's bin/ on PATH (rather than hand-picking scripts to symlink) is deliberate:
# impacket's installed console-script names have changed across versions (e.g. `GetUserSPNs.py`
# directly vs. an `impacket-GetUserSPNs` prefix in others) — symlinking specific guessed names
# breaks silently (`ln -sf` doesn't fail on a missing source) whenever that naming shifts.
RUN python3 -m venv /opt/pyvenv \
    && /opt/pyvenv/bin/pip install --no-cache-dir impacket bloodhound volatility3 pyjwt
ENV PATH="/opt/pyvenv/bin:${PATH}"

WORKDIR /root
CMD ["/bin/bash"]
