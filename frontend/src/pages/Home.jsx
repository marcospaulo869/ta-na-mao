import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Camera,
  Wall,
  Stack,
  ArrowRight,
  Package,
  DownloadSimple,
  Cube,
} from "@phosphor-icons/react";
import { listWalls } from "@/lib/api";

const HomeButton = ({ to, testid, icon: Icon, label, hint }) => (
  <Link to={to} data-testid={testid} className="tmf-btn group tmf-corner-marks">
    <div className="flex items-center gap-4 text-left">
      <Icon size={28} weight="duotone" />
      <div>
        <div className="text-[0.95rem] leading-tight">{label}</div>
        {hint && (
          <div className="tmf-mono text-[10px] tracking-widest opacity-70 mt-1">
            {hint}
          </div>
        )}
      </div>
    </div>
    <ArrowRight size={20} weight="bold" className="opacity-70 group-hover:translate-x-1 transition-transform" />
  </Link>
);

export default function Home() {
  const navigate = useNavigate();
  const [wallsCount, setWallsCount] = useState(null);

  useEffect(() => {
    listWalls()
      .then((w) => setWallsCount(w.length))
      .catch(() => setWallsCount(0));
  }, []);

  return (
    <div className="min-h-screen tmf-grid-bg relative overflow-x-hidden" data-testid="home-page">
      {/* Hero brand */}
      <section className="relative pt-10 pb-8 px-5">
        <div className="max-w-3xl mx-auto text-center tmf-fade-in">
          <div className="inline-flex items-center gap-2 mb-6">
            <span className="w-8 h-px bg-[#d4af37]" />
            <span className="tmf-mono text-[10px] tracking-[0.4em] text-[#d4af37]">
              APP · ARQUITETOS · PROJETISTAS · MARCENEIROS
            </span>
            <span className="w-8 h-px bg-[#d4af37]" />
          </div>

          {/* Brand logo */}
          <div className="flex justify-center mb-4" data-testid="brand-logo-hero">
            <div className="relative">
              {/* Gold aura behind the logo */}
              <div className="absolute inset-0 bg-[#d4af37] opacity-25 blur-3xl scale-90" />

              <img
                src="/brand/logo.png"
                alt="Madeira Forte - Móveis Planejados"
                className="relative w-56 h-auto md:w-64 object-contain"
                style={{
                  filter:
                    "drop-shadow(0 0 24px rgba(212,175,55,0.45)) drop-shadow(0 6px 20px rgba(0,0,0,0.6))",
                }}
                data-testid="brand-logo-img"
              />
            </div>
          </div>

          <h1
            className="tmf-heading uppercase tmf-gold-text leading-[1.1] tracking-normal"
            style={{ fontSize: "clamp(2.5rem, 9vw, 5rem)" }}
            data-testid="brand-title"
          >
            TUDO MAIS
            <br />
            FÁCIL
          </h1>
          <div className="tmf-mono text-[11px] tracking-[0.5em] text-[#f3e5ab] mt-3">
            MADEIRA FORTE PLANEJADOS
          </div>
          <p className="text-[#a3a39a] mt-6 max-w-lg mx-auto text-sm md:text-base">
            Capture as medidas de qualquer ambiente em minutos. Salve suas paredes e envie direto para o plugin do
            <span className="text-[#d4af37]"> SketchUp</span> gerar o modelo 3D automaticamente.
          </p>
        </div>
      </section>

      {/* Main action buttons */}
      <section className="max-w-xl mx-auto px-5 pb-10 space-y-5 relative z-10">
        <HomeButton
          to="/foto/parede"
          testid="btn-foto-parede"
          icon={Camera}
          label="Tirar foto cor parede"
          hint="01 · CAPTURA DE COR"
        />
        <HomeButton
          to="/foto/piso"
          testid="btn-foto-piso"
          icon={Camera}
          label="Tirar foto cor piso"
          hint="02 · CAPTURA DE COR"
        />
        <HomeButton
          to="/parede/nova"
          testid="btn-criar-parede"
          icon={Wall}
          label="Criar nova parede"
          hint="03 · MEDIDAS DO AMBIENTE"
        />
      </section>

      {/* Saved walls quick access */}
      <section className="max-w-xl mx-auto px-5 pb-16">
        <div className="tmf-divider" />
        <button
          onClick={() => navigate("/paredes")}
          data-testid="btn-paredes-salvas"
          className="w-full flex items-center justify-between p-5 bg-transparent border border-[rgba(243,229,171,0.25)] hover:border-[#d4af37] hover:bg-[rgba(212,175,55,0.05)] transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <Stack size={22} weight="duotone" className="text-[#d4af37]" />
            <div>
              <div className="tmf-heading uppercase font-bold text-white tracking-wide">
                Paredes salvas
              </div>
              <div className="tmf-mono text-[10px] tracking-widest text-[#a3a39a] mt-0.5">
                {wallsCount === null
                  ? "CARREGANDO..."
                  : `${wallsCount} PAREDE${wallsCount === 1 ? "" : "S"} ARMAZENADAS`}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[#f3e5ab]">
            <Package size={18} weight="bold" />
            <ArrowRight size={18} weight="bold" />
          </div>
        </button>

        <footer className="mt-12 text-center">
          <div className="tmf-mono text-[9px] tracking-[0.4em] text-[#a3a39a]">
            v1.0 · MVP · FASE 1 DE 2
          </div>
        </footer>
      </section>

      {/* SketchUp plugin download */}
      <section className="max-w-xl mx-auto px-5 pb-20 relative z-10">
        <div className="tmf-card tmf-corner-marks" data-testid="plugin-download-card">
          <div className="flex items-center gap-3 mb-3">
            <Cube size={24} weight="duotone" className="text-[#d4af37]" />
            <div>
              <div className="tmf-heading uppercase font-bold text-white tracking-wide">
                Plugin SketchUp
              </div>
              <div className="tmf-mono text-[10px] tracking-widest text-[#d4af37] mt-0.5">
                FASE 2 · PRONTO PARA INSTALAR
              </div>
            </div>
          </div>
          <p className="text-[#a3a39a] text-sm mb-4">
            Instale o plugin no SketchUp e importe suas paredes direto da nuvem — a geometria
            3D é gerada automaticamente com aberturas, colunas, vigas e pontos elétricos.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <a
              href="/downloads/tudo_mais_facil.rbz"
              download
              data-testid="btn-download-plugin"
              className="tmf-btn-secondary flex items-center gap-2 justify-center"
            >
              <DownloadSimple size={14} weight="bold" />
              Plugin .rbz
            </a>
            <a
              href="/downloads/parede_exemplo.tmf.json"
              download
              data-testid="btn-download-sample"
              className="tmf-btn-secondary flex items-center gap-2 justify-center"
            >
              <DownloadSimple size={14} weight="bold" />
              JSON exemplo
            </a>
            <a
              href="/downloads/README-plugin.md"
              target="_blank"
              rel="noreferrer"
              data-testid="btn-open-readme"
              className="tmf-btn-secondary flex items-center gap-2 justify-center"
            >
              <Package size={14} weight="bold" />
              Como instalar
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
