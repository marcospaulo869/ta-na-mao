"""Backend tests for PDF endpoints (P0 fix validation)."""
import os
import requests
import pytest

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://sketch-toolkit-1.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@tudomaisfacil.com"
ADMIN_PWD = "admin123"


@pytest.fixture(scope="module")
def sess():
    s = requests.Session()
    r = s.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PWD})
    assert r.status_code == 200, f"login failed: {r.status_code} {r.text}"
    return s


@pytest.fixture(scope="module")
def wall_id(sess):
    # try to reuse existing
    walls = sess.get(f"{API}/walls").json()
    if walls:
        return walls[0]["id"]
    payload = {
        "nome": "TEST_wall_pdf",
        "altura_pe_direito": 260,
        "largura_total": 300,
        "portas": [], "janelas": [],
        "tomadas": [], "interruptores": [],
        "saidas_agua": [], "saidas_esgoto": [], "saidas_gas": [], "registros_agua": [],
    }
    r = sess.post(f"{API}/walls", json=payload)
    assert r.status_code in (200, 201), r.text
    return r.json()["id"]


@pytest.fixture(scope="module")
def project_id(sess, wall_id):
    projects = sess.get(f"{API}/projects").json()
    if projects:
        pid = projects[0]["id"]
    else:
        r = sess.post(f"{API}/projects", json={"nome": "TEST_proj_pdf", "cliente": "T"})
        assert r.status_code in (200, 201)
        pid = r.json()["id"]
    # attach wall (idempotent-ish)
    sess.post(f"{API}/projects/{pid}/walls/{wall_id}")
    return pid


def test_wall_pdf_returns_pdf(sess, wall_id):
    r = sess.get(f"{API}/walls/{wall_id}/pdf")
    assert r.status_code == 200, r.text[:400]
    assert r.headers.get("content-type", "").startswith("application/pdf")
    assert r.content[:4] == b"%PDF"
    assert "attachment" in r.headers.get("content-disposition", "").lower()


def test_wall_pdf_requires_auth(wall_id):
    r = requests.get(f"{API}/walls/{wall_id}/pdf")
    assert r.status_code in (401, 403)


def test_project_pdf_returns_pdf(sess, project_id):
    r = sess.get(f"{API}/projects/{project_id}/pdf")
    assert r.status_code == 200, r.text[:400]
    assert r.headers.get("content-type", "").startswith("application/pdf")
    assert r.content[:4] == b"%PDF"


def test_project_pdf_requires_auth(project_id):
    r = requests.get(f"{API}/projects/{project_id}/pdf")
    assert r.status_code in (401, 403)
