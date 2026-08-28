"""Iter 18 — Estimador Rápido + Referências do Cliente."""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://sketch-toolkit-1.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"
ADMIN = {"email": "admin@tudomaisfacil.com", "password": "admin123"}


@pytest.fixture(scope="module")
def auth_session():
    s = requests.Session()
    r = s.post(f"{API}/auth/login", json=ADMIN, timeout=30)
    assert r.status_code == 200, f"login failed: {r.status_code} {r.text}"
    return s


@pytest.fixture(scope="module")
def project_id(auth_session):
    r = auth_session.post(f"{API}/projects", json={"nome": f"TEST_iter18_{uuid.uuid4().hex[:6]}"})
    assert r.status_code == 200
    pid = r.json()["id"]
    yield pid
    auth_session.delete(f"{API}/projects/{pid}")


# ---------- Estimator ----------

class TestEstimateCatalog:
    def test_catalog_no_auth_401(self):
        r = requests.get(f"{API}/estimate/catalog", timeout=15)
        assert r.status_code == 401

    def test_catalog_returns_6_modules_3_tiers(self, auth_session):
        r = auth_session.get(f"{API}/estimate/catalog")
        assert r.status_code == 200
        data = r.json()
        assert len(data["modules"]) == 6
        assert len(data["mdf_tiers"]) == 3
        module_ids = {m["id"] for m in data["modules"]}
        assert module_ids == {
            "prateleira", "mesa", "balcao_aberto",
            "balcao_portas_correr", "armario_completo", "painel_ripado",
        }
        tier_ids = {t["id"] for t in data["mdf_tiers"]}
        assert tier_ids == {"basico", "medio", "premium"}


class TestEstimateCalc:
    def test_leo_balcao_expected_prices(self, auth_session):
        payload = {
            "module": "balcao_portas_correr", "mdf_tier": "medio",
            "largura": 270, "altura": 90, "profundidade": 50, "qty": 1,
            "cliente_nome": "Léo",
        }
        r = auth_session.post(f"{API}/estimate", json=payload)
        assert r.status_code == 200
        data = r.json()
        # Expected: min≈5057, avg≈5619, max≈6743 (±1 for rounding)
        assert abs(data["min"] - 5057) < 2, f"min got {data['min']}"
        assert abs(data["avg"] - 5619) < 2, f"avg got {data['avg']}"
        assert abs(data["max"] - 6743) < 2, f"max got {data['max']}"
        assert "Léo" in data["whatsapp_text"]
        assert data["module_label"]
        assert data["mdf_label"]
        assert data["area_m2"] > 0
        assert data["material"] > 0
        assert data["labor"] > 0

    def test_no_auth_401(self):
        r = requests.post(f"{API}/estimate", json={
            "module": "prateleira", "largura": 100, "profundidade": 30,
        }, timeout=15)
        assert r.status_code == 401

    def test_painel_ripado_without_altura_400(self, auth_session):
        r = auth_session.post(f"{API}/estimate", json={
            "module": "painel_ripado", "largura": 200,
        })
        assert r.status_code == 400
        assert "altura" in r.text.lower()

    def test_prateleira_without_profundidade_400(self, auth_session):
        r = auth_session.post(f"{API}/estimate", json={
            "module": "prateleira", "largura": 100,
        })
        assert r.status_code == 400

    def test_mesa_without_altura_400(self, auth_session):
        r = auth_session.post(f"{API}/estimate", json={
            "module": "mesa", "largura": 100, "profundidade": 60,
        })
        assert r.status_code == 400

    def test_balcao_without_altura_400(self, auth_session):
        r = auth_session.post(f"{API}/estimate", json={
            "module": "balcao_aberto", "largura": 200, "profundidade": 50,
        })
        assert r.status_code == 400

    def test_armario_without_profundidade_400(self, auth_session):
        r = auth_session.post(f"{API}/estimate", json={
            "module": "armario_completo", "largura": 200, "altura": 240,
        })
        assert r.status_code == 400

    def test_largura_out_of_range_422(self, auth_session):
        r = auth_session.post(f"{API}/estimate", json={
            "module": "prateleira", "largura": 5, "profundidade": 30,
        })
        assert r.status_code == 422
        r2 = auth_session.post(f"{API}/estimate", json={
            "module": "prateleira", "largura": 1000, "profundidade": 30,
        })
        assert r2.status_code == 422


# ---------- Client References ----------

class TestClientReferences:
    def test_no_auth_401(self, project_id):
        r = requests.get(f"{API}/projects/{project_id}/references", timeout=15)
        assert r.status_code == 401

    def test_create_url_reference(self, auth_session, project_id):
        r = auth_session.post(f"{API}/projects/{project_id}/references", json={
            "kind": "url", "data": "https://example.com/ref1", "caption": "Ref GPT",
        })
        assert r.status_code == 200
        data = r.json()
        assert "id" in data
        assert data["kind"] == "url"
        assert data["data"] == "https://example.com/ref1"
        assert data["caption"] == "Ref GPT"
        assert "_id" not in data
        # Verify persistence
        rl = auth_session.get(f"{API}/projects/{project_id}/references")
        assert rl.status_code == 200
        refs = rl.json()
        assert any(x["id"] == data["id"] for x in refs)

    def test_list_order_newest_first(self, auth_session, project_id):
        # Add another ref
        auth_session.post(f"{API}/projects/{project_id}/references", json={
            "kind": "url", "data": "https://example.com/ref2",
        })
        r = auth_session.get(f"{API}/projects/{project_id}/references")
        assert r.status_code == 200
        refs = r.json()
        assert len(refs) >= 2
        # Ensure sorted desc by created_at
        times = [x["created_at"] for x in refs]
        assert times == sorted(times, reverse=True)

    def test_delete_reference(self, auth_session, project_id):
        create = auth_session.post(f"{API}/projects/{project_id}/references", json={
            "kind": "url", "data": "https://example.com/todel",
        }).json()
        r = auth_session.delete(f"{API}/projects/{project_id}/references/{create['id']}")
        assert r.status_code == 200
        assert r.json() == {"ok": True, "deleted": create["id"]}
        # Confirm gone
        rl = auth_session.get(f"{API}/projects/{project_id}/references").json()
        assert not any(x["id"] == create["id"] for x in rl)

    def test_invalid_kind_400(self, auth_session, project_id):
        r = auth_session.post(f"{API}/projects/{project_id}/references", json={
            "kind": "video", "data": "https://x.com",
        })
        assert r.status_code == 400

    def test_image_too_large_400(self, auth_session, project_id):
        big = "data:image/jpeg;base64," + ("A" * (8 * 1024 * 1024 + 100))
        r = auth_session.post(f"{API}/projects/{project_id}/references", json={
            "kind": "image", "data": big,
        })
        assert r.status_code == 400

    def test_other_users_project_404(self, auth_session):
        fake_pid = str(uuid.uuid4())
        r = auth_session.post(f"{API}/projects/{fake_pid}/references", json={
            "kind": "url", "data": "https://x.com",
        })
        assert r.status_code == 404


# ---------- Regression ----------

class TestRegression:
    def test_limits_endpoint(self, auth_session):
        r = auth_session.get(f"{API}/limits")
        assert r.status_code == 200
        data = r.json()
        assert "plan" in data and "walls_used" in data

    def test_root(self):
        r = requests.get(f"{API}/", timeout=10)
        assert r.status_code == 200
        assert r.json()["app"] == "TÁ NA MÃO"
