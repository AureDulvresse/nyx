# A real Samba Active Directory Domain Controller, provisioned with a deliberately vulnerable
# object/ACL layout for the lab "ad-001 — Le Domaine Compromis": a Kerberoastable service
# account and a GenericAll edge from a low-privilege group to a Domain Admins member, both
# genuinely discoverable with impacket/BloodHound against a real AD-DC (not a simulation).
FROM ubuntu:24.04

ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y --no-install-recommends \
    samba \
    samba-ad-provision \
    samba-dsdb-modules \
    samba-vfs-modules \
    smbclient \
    ldb-tools \
    krb5-config \
    winbind \
    attr \
    dnsutils \
    iproute2 \
    && rm -rf /var/lib/apt/lists/*

COPY provision.sh /usr/local/bin/provision.sh
RUN chmod +x /usr/local/bin/provision.sh

EXPOSE 53/tcp 53/udp 88/tcp 88/udp 389/tcp 445/tcp 464/tcp 636/tcp 3268/tcp

ENTRYPOINT ["/usr/local/bin/provision.sh"]
