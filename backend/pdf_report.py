"""PDF report generator for a Wall or a full Project.
Uses reportlab. Elegant black/gold theme mirroring the app.
"""
from __future__ import annotations

from io import BytesIO
from datetime import datetime
from typing import Optional
import base64

from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import mm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, Image, KeepTogether,
)
from reportlab.lib.enums import TA_LEFT, TA_CENTER
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

BLACK = colors.HexColor("#0a0a08")
GOLD = colors.HexColor("#d4af37")
LIGHT_GOLD = colors.HexColor("#f3e5ab")
MUTED = colors.HexColor("#7a7a70")
SURFACE = colors.HexColor("#12120f")
LINE = colors.HexColor("#3a3a30")


def _styles():
    ss = getSampleStyleSheet()
    return {
        "brand": ParagraphStyle(
            "brand", parent=ss["Title"], fontName="Helvetica-Bold",
            fontSize=22, leading=24, textColor=GOLD, alignment=TA_CENTER, spaceAfter=2,
        ),
        "brand_sub": ParagraphStyle(
            "brand_sub", parent=ss["Normal"], fontName="Helvetica",
            fontSize=7, leading=10, textColor=MUTED, alignment=TA_CENTER,
            spaceAfter=6,
        ),
        "h1": ParagraphStyle(
            "h1", parent=ss["Heading1"], fontName="Helvetica-Bold", fontSize=18,
            textColor=GOLD, spaceBefore=4, spaceAfter=6,
        ),
        "h2": ParagraphStyle(
            "h2", parent=ss["Heading2"], fontName="Helvetica-Bold", fontSize=13,
            textColor=colors.white, spaceBefore=10, spaceAfter=4,
        ),
        "tag": ParagraphStyle(
            "tag", parent=ss["Normal"], fontName="Courier-Bold", fontSize=7,
            textColor=GOLD, spaceAfter=2,
        ),
        "body": ParagraphStyle(
            "body", parent=ss["Normal"], fontName="Helvetica", fontSize=10,
            textColor=colors.white, leading=14, spaceAfter=2,
        ),
        "muted": ParagraphStyle(
            "muted", parent=ss["Normal"], fontName="Helvetica", fontSize=9,
            textColor=MUTED, leading=12,
        ),
        "small": ParagraphStyle(
            "small", parent=ss["Normal"], fontName="Courier", fontSize=8,
            textColor=MUTED,
        ),
    }


def _draw_page_frame(canvas, doc):
    """Black background + gold border/logo on each page."""
    canvas.saveState()
    # Full-page black background
    canvas.setFillColor(BLACK)
    canvas.rect(0, 0, A4[0], A4[1], fill=1, stroke=0)
    # Top gold rule
    canvas.setStrokeColor(GOLD)
    canvas.setLineWidth(0.6)
    canvas.line(15 * mm, A4[1] - 12 * mm, A4[0] - 15 * mm, A4[1] - 12 * mm)
    # Bottom gold rule + footer text
    canvas.line(15 * mm, 15 * mm, A4[0] - 15 * mm, 15 * mm)
    canvas.setFillColor(MUTED)
    canvas.setFont("Courier", 7)
    canvas.drawCentredString(A4[0] / 2, 10 * mm,
                             "TÁ NA MÃO  ·  MEDIDAS EM UM TOQUE  ·  MEDIDAS · 3D · MARCENARIA")
    canvas.setFillColor(GOLD)
    canvas.setFont("Courier-Bold", 7)
    canvas.drawRightString(A4[0] - 15 * mm, 10 * mm, f"P. {doc.page:02d}")
    canvas.restoreState()


def _hex_to_reportlab_color(hex_str: Optional[str]):
    if not hex_str:
        return colors.HexColor("#333333")
    try:
        return colors.HexColor(hex_str)
    except Exception:
        return colors.HexColor("#333333")


def _kv_table(rows, col_widths=(60 * mm, 60 * mm)):
    """Build a two-column key/value table with the brand style."""
    tbl = Table(rows, colWidths=col_widths, hAlign="LEFT")
    tbl.setStyle(TableStyle([
        ("FONTNAME", (0, 0), (-1, -1), "Helvetica"),
        ("FONTSIZE", (0, 0), (-1, -1), 9.5),
        ("TEXTCOLOR", (0, 0), (0, -1), MUTED),
        ("TEXTCOLOR", (1, 0), (1, -1), colors.white),
        ("FONTNAME", (1, 0), (1, -1), "Courier"),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("TOPPADDING", (0, 0), (-1, -1), 2),
        ("LINEBELOW", (0, 0), (-1, -1), 0.2, LINE),
    ]))
    return tbl


