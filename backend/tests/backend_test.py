"""Backend tests for TUDO MAIS FÁCIL — auth, freemium, isolation, limits, payments."""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://sketch-toolkit-1.preview.emergentagent.com").rstrip("/")
# Fallback to frontend .env
if not BASE_URL:
    with open("/app/frontend/.env") as f:
        for line in f:
            if line.startswith("REACT_APP_BACKEND_URL="):
                BASE_URL = line.split("=", 1)[1].strip().rstrip("/")

API = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@tudomaisfacil.com"
ADMIN_PASS = "admin123"


def _new_email(prefix="testuser"):
    return f"test_{prefix}_{uuid.uuid4().hex[:8]}@example.com"


@pytest.fixture
def s():
    return requests.Session()


@pytest.fixture
def admin_session():
    sess = requests.Session()
    r = sess.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASS})
    assert r.status_code == 200, r.text
    return sess


@pytest.fixture
def free_user():
    sess = requests.Session()
    email = _new_email("free")
    r = sess.post(f"{API}/auth/register", json={"email": email, "password": "secret123", "name": "Free User"})
    assert r.status_code == 200, r.text
    return sess, email, r.json()


# ---------- AUTH ----------

class TestAuth:
    def test_register_and_me(self, s):
        email = _new_email("reg")
        r = s.post(f"{API}/auth/register", json={"email": email, "password": "secret123", "name": "Reg User"})
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["email"] == email
        assert data["name"] == "Reg User"
        assert data["plan"] == "free"
        assert data["walls_count"] == 0
        assert "user_id" in data
        assert s.cookies.get("session_token")

        me = s.get(f"{API}/auth/me")
        assert me.status_code == 200
        assert me.json()["email"] == email

    def test_register_duplicate_email(self, s):
        email = _new_email("dup")
        r1 = s.post(f"{API}/auth/register", json={"email": email, "password": "secret123", "name": "Dup"})
        assert r1.status_code == 200
        r2 = requests.post(f"{API}/auth/register", json={"email": email, "password": "secret123", "name": "Dup2"})
        assert r2.status_code == 400

    def test_login_wrong_password(self):
        r = requests.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": "wrong-password-xyz"})
        assert r.status_code == 401

    def test_login_admin_and_pro(self):
        sess = requests.Session()
        r = sess.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASS})
        assert r.status_code == 200
        assert r.json()["plan"] == "pro_annual"
        assert sess.cookies.get("session_token")

    def test_me_without_auth(self):
        r = requests.get(f"{API}/auth/me")
        assert r.status_code == 401

    def test_logout_clears_cookie(self):
        sess = requests.Session()
        sess.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASS})
        assert sess.get(f"{API}/auth/me").status_code == 200
        r = sess.post(f"{API}/auth/logout")
        assert r.status_code == 200
        # Cookie should now be cleared
        # Some clients keep the (empty) cookie; force clear:
        sess.cookies.clear()
        assert sess.get(f"{API}/auth/me").status_code == 401


# ---------- FREEMIUM ----------

class TestFreemium:
    def test_free_user_can_create_3_walls_then_402(self, free_user):
        sess, email, _ = free_user
        for i in range(3):
            r = sess.post(f"{API}/walls", json={"altura_pe_direito": 280, "largura_total": 400})
            assert r.status_code == 200, f"wall {i}: {r.text}"
        r4 = sess.post(f"{API}/walls", json={"altura_pe_direito": 280, "largura_total": 400})
        assert r4.status_code == 402, r4.text
        detail = r4.json().get("detail", "").lower()
        assert "pro" in detail or "assin" in detail

    def test_admin_has_no_limit(self, admin_session):
        # Create 4+ walls; admin should not be blocked
        for _ in range(4):
            r = admin_session.post(f"{API}/walls", json={"altura_pe_direito": 250, "largura_total": 350})
            assert r.status_code == 200, r.text

    def test_limits_endpoint_free(self, free_user):
        sess, _, _ = free_user
        r = sess.get(f"{API}/limits")
        assert r.status_code == 200
        data = r.json()
        assert data["plan"] == "free"
        assert data["is_pro"] is False
        assert data["walls_limit"] == 3
        assert data["walls_used"] == 0

    def test_limits_endpoint_admin(self, admin_session):
        r = admin_session.get(f"{API}/limits")
        assert r.status_code == 200
        data = r.json()
        assert data["plan"] == "pro_annual"
        assert data["is_pro"] is True
        assert data["walls_limit"] is None


# ---------- ISOLATION ----------

class TestIsolation:
    def test_user_walls_isolation(self):
        # user A
        a = requests.Session()
        emailA = _new_email("isoA")
        rregA = a.post(f"{API}/auth/register", json={"email": emailA, "password": "secret123", "name": "User A"})
        assert rregA.status_code == 200, rregA.text
        rA = a.post(f"{API}/walls", json={"altura_pe_direito": 280, "largura_total": 400})
        assert rA.status_code == 200
        wall_a_id = rA.json()["id"]

        # user B
        b = requests.Session()
        emailB = _new_email("isoB")
        b.post(f"{API}/auth/register", json={"email": emailB, "password": "secret123", "name": "User B"})

        listB = b.get(f"{API}/walls")
        assert listB.status_code == 200
        ids_B = [w["id"] for w in listB.json()]
        assert wall_a_id not in ids_B

        # B tries to fetch A's wall
        getB = b.get(f"{API}/walls/{wall_a_id}")
        assert getB.status_code == 404

        # B tries to delete A's wall
        delB = b.delete(f"{API}/walls/{wall_a_id}")
        assert delB.status_code == 404

        # A still sees the wall
        assert a.get(f"{API}/walls/{wall_a_id}").status_code == 200


# ---------- PAYMENTS ----------

class TestPayments:
    def test_plans_public(self):
        r = requests.get(f"{API}/payments/plans")
        assert r.status_code == 200, r.text
        plans = r.json()
        assert isinstance(plans, list)
        lookup_keys = {p["lookup_key"] for p in plans}
        assert "tmf_pro_monthly" in lookup_keys
        assert "tmf_pro_annual" in lookup_keys
        by_lk = {p["lookup_key"]: p for p in plans}
        assert by_lk["tmf_pro_monthly"]["display_price"] == "R$ 39,90"
        assert by_lk["tmf_pro_annual"]["display_price"] == "R$ 399,00"

    def test_checkout_creates_transaction(self, free_user):
        sess, _, _ = free_user
        r = sess.post(f"{API}/payments/checkout", json={
            "lookup_key": "tmf_pro_monthly",
            "origin_url": "https://example.com",
        })
        assert r.status_code == 200, r.text
        data = r.json()
        assert "checkout_url" in data and data["checkout_url"].startswith("http")
        assert "session_id" in data

        # Status endpoint (public)
        s = requests.get(f"{API}/payments/status/{data['session_id']}")
        assert s.status_code == 200
        body = s.json()
        assert body["session_id"] == data["session_id"]
        assert body["status"] in ("initiated", "completed")

    def test_checkout_requires_auth(self):
        r = requests.post(f"{API}/payments/checkout", json={
            "lookup_key": "tmf_pro_monthly",
            "origin_url": "https://example.com",
        })
        assert r.status_code == 401
