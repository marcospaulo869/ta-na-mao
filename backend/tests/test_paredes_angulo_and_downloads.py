"""Iteration 7 — paredes_angulo roundtrip + static plugin downloads."""
import os
import json
import pytest
import requests

BASE_URL = os.environ["REACT_APP_BACKEND_URL"].rstrip("/")


@pytest.fixture(scope="module")
def auth_session():
    s = requests.Session()
    r = s.post(f"{BASE_URL}/api/auth/login",
               json={"email": "admin@tudomaisfacil.com", "password": "admin123"},
               timeout=20)
    assert r.status_code == 200, f"login failed: {r.status_code} {r.text}"
    # verify cookie/me
    me = s.get(f"{BASE_URL}/api/auth/me", timeout=20)
    assert me.status_code == 200
    return s


# ---- static plugin downloads ----
class TestPluginStatic:
    def test_rbz_download_non_empty(self):
        r = requests.get(f"{BASE_URL}/downloads/tudo_mais_facil.rbz", timeout=30)
        assert r.status_code == 200
        assert len(r.content) > 1000, f"rbz suspiciously small: {len(r.content)}"

    def test_readme_pt_br_content(self):
        r = requests.get(f"{BASE_URL}/downloads/README-plugin.md", timeout=30)
        assert r.status_code == 200
        body = r.text
        assert "Gerenciador de Extensões" in body
        assert "SketchUp 2018" in body
        assert "2026" in body

    def test_sample_json_has_paredes_angulo(self):
        r = requests.get(f"{BASE_URL}/downloads/parede_exemplo.tmf.json", timeout=30)
        assert r.status_code == 200
        data = r.json()
        angulos = data["wall"]["paredes_angulo"]
        assert isinstance(angulos, list) and len(angulos) >= 1
        item = angulos[0]
        assert {"comprimento", "altura", "angulo"} <= set(item.keys())


# ---- backend paredes_angulo roundtrip ----
class TestParedesAngulo:
    def test_create_and_export(self, auth_session):
        s = auth_session
        payload = {
            "nome": "TEST_paredes_angulo_iter7",
            "altura_pe_direito": 280,
            "largura_total": 400,
            "paredes_angulo": [
                {"comprimento": 150, "altura": 280, "angulo": 135}
            ],
        }
        r = s.post(f"{BASE_URL}/api/walls", json=payload, timeout=20)
        assert r.status_code == 200, f"{r.status_code} {r.text}"
        wall = r.json()
        assert "paredes_angulo" in wall
        assert len(wall["paredes_angulo"]) == 1
        pa = wall["paredes_angulo"][0]
        assert pa["comprimento"] == 150
        assert pa["altura"] == 280
        assert pa["angulo"] == 135
        wall_id = wall["id"]

        # GET verifies persistence
        r2 = s.get(f"{BASE_URL}/api/walls/{wall_id}", timeout=20)
        assert r2.status_code == 200
        assert r2.json()["paredes_angulo"][0]["angulo"] == 135

        # Export -> mm units (comprimento*10, altura*10, angulo unchanged)
        r3 = s.get(f"{BASE_URL}/api/walls/{wall_id}/export", timeout=20)
        assert r3.status_code == 200, f"{r3.status_code} {r3.text}"
        exp = r3.json()
        # export wraps wall inside 'wall' key based on format
        wall_exp = exp.get("wall", exp)
        assert "paredes_angulo" in wall_exp
        pa_exp = wall_exp["paredes_angulo"][0]
        assert pa_exp["comprimento"] == 1500, f"expected 1500 mm, got {pa_exp['comprimento']}"
        assert pa_exp["altura"] == 2800
        assert pa_exp["angulo"] == 135

        # cleanup
        s.delete(f"{BASE_URL}/api/walls/{wall_id}", timeout=20)



# ---- iteration 8: SketchUp 2018 compatibility inside .rbz ----
class TestRbzContents:
    def _fetch_rbz(self):
        r = requests.get(f"{BASE_URL}/downloads/tudo_mais_facil.rbz", timeout=30)
        assert r.status_code == 200
        assert len(r.content) > 8000, f"rbz too small: {len(r.content)}"
        return r.content

    def test_rbz_size(self):
        self._fetch_rbz()

    def test_plugin_version_bumped(self):
        import io, zipfile, re
        z = zipfile.ZipFile(io.BytesIO(self._fetch_rbz()))
        body = z.read("tudo_mais_facil.rb").decode("utf-8", "replace")
        m = re.search(r"PLUGIN_VERSION\s*=\s*['\"]([^'\"]+)['\"]", body)
        assert m and m.group(1) == "1.2.0", f"expected 1.2.0, got {m and m.group(1)}"

    def test_generator_no_dig_no_sum(self):
        import io, zipfile, re
        z = zipfile.ZipFile(io.BytesIO(self._fetch_rbz()))
        body = z.read("tudo_mais_facil/generator.rb").decode("utf-8", "replace")
        assert ".dig(" not in body, "generator.rb still uses .dig( (Ruby 2.3+)"
        assert not re.search(r"\.sum\b", body), "generator.rb still uses .sum (Ruby 2.4+)"
