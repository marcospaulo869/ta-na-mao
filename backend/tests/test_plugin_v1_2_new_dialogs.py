"""Tests specific to Tudo Mais Fácil v1.2.0 — Lastro + Módulo plugins."""
import io
import os
import re
import zipfile
import subprocess
import tempfile
import requests
import pytest

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
RBZ_URL = f"{BASE_URL}/downloads/tudo_mais_facil.rbz"

REQUIRED_ENTRIES = {
    "tudo_mais_facil.rb",
    "tudo_mais_facil/lastro.rb",
    "tudo_mais_facil/modulo.rb",
    "tudo_mais_facil/main.rb",
    "tudo_mais_facil/ui/lastro.html",
    "tudo_mais_facil/ui/modulo.html",
    "tudo_mais_facil/ui/tmf.css",
}

MODULO_FIELD_IDS = [
    "f-altura", "f-largura", "f-profundidade",
    "f-espessura_chapa", "f-cor_chapa", "f-valor_chapa",
    "f-numero_portas", "f-tipo_puxador", "f-tipo_dobradica", "f-pos_usinagem_dobradica",
    "f-numero_prateleiras", "f-numero_divisorias",
    "f-numero_gavetas", "f-tipo_gaveta", "f-tipo_trilho",
    "f-comprimento_trilho", "f-valor_trilho",
    "f-espessura_estrutura_gaveta", "f-folga_gaveta",
    "f-espessura_fundo_gaveta", "f-espessura_fundo_modulo",
]

LASTRO_FIELD_IDS = ["f-comprimento", "f-altura", "f-espessura", "f-madeira", "f-valor"]

RB22_BAD_PATTERNS = [
    (r"\.dig\(", ".dig("),
    (r"&\.", "&. safe-nav"),
    (r"\.transform_values", ".transform_values"),
    (r"\.transform_keys", ".transform_keys"),
    (r"\.sum\b", ".sum"),
]


@pytest.fixture(scope="module")
def rbz_bytes():
    r = requests.get(RBZ_URL, timeout=15)
    assert r.status_code == 200, f"rbz download failed: {r.status_code}"
    return r.content


@pytest.fixture(scope="module")
def rbz_files(rbz_bytes):
    z = zipfile.ZipFile(io.BytesIO(rbz_bytes))
    return {name: z.read(name) for name in z.namelist()}


class TestRbzShape:
    def test_all_required_entries_present(self, rbz_files):
        missing = REQUIRED_ENTRIES - set(rbz_files.keys())
        assert not missing, f"missing entries: {missing}"

    def test_plugin_version_is_1_2_0(self, rbz_files):
        src = rbz_files["tudo_mais_facil.rb"].decode()
        m = re.search(r"PLUGIN_VERSION\s*=\s*'([^']+)'", src)
        assert m and m.group(1) == "1.2.0", f"got {m and m.group(1)}"


class TestRuby22Compat:
    def _rb_sources(self, rbz_files):
        return {n: rbz_files[n].decode() for n in rbz_files if n.endswith(".rb")}

    def test_no_ruby23_plus_syntax(self, rbz_files):
        offenders = []
        for name, src in self._rb_sources(rbz_files).items():
            for pat, label in RB22_BAD_PATTERNS:
                if re.search(pat, src):
                    offenders.append(f"{name}: {label}")
        assert not offenders, f"Ruby 2.2 incompat: {offenders}"

    def test_ruby_syntax_ok(self, rbz_files):
        with tempfile.TemporaryDirectory() as tmp:
            failures = []
            for name, src in self._rb_sources(rbz_files).items():
                p = os.path.join(tmp, name.replace("/", "_"))
                with open(p, "w") as f:
                    f.write(src)
                res = subprocess.run(["ruby", "-c", p], capture_output=True, text=True)
                if res.returncode != 0:
                    failures.append(f"{name}: {res.stderr}")
            assert not failures, failures


class TestLastroDialog:
    def test_lastro_html_contents(self, rbz_files):
        html = rbz_files["tudo_mais_facil/ui/lastro.html"].decode()
        assert "Lastro de Cozinha" in html
        assert "Gerar lastro no SketchUp" in html
        assert "Valor por metro linear" in html
        for fid in LASTRO_FIELD_IDS:
            assert f'id="{fid}"' in html, f"missing {fid}"
        assert "pinus_tratado" in html and "grapia" in html


class TestModuloDialog:
    def test_modulo_html_has_all_ids(self, rbz_files):
        html = rbz_files["tudo_mais_facil/ui/modulo.html"].decode()
        missing = [fid for fid in MODULO_FIELD_IDS if f'id="{fid}"' not in html]
        assert not missing, f"missing ids: {missing}"
        assert "Gerar módulo 3D no SketchUp" in html


class TestMainRbMenus:
    def test_menu_items_wired(self, rbz_files):
        src = rbz_files["tudo_mais_facil/main.rb"].decode()
        assert "Lastro de Cozinha" in src
        assert "Construtor de Módulos" in src
        assert "Lastro.show_wizard" in src
        assert "Modulo.show_wizard" in src


class TestPreviewMirrors:
    @pytest.mark.parametrize("path,marker", [
        ("/preview_plugin/lastro.html", "Lastro de Cozinha"),
        ("/preview_plugin/modulo.html", "Gerar módulo 3D no SketchUp"),
        ("/preview_plugin/tmf.css", "--gold"),  # rough marker; will fallback below
    ])
    def test_preview_available(self, path, marker):
        r = requests.get(f"{BASE_URL}{path}", timeout=15)
        assert r.status_code == 200, f"{path} -> {r.status_code}"
        # For css we only require 200 + non-empty
        if path.endswith(".css"):
            assert len(r.text) > 100
        else:
            assert marker in r.text, f"marker '{marker}' not in {path}"


class TestHomeCopy:
    def test_home_shipped_bundle_has_v1_2_text(self):
        # The Home.jsx is a React source; assert against the file on disk.
        src_path = "/app/frontend/src/pages/Home.jsx"
        with open(src_path) as f:
            src = f.read()
        assert "v1.2" in src, "Home.jsx missing v1.2"
        assert "PAREDES + LASTRO + MÓDULOS" in src
        assert "Lastro de Cozinha" in src
        assert "Construtor de Módulos" in src
        assert "INSTALAR EM 4 PASSOS (SKETCHUP 2018 – 2026)" in src or \
               "INSTALAR EM 4 PASSOS (SKETCHUP 2018 - 2026)" in src
