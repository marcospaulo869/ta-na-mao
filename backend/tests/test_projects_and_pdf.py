"""Iteration 5 tests: Projects CRUD, attach/detach, PDF for wall & project."""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
if not BASE_URL:
    with open("/app/frontend/.env") as f:
        for line in f:
            if line.startswith("REACT_APP_BACKEND_URL="):
                BASE_URL = line.split("=", 1)[1].strip().rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@tudomaisfacil.com"
ADMIN_PASS = "admin123"


def _new_email(prefix="proj"):
    return f"test_{prefix}_{uuid.uuid4().hex[:8]}@example.com"


@pytest.fixture
def admin():
    s = requests.Session()
    r = s.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASS})
    assert r.status_code == 200, r.text
    return s


@pytest.fixture
def other_user():
    s = requests.Session()
    email = _new_email("other")
    r = s.post(f"{API}/auth/register", json={"email": email, "password": "secret123", "name": "Other"})
    assert r.status_code == 200, r.text
    return s


# ---------- Projects CRUD ----------

class TestProjectsCRUD:
    def test_requires_auth(self):
        r = requests.get(f"{API}/projects")
        assert r.status_code == 401
        r = requests.post(f"{API}/projects", json={"nome": "X"})
        assert r.status_code == 401

    def test_create_get_update_delete(self, admin):
        # CREATE
        payload = {
            "nome": "TEST_Projeto Alfa",
            "cliente_nome": "Fulano da Silva",
            "cliente_telefone": "(51) 99999-0000",
            "endereco": "Rua Torres 100 - Torres/RS",
        }
        r = admin.post(f"{API}/projects", json=payload)
        assert r.status_code == 200, r.text
        proj = r.json()
        assert proj["nome"] == payload["nome"]
        assert proj["cliente_nome"] == payload["cliente_nome"]
        assert "id" in proj and "user_id" in proj
        pid = proj["id"]

        # GET list contains it
        r = admin.get(f"{API}/projects")
        assert r.status_code == 200
        assert any(p["id"] == pid for p in r.json())

        # GET detail (walls=[])
        r = admin.get(f"{API}/projects/{pid}")
        assert r.status_code == 200
        body = r.json()
        assert body["project"]["id"] == pid
        assert body["walls"] == []

        # UPDATE
        r = admin.put(f"{API}/projects/{pid}", json={"nome": "TEST_Projeto Alfa 2", "cliente_nome": "F"})
        assert r.status_code == 200
        assert r.json()["nome"] == "TEST_Projeto Alfa 2"

        # DELETE
        r = admin.delete(f"{API}/projects/{pid}")
        assert r.status_code == 200
        # Not found afterward
        assert admin.get(f"{API}/projects/{pid}").status_code == 404

    def test_isolation_per_user(self, admin, other_user):
        r = admin.post(f"{API}/projects", json={"nome": "TEST_Only Admin"})
        pid = r.json()["id"]

        # Other user cannot see
        r = other_user.get(f"{API}/projects")
        assert pid not in [p["id"] for p in r.json()]
        # Cannot GET
        assert other_user.get(f"{API}/projects/{pid}").status_code == 404
        # Cannot UPDATE
        assert other_user.put(f"{API}/projects/{pid}", json={"nome": "hax"}).status_code == 404
        # Cannot DELETE
        assert other_user.delete(f"{API}/projects/{pid}").status_code == 404

        admin.delete(f"{API}/projects/{pid}")


# ---------- Attach/Detach + Walls filter ----------

class TestAttachDetach:
    def test_attach_detach_flow(self, admin):
        # Create project
        pid = admin.post(f"{API}/projects", json={"nome": "TEST_Attach"}).json()["id"]
        # Create wall (without project)
        wall = admin.post(f"{API}/walls", json={"altura_pe_direito": 260, "largura_total": 300}).json()
        wid = wall["id"]
        assert wall.get("project_id") in (None, "")

        # Attach
        r = admin.post(f"{API}/projects/{pid}/walls/{wid}")
        assert r.status_code == 200

        # GET wall shows project_id
        w = admin.get(f"{API}/walls/{wid}").json()
        assert w["project_id"] == pid

        # Filter list by project_id
        r = admin.get(f"{API}/walls", params={"project_id": pid})
        assert r.status_code == 200
        ids = [x["id"] for x in r.json()]
        assert wid in ids
        # Every wall in list belongs to that project
        assert all(x["project_id"] == pid for x in r.json())

        # Project detail includes wall
        detail = admin.get(f"{API}/projects/{pid}").json()
        assert wid in [w["id"] for w in detail["walls"]]

        # Detach
        r = admin.delete(f"{API}/projects/{pid}/walls/{wid}")
        assert r.status_code == 200
        w = admin.get(f"{API}/walls/{wid}").json()
        assert w.get("project_id") in (None, "")

        # cleanup
        admin.delete(f"{API}/walls/{wid}")
        admin.delete(f"{API}/projects/{pid}")

    def test_attach_foreign_wall_returns_404(self, admin, other_user):
        pid = admin.post(f"{API}/projects", json={"nome": "TEST_ForeignAttach"}).json()["id"]
        # other creates a wall
        w = other_user.post(f"{API}/walls", json={}).json()
        r = admin.post(f"{API}/projects/{pid}/walls/{w['id']}")
        assert r.status_code == 404
        admin.delete(f"{API}/projects/{pid}")

    def test_attach_foreign_project_returns_404(self, admin, other_user):
        pid = admin.post(f"{API}/projects", json={"nome": "TEST_FP"}).json()["id"]
        w = other_user.post(f"{API}/walls", json={}).json()
        r = other_user.post(f"{API}/projects/{pid}/walls/{w['id']}")
        assert r.status_code == 404
        admin.delete(f"{API}/projects/{pid}")

    def test_delete_project_detaches_walls(self, admin):
        pid = admin.post(f"{API}/projects", json={"nome": "TEST_Detacher"}).json()["id"]
        w = admin.post(f"{API}/walls", json={"project_id": pid}).json()
        wid = w["id"]
        # verify saved with project_id
        assert admin.get(f"{API}/walls/{wid}").json()["project_id"] == pid

        # DELETE project
        r = admin.delete(f"{API}/projects/{pid}")
        assert r.status_code == 200

        # Wall still exists but without project_id
        w2 = admin.get(f"{API}/walls/{wid}")
        assert w2.status_code == 200
        assert w2.json().get("project_id") in (None, "")

        admin.delete(f"{API}/walls/{wid}")


