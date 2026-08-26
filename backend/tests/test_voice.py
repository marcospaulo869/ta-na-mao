"""Voice dictation endpoint tests (/api/voice/parse)."""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://sketch-toolkit-1.preview.emergentagent.com").rstrip("/")
ADMIN_EMAIL = "admin@tudomaisfacil.com"
ADMIN_PASSWORD = "admin123"
AUDIO_PATH = "/tmp/voice_test.webm"


@pytest.fixture(scope="module")
def admin_session():
    s = requests.Session()
    r = s.post(f"{BASE_URL}/api/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, f"login failed: {r.status_code} {r.text}"
    return s


class TestVoiceAuth:
    def test_requires_auth(self):
        assert os.path.exists(AUDIO_PATH), "voice_test.webm missing"
        with open(AUDIO_PATH, "rb") as f:
            r = requests.post(
                f"{BASE_URL}/api/voice/parse",
                files={"audio": ("voice.webm", f, "audio/webm")},
            )
        assert r.status_code == 401, f"expected 401, got {r.status_code}: {r.text[:200]}"


class TestVoiceParse:
    def test_parse_portuguese_wall_description(self, admin_session):
        assert os.path.exists(AUDIO_PATH)
        with open(AUDIO_PATH, "rb") as f:
            r = admin_session.post(
                f"{BASE_URL}/api/voice/parse",
                files={"audio": ("voice.webm", f, "audio/webm")},
                timeout=120,
            )
        assert r.status_code == 200, f"got {r.status_code}: {r.text[:500]}"
        data = r.json()
        assert "transcription" in data
        assert "parsed" in data
        assert "fields_captured" in data
        assert isinstance(data["parsed"], dict)
        print("TRANSCRIPTION:", data["transcription"])
        print("PARSED:", data["parsed"])

        parsed = data["parsed"]
        # Expected: pé direito 280, largura 420, 1 porta 80x210, 3 tomadas direito {30,110,130}
        assert parsed.get("altura_pe_direito") == 280, f"altura_pe_direito={parsed.get('altura_pe_direito')}"
        assert parsed.get("largura_total") == 420, f"largura_total={parsed.get('largura_total')}"

        portas = parsed.get("portas") or []
        assert len(portas) == 1, f"expected 1 porta, got {len(portas)}: {portas}"
        p = portas[0]
        assert p.get("largura_vao") == 80
        assert p.get("altura_vao") == 210

        tomadas = parsed.get("tomadas") or []
        assert len(tomadas) == 3, f"expected 3 tomadas, got {len(tomadas)}: {tomadas}"
        for t in tomadas:
            assert t.get("lado") == "direito", f"tomada lado={t.get('lado')}"
        alturas = sorted(int(t["altura_piso"]) for t in tomadas)
        assert alturas == [30, 110, 130], f"altura_piso set={alturas}"

    def test_no_hallucinated_fields(self, admin_session):
        """The audio never mentions janelas/vigas/colunas/etc — those should be absent or empty."""
        with open(AUDIO_PATH, "rb") as f:
            r = admin_session.post(
                f"{BASE_URL}/api/voice/parse",
                files={"audio": ("voice.webm", f, "audio/webm")},
                timeout=120,
            )
        assert r.status_code == 200
        parsed = r.json()["parsed"]
        for k in ("janelas", "vigas", "colunas", "interruptores", "saidas_agua",
                  "saidas_esgoto", "saidas_gas", "registros_agua"):
            v = parsed.get(k)
            assert v in (None, [], ...) or (isinstance(v, list) and len(v) == 0), \
                f"{k} should be missing/empty, got {v}"
        # altura/espessura rodape not mentioned
        assert parsed.get("altura_rodape") in (None, ...)
        assert parsed.get("espessura_rodape") in (None, ...)


class TestRegression:
    def test_walls_list(self, admin_session):
        r = admin_session.get(f"{BASE_URL}/api/walls")
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_projects_list(self, admin_session):
        r = admin_session.get(f"{BASE_URL}/api/projects")
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_payments_plans(self):
        r = requests.get(f"{BASE_URL}/api/payments/plans")
        assert r.status_code == 200
        plans = r.json()
        assert isinstance(plans, list) and len(plans) >= 1

    def test_auth_me(self, admin_session):
        r = admin_session.get(f"{BASE_URL}/api/auth/me")
        assert r.status_code == 200
        assert r.json()["email"] == ADMIN_EMAIL

    def test_wall_crud_and_pdf(self, admin_session):
        # create
        payload = {"nome": "TEST_voice_regression", "altura_pe_direito": 250, "largura_total": 300}
        c = admin_session.post(f"{BASE_URL}/api/walls", json=payload)
        assert c.status_code in (200, 201), c.text
        wid = c.json()["id"]
        # edit
        u = admin_session.put(f"{BASE_URL}/api/walls/{wid}", json={**payload, "altura_pe_direito": 260})
        assert u.status_code == 200
        assert u.json()["altura_pe_direito"] == 260
        # pdf
        p = admin_session.get(f"{BASE_URL}/api/walls/{wid}/pdf")
        assert p.status_code == 200
        assert p.content[:4] == b"%PDF"
        # delete
        d = admin_session.delete(f"{BASE_URL}/api/walls/{wid}")
        assert d.status_code in (200, 204)
