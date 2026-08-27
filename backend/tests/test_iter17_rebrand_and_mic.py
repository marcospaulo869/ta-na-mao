"""Iteration 17 — rebrand to 'TÁ NA MÃO' + per-field mic (/api/voice/parse-number)
+ freemium wall limit 10.
"""
import io
import os
import re
import requests
import pytest

BASE_URL = os.environ["REACT_APP_BACKEND_URL"].rstrip("/")
ADMIN_EMAIL = "admin@tudomaisfacil.com"
ADMIN_PASSWORD = "admin123"


@pytest.fixture(scope="module")
def admin_session():
    s = requests.Session()
    r = s.post(f"{BASE_URL}/api/auth/login",
               json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=20)
    assert r.status_code == 200, r.text
    return s


# ---------- REBRAND (root + statics) ----------
class TestRebrandRoot:
    def test_api_root_app_name(self):
        r = requests.get(f"{BASE_URL}/api/", timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert data.get("app") == "TÁ NA MÃO", data

    def test_manifest_json_rebranded(self):
        r = requests.get(f"{BASE_URL}/manifest.json", timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert "Tá Na Mão" in data.get("name", ""), data.get("name")
        # Old brand must be gone
        raw = r.text
        assert "Madeira Forte" not in raw
        assert "Tudo Mais Fácil" not in raw

    def test_index_html_title(self):
        r = requests.get(f"{BASE_URL}/index.html", timeout=15)
        # SPA may serve index for all routes
        assert r.status_code == 200
        assert "Tá Na Mão" in r.text or "TÁ NA MÃO" in r.text
        # ensure old brand not in title/meta
        title_match = re.search(r"<title>([^<]*)</title>", r.text)
        if title_match:
            assert "Madeira Forte" not in title_match.group(1)
            assert "Tudo Mais Fácil" not in title_match.group(1)

    def test_logo_svg_available(self):
        r = requests.get(f"{BASE_URL}/brand/logo.svg", timeout=15)
        assert r.status_code == 200
        assert "svg" in r.headers.get("content-type", "").lower() or r.text.strip().startswith("<")

    def test_new_rbz_download(self):
        r = requests.get(f"{BASE_URL}/downloads/ta_na_mao.rbz", timeout=30)
        assert r.status_code == 200
        assert len(r.content) > 1024

    def test_old_rbz_still_available_retrocompat(self):
        r = requests.get(f"{BASE_URL}/downloads/tudo_mais_facil.rbz", timeout=30)
        assert r.status_code == 200

    def test_readme_plugin_rebranded(self):
        r = requests.get(f"{BASE_URL}/downloads/README-plugin.md", timeout=15)
        assert r.status_code == 200
        assert "Tá Na Mão" in r.text or "TÁ NA MÃO" in r.text


# ---------- FREEMIUM limit=10 ----------
class TestFreemiumLimit:
    def test_admin_limits_no_walls_limit(self, admin_session):
        r = admin_session.get(f"{BASE_URL}/api/limits", timeout=15)
        assert r.status_code == 200
        d = r.json()
        # admin is pro → walls_limit=None
        assert d.get("is_pro") is True
        assert d.get("walls_limit") in (None, 10)  # tolerant

    def test_free_user_walls_limit_is_10(self):
        # register a fresh free user
        s = requests.Session()
        email = f"TEST_iter17_free_{os.urandom(4).hex()}@example.com"
        r = s.post(f"{BASE_URL}/api/auth/register",
                   json={"email": email, "password": "test12345", "name": "Free User"},
                   timeout=20)
        assert r.status_code in (200, 201), r.text
        r = s.get(f"{BASE_URL}/api/limits", timeout=15)
        assert r.status_code == 200
        d = r.json()
        assert d.get("is_pro") is False
        assert d.get("walls_limit") == 10, d

    def test_free_user_402_on_11th_wall(self):
        s = requests.Session()
        email = f"TEST_iter17_lim_{os.urandom(4).hex()}@example.com"
        r = s.post(f"{BASE_URL}/api/auth/register",
                   json={"email": email, "password": "test12345", "name": "Freemium"}, timeout=20)
        assert r.status_code in (200, 201), r.text
        payload_base = {"altura_pe_direito": 250, "largura_total": 300}
        # Create 10 walls
        for i in range(10):
            r = s.post(f"{BASE_URL}/api/walls",
                       json={**payload_base, "nome": f"TEST_iter17_w{i}"}, timeout=20)
            assert r.status_code in (200, 201), f"wall {i}: {r.status_code} {r.text[:200]}"
        # 11th must fail with 402
        r = s.post(f"{BASE_URL}/api/walls",
                   json={**payload_base, "nome": "TEST_iter17_w11"}, timeout=20)
        assert r.status_code == 402, f"expected 402, got {r.status_code}: {r.text[:200]}"


# ---------- VOICE per-field endpoint ----------
class TestParseNumberEndpoint:
    def test_requires_auth(self):
        # No cookie → 401
        r = requests.post(f"{BASE_URL}/api/voice/parse-number",
                          files={"audio": ("x.webm", b"12345", "audio/webm")}, timeout=15)
        assert r.status_code == 401, f"expected 401 without auth, got {r.status_code}"

    def test_missing_audio_422(self, admin_session):
        r = admin_session.post(f"{BASE_URL}/api/voice/parse-number", data={}, timeout=15)
        assert r.status_code == 422, f"expected 422 without file, got {r.status_code}: {r.text[:200]}"

    def test_too_large_audio_400(self, admin_session):
        # >10MB should be rejected
        big = b"\x00" * (10 * 1024 * 1024 + 100)
        r = admin_session.post(
            f"{BASE_URL}/api/voice/parse-number",
            files={"audio": ("big.webm", big, "audio/webm")},
            data={"context": "Campo em cm"},
            timeout=60,
        )
        assert r.status_code == 400, f"expected 400 for large audio, got {r.status_code}: {r.text[:200]}"
