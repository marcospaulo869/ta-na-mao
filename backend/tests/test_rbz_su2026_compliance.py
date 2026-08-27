"""
SketchUp 2026 strict-loading compliance audit for tudo_mais_facil.rbz.
Static-file inspection only (no ruby exec).
"""
import os
import re
import zipfile

RBZ_PATH = "/app/frontend/public/downloads/tudo_mais_facil.rbz"


def test_rbz_exists():
    assert os.path.isfile(RBZ_PATH), f"RBZ archive missing: {RBZ_PATH}"


def _names():
    with zipfile.ZipFile(RBZ_PATH) as z:
        return z.namelist()


def test_only_one_top_level_rb_and_it_is_entry_point():
    top_rb = [n for n in _names() if n.endswith(".rb") and "/" not in n]
    assert top_rb == ["tudo_mais_facil.rb"], f"Unexpected top-level .rb: {top_rb}"


def test_entry_point_registers_extension():
    with zipfile.ZipFile(RBZ_PATH) as z:
        src = z.read("tudo_mais_facil.rb").decode("utf-8")
    assert "SketchupExtension.new(" in src, "Missing SketchupExtension.new("
    assert "Sketchup.register_extension(" in src, "Missing Sketchup.register_extension("


def test_submodules_nested_under_subfolder():
    expected = {"main.rb", "lastro.rb", "modulo.rb", "generator.rb", "loader.rb", "dialog.rb"}
    nested = {n.split("/", 1)[1] for n in _names()
              if n.startswith("tudo_mais_facil/") and n.endswith(".rb") and n.count("/") == 1}
    missing = expected - nested
    assert not missing, f"Missing submodules in tudo_mais_facil/: {missing}"


def test_no_stray_rb_files_at_root():
    stray = [n for n in _names() if n.endswith(".rb") and "/" not in n and n != "tudo_mais_facil.rb"]
    assert stray == [], f"Stray root-level .rb files (would trigger SU2026 warning): {stray}"


def test_main_rb_requires_each_submodule():
    with zipfile.ZipFile(RBZ_PATH) as z:
        src = z.read("tudo_mais_facil/main.rb").decode("utf-8")
    for mod in ["generator", "loader", "dialog", "lastro", "modulo"]:
        pattern = rf"require\s+File\.join\(File\.dirname\(__FILE__\),\s*['\"]{mod}['\"]\)"
        assert re.search(pattern, src), f"main.rb missing proper require for '{mod}'"


def test_ruby_22_backward_compatibility():
    """No .dig(, .sum\\b, safe-nav &., or Hash#transform_ in any .rb file."""
    bad_patterns = [
        (re.compile(r"\.dig\("), ".dig("),
        (re.compile(r"\.sum\b"), ".sum"),
        (re.compile(r"&\."), "&. (safe navigation)"),
        (re.compile(r"\.transform_"), ".transform_ (Hash#transform_*)"),
    ]
    offenders = []
    with zipfile.ZipFile(RBZ_PATH) as z:
        for name in z.namelist():
            if not name.endswith(".rb"):
                continue
            src = z.read(name).decode("utf-8", errors="replace")
            # strip line comments to reduce false positives
            stripped = "\n".join(re.sub(r"#.*$", "", line) for line in src.splitlines())
            for rx, label in bad_patterns:
                for m in rx.finditer(stripped):
                    line_no = stripped[:m.start()].count("\n") + 1
                    offenders.append(f"{name}:{line_no} -> {label}")
    assert not offenders, "Ruby 2.2 incompatible features found:\n" + "\n".join(offenders)