def _wall_kv_rows(wall: dict) -> list:
    rows = [
        ("Pé direito", f"{wall.get('altura_pe_direito', '-')} cm"),
        ("Largura da parede", f"{wall.get('largura_total', '-')} cm"),
        ("Rodapé (altura × espessura)",
         f"{wall.get('altura_rodape','-')} cm × {wall.get('espessura_rodape','-')} cm"),
    ]
    if wall.get("colunas"):
        rows.append((f"Colunas ({len(wall['colunas'])})",
                    ", ".join(f"{c['largura']}×{c['profundidade']}cm" for c in wall["colunas"])))
    if wall.get("vigas"):
        rows.append((f"Vigas ({len(wall['vigas'])})",
                    ", ".join(f"{v['altura']}×{v['largura']}cm" for v in wall["vigas"])))
    return rows


def _openings_table(wall: dict, styles):
    portas = wall.get("portas", [])
    janelas = wall.get("janelas", [])
    if not portas and not janelas:
        return None
    data = [["#", "Tipo", "Largura vão", "Altura vão", "Vista"]]
    for i, p in enumerate(portas, 1):
        data.append([str(i), "Porta",
                     f"{p['largura_vao']} cm", f"{p['altura_vao']} cm",
                     f"{p.get('largura_vista', 0)}×{p.get('espessura_vista', 0)} cm"])
    for i, j in enumerate(janelas, 1):
        data.append([str(len(portas) + i), "Janela",
                     f"{j['largura_vao']} cm", f"{j['altura_vao']} cm",
                     f"vista {j.get('largura_vista', 0)} cm"])
    tbl = Table(data, colWidths=[8 * mm, 22 * mm, 30 * mm, 30 * mm, 42 * mm], hAlign="LEFT")
    tbl.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), SURFACE),
        ("TEXTCOLOR", (0, 0), (-1, 0), GOLD),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("FONTNAME", (0, 1), (-1, -1), "Courier"),
        ("TEXTCOLOR", (0, 1), (-1, -1), colors.white),
        ("LINEBELOW", (0, 0), (-1, -1), 0.2, LINE),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
    ]))
    return tbl


def _pontos_tables(wall: dict):
    """One table per category of installation points, if present."""
    LABELS = {
        "tomadas": ("Tomadas", "TOMADAS"),
        "interruptores": ("Interruptores", "INTERRUPTORES"),
        "saidas_agua": ("Saídas de água", "SAÍDAS DE ÁGUA"),
        "saidas_esgoto": ("Saídas de esgoto", "SAÍDAS DE ESGOTO"),
        "saidas_gas": ("Saídas de gás", "SAÍDAS DE GÁS"),
        "registros_agua": ("Registros de água", "REGISTROS DE ÁGUA"),
    }
    out = []
    for key, (label, up) in LABELS.items():
        items = wall.get(key, []) or []
        if not items:
            continue
        rows = [["#", "Distância", "Lado", "Altura piso"]]
        for i, p in enumerate(items, 1):
            rows.append([
                str(i),
                f"{p.get('distancia_centro', '-')} cm",
                p.get("lado", "-").capitalize(),
                f"{p['altura_piso']} cm" if p.get("altura_piso") is not None else "—",
            ])
        tbl = Table(rows, colWidths=[8 * mm, 36 * mm, 26 * mm, 30 * mm], hAlign="LEFT")
        tbl.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), SURFACE),
            ("TEXTCOLOR", (0, 0), (-1, 0), GOLD),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 9),
            ("FONTNAME", (0, 1), (-1, -1), "Courier"),
            ("TEXTCOLOR", (0, 1), (-1, -1), colors.white),
            ("LINEBELOW", (0, 0), (-1, -1), 0.2, LINE),
            ("TOPPADDING", (0, 0), (-1, -1), 3),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
            ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ]))
        out.append((label, tbl))
    return out


