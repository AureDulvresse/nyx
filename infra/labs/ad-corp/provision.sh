#!/bin/bash
set -e

REALM="CORP.LAB"
DOMAIN="CORP"
ADMIN_PASS="DomainAdmin2026!"
STATE_MARKER="/var/lib/samba/private/sam.ldb"

if [ ! -f "$STATE_MARKER" ]; then
  echo "[provision] First boot — provisioning domain ${REALM}..."

  rm -f /etc/krb5.conf /etc/samba/smb.conf
  echo "127.0.0.1 localhost" > /etc/hosts
  echo "127.0.0.1 dc01.corp.lab dc01" >> /etc/hosts

  samba-tool domain provision \
    --server-role=dc \
    --use-rfc2307 \
    --dns-backend=SAMBA_INTERNAL \
    --realm="$REALM" \
    --domain="$DOMAIN" \
    --adminpass="$ADMIN_PASS" \
    --option="dns forwarder=8.8.8.8"

  cp /var/lib/samba/private/krb5.conf /etc/krb5.conf

  # Samba's default `ldap server require strong auth` rejects LDAP binds that aren't signed/sealed.
  # Legitimate for production, but it also breaks several common attacker tools' Kerberos/NTLM LDAP
  # auth against Samba specifically (confirmed against impacket and bloodhound-python during
  # testing — both hit an interop failure that doesn't occur against real Windows AD). Relaxing
  # this lets the lab be attacked with plain LDAP simple binds, which every relevant tool supports.
  sed -i '/\[global\]/a\	ldap server require strong auth = no' /etc/samba/smb.conf

  echo "[provision] Creating lab accounts..."
  # Low-privilege account handed to the player out-of-band (see lab briefing).
  samba-tool user create labuser 'LabUser2024!' --given-name="Lab" --surname="User"

  # Kerberoastable service account: weak, wordlist-crackable password + an SPN.
  samba-tool user create svc-web 'Summer2024!' --given-name="Service" --surname="Web" --description="HTTP service account"
  samba-tool spn add HTTP/svc-web.corp.lab svc-web

  # A second service account that IS a Domain Admin — the eventual target of the attack path.
  samba-tool user create svc-backup 'Bckp#2026Long!' --given-name="Service" --surname="Backup" --description="Backup service account"
  samba-tool group addmembers "Domain Admins" svc-backup

  # HelpDesk group: labuser is a member, and — the misconfiguration — HelpDesk is granted
  # GenericAll over svc-backup. A real BloodHound-discoverable privilege escalation edge:
  # labuser -> (member of) -> HelpDesk -> (GenericAll) -> svc-backup -> (member of) -> Domain Admins.
  samba-tool group add HelpDesk
  samba-tool group addmembers HelpDesk labuser

  HELPDESK_SID=$(ldbsearch -H /var/lib/samba/private/sam.ldb \
    '(sAMAccountName=HelpDesk)' objectSid 2>/dev/null | grep '^objectSid:' | awk '{print $2}')
  echo "[provision] HelpDesk SID resolved to: ${HELPDESK_SID}"

  # samba-tool names the object's CN after --given-name/--surname ("Service Backup"), not the
  # sAMAccountName ("svc-backup") — look up the real DN instead of assuming CN=svc-backup.
  SVCBACKUP_DN=$(ldbsearch -H /var/lib/samba/private/sam.ldb \
    '(sAMAccountName=svc-backup)' dn 2>/dev/null | grep '^dn:' | head -1 | sed 's/^dn: //')
  echo "[provision] svc-backup DN resolved to: ${SVCBACKUP_DN}"

  if [ -n "$HELPDESK_SID" ] && [ -n "$SVCBACKUP_DN" ]; then
    samba-tool dsacl set \
      --objectdn="$SVCBACKUP_DN" \
      --sddl="(A;;GA;;;${HELPDESK_SID})"
    echo "[provision] Granted HelpDesk GenericAll over svc-backup."
  else
    echo "[provision] WARNING: could not resolve HelpDesk SID and/or svc-backup DN — ACL not applied." \
         "The Kerberoasting flag is unaffected, but the BloodHound privilege-escalation path will be incomplete." >&2
  fi

  echo "[provision] Domain provisioning complete."
else
  echo "[provision] Existing domain detected — skipping provisioning."
fi

echo "[provision] Starting Samba (AD DC mode)..."
exec /usr/sbin/samba --interactive --debuglevel=1