# ---------- WallCreate accepts project_id ----------

class TestWallCreateWithProject:
    def test_wall_saves_project_id(self, admin):
        pid = admin.post(f"{API}/projects", json={"nome": "TEST_WCP"}).json()["id"]
        w = admin.post(f"{API}/walls", json={
            "project_id": pid, "altura_pe_direito": 270, "largura_total": 350,
        }).json()
        assert w["project_id"] == pid
        # cleanup
        admin.delete(f"{API}/walls/{w['id']}")
        admin.delete(f"{API}/projects/{pid}")


# ---------- PDF endpoints ----------

def _assert_pdf(response):
    assert response.status_code == 200, response.text[:400]
    assert response.headers.get("content-type", "").startswith("application/pdf"), response.headers
    cd = response.headers.get("content-disposition", "")
    assert "attachment" in cd.lower(), cd
    assert response.content[:4] == b"%PDF", f"bad magic: {response.content[:20]!r}"
    assert len(response.content) > 500, "PDF suspiciously small"


class TestWallPDF:
    def test_wall_pdf_ok(self, admin):
        w = admin.post(f"{API}/walls", json={
            "altura_pe_direito": 280, "largura_total": 400,
            "portas": [{"largura_vao": 80, "altura_vao": 210, "largura_vista": 5, "espessura_vista": 1.5}],
            "janelas": [{"largura_vista": 5, "largura_vao": 120, "altura_vao": 100}],
            "tomadas": [{"distancia_centro": 50, "lado": "direito", "altura_piso": 30}],
        }).json()
        r = admin.get(f"{API}/walls/{w['id']}/pdf")
        _assert_pdf(r)
        admin.delete(f"{API}/walls/{w['id']}")

    def test_wall_pdf_requires_auth(self, admin):
        w = admin.post(f"{API}/walls", json={}).json()
        r = requests.get(f"{API}/walls/{w['id']}/pdf")
        assert r.status_code == 401
        admin.delete(f"{API}/walls/{w['id']}")

    def test_wall_pdf_404_for_other_user(self, admin, other_user):
        w = admin.post(f"{API}/walls", json={}).json()
        r = other_user.get(f"{API}/walls/{w['id']}/pdf")
        assert r.status_code == 404
        admin.delete(f"{API}/walls/{w['id']}")


class TestProjectPDF:
    def test_project_pdf_ok_with_walls(self, admin):
        pid = admin.post(f"{API}/projects", json={
            "nome": "TEST_PdfProj",
            "cliente_nome": "Cliente Torres",
            "cliente_telefone": "51999990000",
            "endereco": "Torres/RS",
        }).json()["id"]
        w1 = admin.post(f"{API}/walls", json={"project_id": pid, "altura_pe_direito": 260, "largura_total": 300}).json()
        w2 = admin.post(f"{API}/walls", json={"project_id": pid, "altura_pe_direito": 270, "largura_total": 350}).json()
        r = admin.get(f"{API}/projects/{pid}/pdf")
        _assert_pdf(r)
        # cleanup
        admin.delete(f"{API}/walls/{w1['id']}")
        admin.delete(f"{API}/walls/{w2['id']}")
        admin.delete(f"{API}/projects/{pid}")

    def test_project_pdf_ok_no_walls(self, admin):
        pid = admin.post(f"{API}/projects", json={"nome": "TEST_PdfEmpty"}).json()["id"]
        r = admin.get(f"{API}/projects/{pid}/pdf")
        _assert_pdf(r)
        admin.delete(f"{API}/projects/{pid}")

    def test_project_pdf_404_for_other_user(self, admin, other_user):
        pid = admin.post(f"{API}/projects", json={"nome": "TEST_PdfIsol"}).json()["id"]
        r = other_user.get(f"{API}/projects/{pid}/pdf")
        assert r.status_code == 404
        admin.delete(f"{API}/projects/{pid}")

    def test_project_pdf_requires_auth(self, admin):
        pid = admin.post(f"{API}/projects", json={"nome": "TEST_PdfAuth"}).json()["id"]
        r = requests.get(f"{API}/projects/{pid}/pdf")
        assert r.status_code == 401
        admin.delete(f"{API}/projects/{pid}")