def _color_block(wall: dict, styles):
    parede_hex = wall.get("cor_parede_hex")
    piso_hex = wall.get("cor_piso_hex")
    if not parede_hex and not piso_hex:
        return None
    data = [["", "PAREDE", "", "PISO"]]
    data.append(["", parede_hex or "—", "", piso_hex or "—"])
    tbl = Table(data, colWidths=[16 * mm, 34 * mm, 16 * mm, 34 * mm], hAlign="LEFT", rowHeights=[10 * mm, 6 * mm])
    style = TableStyle([
        ("FONTNAME", (0, 0), (-1, -1), "Courier-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 8),
        ("TEXTCOLOR", (0, 0), (-1, 0), MUTED),
        ("TEXTCOLOR", (0, 1), (-1, 1), colors.white),
        ("BOX", (0, 0), (0, 0), 0.5, GOLD),
        ("BOX", (2, 0), (2, 0), 0.5, GOLD),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ])
    if parede_hex:
        style.add("BACKGROUND", (0, 0), (0, 0), _hex_to_reportlab_color(parede_hex))
    if piso_hex:
        style.add("BACKGROUND", (2, 0), (2, 0), _hex_to_reportlab_color(piso_hex))
    tbl.setStyle(style)
    return tbl


def _wall_section(wall: dict, styles) -> list:
    els = []
    els.append(Paragraph(f"#{wall.get('numero', 0):02d}", styles["tag"]))
    els.append(Paragraph(wall.get("nome", "Parede"), styles["h1"]))
    els.append(Spacer(1, 4))

    # Basic dimensions
    els.append(Paragraph("Dimensões da parede", styles["h2"]))
    els.append(_kv_table(_wall_kv_rows(wall)))
    els.append(Spacer(1, 6))

    # Openings
    openings = _openings_table(wall, styles)
    if openings:
        els.append(Paragraph("Aberturas (portas & janelas)", styles["h2"]))
        els.append(openings)
        els.append(Spacer(1, 6))

    # Installation points
    for label, t in _pontos_tables(wall):
        els.append(Paragraph(label, styles["h2"]))
        els.append(t)
        els.append(Spacer(1, 4))

    # Colors
    color = _color_block(wall, styles)
    if color:
        els.append(Paragraph("Cores capturadas", styles["h2"]))
        els.append(color)
        els.append(Spacer(1, 4))

    return els


def _header(title: str, subtitle: str, extra_lines: list, styles):
    els = [
        Paragraph("TÁ NA MÃO", styles["brand"]),
        Paragraph("MEDIDAS · 3D · MARCENARIA · EM UM TOQUE", styles["brand_sub"]),
        Spacer(1, 8),
        Paragraph(f"<b>{title}</b>", ParagraphStyle(
            "title2", fontName="Helvetica-Bold", fontSize=16, textColor=colors.white,
            alignment=TA_CENTER, leading=18,
        )),
        Paragraph(subtitle, ParagraphStyle(
            "sub2", fontName="Helvetica", fontSize=10, textColor=MUTED,
            alignment=TA_CENTER, leading=12,
        )),
        Spacer(1, 4),
    ]
    for line in extra_lines:
        els.append(Paragraph(line, ParagraphStyle(
            "meta", fontName="Courier", fontSize=8, textColor=GOLD,
            alignment=TA_CENTER, leading=10,
        )))
    els.append(Spacer(1, 12))
    return els


def build_wall_pdf(wall: dict) -> bytes:
    buf = BytesIO()
    doc = SimpleDocTemplate(
        buf, pagesize=A4,
        leftMargin=18 * mm, rightMargin=18 * mm,
        topMargin=22 * mm, bottomMargin=20 * mm,
        title=f"{wall.get('nome', 'Parede')} - Tá Na Mão",
    )
    styles = _styles()
    story = _header(
        title=wall.get("nome", "Parede"),
        subtitle="Relatório do ambiente",
        extra_lines=[f"GERADO EM {datetime.now().strftime('%d/%m/%Y · %H:%M')}"],
        styles=styles,
    )
    story.extend(_wall_section(wall, styles))
    doc.build(story, onFirstPage=_draw_page_frame, onLaterPages=_draw_page_frame)
    return buf.getvalue()


def build_project_pdf(project: dict, walls: list) -> bytes:
    buf = BytesIO()
    doc = SimpleDocTemplate(
        buf, pagesize=A4,
        leftMargin=18 * mm, rightMargin=18 * mm,
        topMargin=22 * mm, bottomMargin=20 * mm,
        title=f"{project.get('nome', 'Projeto')} - Tá Na Mão",
    )
    styles = _styles()
    extra = [f"GERADO EM {datetime.now().strftime('%d/%m/%Y · %H:%M')}"]
    if project.get("cliente_nome"):
        extra.append(f"CLIENTE: {project['cliente_nome'].upper()}")
    if project.get("cliente_telefone"):
        extra.append(f"TELEFONE: {project['cliente_telefone']}")
    if project.get("endereco"):
        extra.append(f"ENDEREÇO: {project['endereco'].upper()}")

    story = _header(
        title=project.get("nome", "Projeto"),
        subtitle=f"{len(walls)} ambiente(s) documentado(s)",
        extra_lines=extra,
        styles=styles,
    )

    if project.get("observacoes"):
        story.append(Paragraph("Observações", styles["h2"]))
        story.append(Paragraph(project["observacoes"], styles["body"]))
        story.append(Spacer(1, 8))

    if not walls:
        story.append(Paragraph(
            "Este projeto ainda não tem paredes cadastradas.",
            styles["muted"],
        ))
    else:
        for i, wall in enumerate(walls):
            if i > 0:
                story.append(PageBreak())
            story.extend(_wall_section(wall, styles))

    doc.build(story, onFirstPage=_draw_page_frame, onLaterPages=_draw_page_frame)
    return buf.getvalue()
