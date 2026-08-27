"""Iteration 10 — landing rebrand (no MADEIRA FORTE), hero photos, plugin v1.2.1 icons."""
import io
import os
import re
import zipfile
import requests
import pytest

BASE_URL = os.environ["REACT_APP_BACKEND_URL"].rstrip("/")


class TestHeroPhotos:
    def test_arquiteta_png(self):
        r = requests.get(f"{BASE_URL}/hero/arquiteta.png", timeout=30)
        assert r.status_code == 200
        assert r.headers.get("content-type", "").startswith("image/png")
        assert len(r.content) > 500 * 1024, f"file too small: {len(r.content)}"

    def test_marceneiro_png(self):
        r = requests.get(f"{BASE_URL}/hero/marceneiro.png", timeout=30)
        assert r.status_code == 200
        assert r.headers.get("content-type", "").startswith("image/png")
        assert len(r.content) > 500 * 1024, f"file too small: {len(r.content)}"


class TestLandingRebrand:
    @pytest.fixture(scope="class")
    def landing_html(self):
        # index.html for SPA, but Landing.jsx source is what carries these strings pre-build.
        # Instead, we can fetch the compiled JS; simpler: read the source file directly.
        with open("/app/frontend/src/pages/Landing.jsx", encoding="utf-8") as f:
            return f.read()

    def test_no_madeira_forte(self, landing_html):
        assert "MADEIRA FORTE" not in landing_html
        assert "REALIZANDO SONHOS" not in landing_html
        assert "TORRES/RS" not in landing_html

    def test_nav_brand_has_subtitle(self, landing_html):
        assert 'data-testid="nav-brand"' in landing_html
        assert "MEDIDAS · 3D · MARCENARIA" in landing_html

    def test_hero_photos_block(self, landing_html):
        assert 'data-testid="hero-photos"' in landing_html
        assert "/hero/arquiteta.png" in landing_html
        assert "/hero/marceneiro.png" in landing_html
        assert 'data-testid="hero-photo-arquiteta"' in landing_html
        assert 'data-testid="hero-photo-marceneiro"' in landing_html

    def test_hero_audience_prominence(self, landing_html):
        assert 'data-testid="hero-audience"' in landing_html
        # audience block contains the gold color class and font-bold
        block = landing_html.split('data-testid="hero-audience"')[1][:1200]
        assert "text-[#f3e5ab]" in block
        assert "font-bold" in block

    def test_footer_copyright(self, landing_html):
        assert "© 2026 · TUDO MAIS FÁCIL" in landing_html


class TestPluginV121:
    @pytest.fixture(scope="class")
    def rbz(self):
        r = requests.get(f"{BASE_URL}/downloads/tudo_mais_facil.rbz", timeout=30)
        assert r.status_code == 200
        return zipfile.ZipFile(io.BytesIO(r.content))

    def test_plugin_version_1_2_1(self, rbz):
        body = rbz.read("tudo_mais_facil.rb").decode("utf-8", "replace")
        m = re.search(r"PLUGIN_VERSION\s*=\s*['\"]([^'\"]+)['\"]", body)
        assert m and m.group(1) == "1.2.1", f"got {m and m.group(1)}"

    def test_new_icons_exist_and_nontrivial(self, rbz):
        for name in ("icon_main.png", "icon_lastro.png", "icon_modulo.png"):
            data = rbz.read(f"tudo_mais_facil/ui/{name}")
            assert len(data) > 3 * 1024, f"{name} too small: {len(data)}"

    def test_main_rb_references_new_icons(self, rbz):
        body = rbz.read("tudo_mais_facil/main.rb").decode("utf-8", "replace")
        assert "icon_lastro" in body
        assert "icon_modulo" in body

    def test_ruby_224_compat_all_rb(self, rbz):
        for info in rbz.infolist():
            if info.filename.endswith(".rb"):
                body = rbz.read(info.filename).decode("utf-8", "replace")
                assert ".dig(" not in body, f"{info.filename} uses .dig("
                assert not re.search(r"\.sum\b", body), f"{info.filename} uses .sum"
                assert "&." not in body, f"{info.filename} uses safe navigation &."
                assert "transform_" not in body, f"{info.filename} uses transform_"


# ---- backend regression: paredes_angulo still works ----
class TestParedesAnguloRegression:
    def test_walls_paredes_angulo_mm_export(self):
        s = requests.Session()
        r = s.post(f"{BASE_URL}/api/auth/login",
                   json={"email": "admin@tudomaisfacil.com", "password": "admin123"},
                   timeout=20)
        assert r.status_code == 200
        payload = {
            "nome": "TEST_iter10_angulo",
            "altura_pe_direito": 280,
            "largura_total": 400,
            "paredes_angulo": [{"comprimento": 150, "altura": 280, "angulo": 135}],
        }
        r = s.post(f"{BASE_URL}/api/walls", json=payload, timeout=20)
        assert r.status_code == 200, r.text
        wall_id = r.json()["id"]
        try:
            exp = s.get(f"{BASE_URL}/api/walls/{wall_id}/export", timeout=20).json()
            wall_exp = exp.get("wall", exp)
            pa = wall_exp["paredes_angulo"][0]
            assert pa["comprimento"] == 1500
            assert pa["altura"] == 2800
            assert pa["angulo"] == 135
        finally:
            s.delete(f"{BASE_URL}/api/walls/{wall_id}", timeout=20)
