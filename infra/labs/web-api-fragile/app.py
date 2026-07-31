"""
Deliberately vulnerable order-management API for the Nyx lab "web-003 — L'API Fragile".

Two intentional flaws, matching the course "Sécurité des Applications et des API":
  1. BOLA (Broken Object Level Authorization) — GET /api/commandes/<id> never checks that the
     authenticated user owns the requested order; any authenticated user can read any order.
  2. JWT "alg: none" bypass — the hand-rolled token verifier below skips signature checking
     entirely when the token header declares "none", exactly the historical vulnerability class
     this lab teaches (a real JWT library like PyJWT rejects "none" by default; this app
     deliberately avoids that library's safety guard to reproduce the bug realistically).

Do not reuse this code anywhere outside this lab container.
"""

import base64
import json
import hashlib
import hmac
import time
from flask import Flask, request, jsonify

app = Flask(__name__)

SECRET = "s3cr3t-signing-key-do-not-reuse"
FLAG_BOLA = "FLAG{bola_object_exposed}"
FLAG_JWT = "FLAG{jwt_alg_none_forged}"

USERS = {
    "alice": {"password": "alice2024", "user_id": 42, "role": "user"},
    "bob": {"password": "bobrocks", "user_id": 43, "role": "user"},
}

COMMANDES = {
    42: {"id": 42, "owner_id": 42, "item": "Clavier mécanique", "montant": 89.99, "secret": "rien d'intéressant ici"},
    43: {"id": 43, "owner_id": 43, "item": "Licence logicielle entreprise", "montant": 4200.00, "secret": FLAG_BOLA},
}


def b64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode()


def b64url_decode(data: str) -> bytes:
    padding = "=" * (-len(data) % 4)
    return base64.urlsafe_b64decode(data + padding)


def issue_token(user_id: int, username: str, role: str) -> str:
    header = {"alg": "HS256", "typ": "JWT"}
    payload = {"user_id": user_id, "username": username, "role": role, "exp": int(time.time()) + 3600}
    signing_input = f"{b64url_encode(json.dumps(header).encode())}.{b64url_encode(json.dumps(payload).encode())}"
    signature = hmac.new(SECRET.encode(), signing_input.encode(), hashlib.sha256).digest()
    return f"{signing_input}.{b64url_encode(signature)}"


def decode_token(token: str):
    """Intentionally vulnerable verifier: trusts the header's declared algorithm."""
    try:
        header_b64, payload_b64, signature_b64 = token.split(".")
        header = json.loads(b64url_decode(header_b64))
        payload = json.loads(b64url_decode(payload_b64))
    except Exception:
        return None

    alg = header.get("alg", "")
    if alg.lower() == "none":
        # VULNERABILITY: no signature verification at all when alg is "none".
        return payload
    if alg == "HS256":
        signing_input = f"{header_b64}.{payload_b64}"
        expected_sig = hmac.new(SECRET.encode(), signing_input.encode(), hashlib.sha256).digest()
        if hmac.compare_digest(b64url_encode(expected_sig), signature_b64):
            return payload
        return None
    return None


def get_bearer_payload():
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        return None
    return decode_token(auth[len("Bearer ") :])


@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or {}
    username = data.get("username")
    password = data.get("password")
    user = USERS.get(username)
    if not user or user["password"] != password:
        return jsonify({"error": "invalid credentials"}), 401
    token = issue_token(user["user_id"], username, user["role"])
    return jsonify({"token": token})


@app.route("/api/commandes/<int:commande_id>", methods=["GET"])
def get_commande(commande_id):
    payload = get_bearer_payload()
    if not payload:
        return jsonify({"error": "unauthorized"}), 401

    # VULNERABILITY (BOLA): no check that `commande_id` belongs to payload["user_id"].
    commande = COMMANDES.get(commande_id)
    if not commande:
        return jsonify({"error": "not found"}), 404
    return jsonify(commande)


@app.route("/api/admin/secret", methods=["GET"])
def admin_secret():
    payload = get_bearer_payload()
    if not payload or payload.get("role") != "admin":
        return jsonify({"error": "forbidden"}), 403
    return jsonify({"flag": FLAG_JWT})


@app.route("/", methods=["GET"])
def index():
    return jsonify({"service": "commandes-api", "status": "ok"})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=80)
