"""
Verify the v1.2.2 icon bug fix in tudo_mais_facil.rbz.

Bug: main.rb resolved icon paths via TudoMaisFacil::PLUGIN_ROOT, which pointed
to the Plugins/ directory (parent of tudo_mais_facil.rb) instead of the
tudo_mais_facil/ subfolder — so SketchUp showed the fallback broken-file icon.

Fix: main.rb toolbar section now uses File.dirname(__FILE__) and each of the
4 toolbar commands has its own distinct icon pair (small_24 + large_48).
"""
import re
import zipfile

RBZ_PATH = "/app/frontend/public/downloads/tudo_mais_facil.rbz"


def _read(name):
    with zipfile.ZipFile(RBZ_PATH) as z:
        return z.read(name).decode("utf-8")


def _names():
    with zipfile.ZipFile(RBZ_PATH) as z:
        return z.namelist()


# --- (a) version bump ---
def test_plugin_version_is_1_2_2():
    src = _read("tudo_mais_facil.rb")
    assert re.search(r"PLUGIN_VERSION\s*=\s*['\"]1\.2\.2['\"]", src), \
        "PLUGIN_VERSION is not '1.2.2' in tudo_mais_facil.rb"


# --- (b) all 10 PNG icon files present and > 500 bytes ---
EXPECTED_PNGS = [
    "tudo_mais_facil/ui/icon_import_file.png",
    "tudo_mais_facil/ui/icon_import_file_24.png",
    "tudo_mais_facil/ui/icon_import_cloud.png",
    "tudo_mais_facil/ui/icon_import_cloud_24.png",
    "tudo_mais_facil/ui/icon_lastro.png",
    "tudo_mais_facil/ui/icon_lastro_24.png",
    "tudo_mais_facil/ui/icon_modulo.png",
    "tudo_mais_facil/ui/icon_modulo_24.png",
    "tudo_mais_facil/ui/icon_main.png",
    "tudo_mais_facil/ui/icon_main_24.png",
]


def test_all_10_png_icons_present_and_nontrivial():
    with zipfile.ZipFile(RBZ_PATH) as z:
        names = set(z.namelist())
        missing = [p for p in EXPECTED_PNGS if p not in names]
        assert not missing, f"Missing PNG icons: {missing}"
        undersized = []
        for p in EXPECTED_PNGS:
            size = z.getinfo(p).file_size
            if size <= 500:
                undersized.append(f"{p} ({size} bytes)")
        assert not undersized, f"PNG icons too small (likely empty/placeholder): {undersized}"


def test_pngs_have_valid_png_signature():
    sig = b"\x89PNG\r\n\x1a\n"
    with zipfile.ZipFile(RBZ_PATH) as z:
        bad = []
        for p in EXPECTED_PNGS:
            if not z.read(p).startswith(sig):
                bad.append(p)
        assert not bad, f"Files missing PNG signature: {bad}"


# --- (c) main.rb toolbar setup no longer references PLUGIN_ROOT ---
def test_main_rb_toolbar_uses_file_dirname_not_plugin_root():
    src = _read("tudo_mais_facil/main.rb")
    # Isolate toolbar setup block: from the Toolbar.new line to toolbar.show
    m = re.search(r"UI::Toolbar\.new.*?toolbar\.show", src, re.DOTALL)
    assert m, "Toolbar setup block not found in main.rb"
    block = m.group(0)
    # Strip Ruby line comments before checking (mentioning PLUGIN_ROOT in a
    # comment is fine; using it for a path is not).
    code_only = "\n".join(re.sub(r"#.*$", "", line) for line in block.splitlines())
    assert "PLUGIN_ROOT" not in code_only, \
        "main.rb toolbar block still references PLUGIN_ROOT (should use File.dirname(__FILE__))"
    assert "File.dirname(__FILE__)" in block, \
        "main.rb toolbar block must resolve icons via File.dirname(__FILE__)"


# --- (d) each command references its own icon (>= 2 refs each: small + large) ---
def test_each_command_uses_distinct_icon_pair():
    src = _read("tudo_mais_facil/main.rb")
    for base in ["icon_import_file", "icon_import_cloud", "icon_lastro", "icon_modulo"]:
        # Count references to either the 48px variant or the _24 variant.
        # Ruby snippet references e.g. 'icon_import_file.png' (large) and
        # 'icon_import_file_24.png' (small). Both should appear.
        count = len(re.findall(rf"{base}(?:_24)?\.png", src))
        assert count >= 2, \
            f"main.rb references '{base}' only {count} time(s); expected >= 2 (small + large)"


def test_all_four_commands_set_both_icons():
    src = _read("tudo_mais_facil/main.rb")
    for cmd in ["cmd_local", "cmd_cloud", "cmd_lastro", "cmd_modulo"]:
        assert re.search(rf"{cmd}\.small_icon\s*=", src), f"{cmd}.small_icon not assigned"
        assert re.search(rf"{cmd}\.large_icon\s*=", src), f"{cmd}.large_icon not assigned"


# --- (e) frontend RBZ served from /downloads/ ---
def test_rbz_size_reasonable():
    import os
    size = os.path.getsize(RBZ_PATH)
    assert 20_000 < size < 200_000, f"RBZ size unexpected: {size} bytes"
