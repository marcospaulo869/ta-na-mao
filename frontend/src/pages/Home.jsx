import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Camera,
  Wall,
  Stack,
  ArrowRight,
  Package,
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
      <section className="relative pt-14 pb-8 px-5">
        <div className="max-w-3xl mx-auto text-center tmf-fade-in">
          <div className="inline-flex items-center gap-2 mb-6">
            <span className="w-8 h-px bg-[#d4af37]" />
            <span className="tmf-mono text-[10px] tracking-[0.4em] text-[#d4af37]">
              APP · PROJETISTAS · MARCENEIROS
            </span>
            <span className="w-8 h-px bg-[#d4af37]" />
          </div>
          <h1
            className="tmf-heading font-black uppercase tmf-gold-text leading-[0.9] tracking-tighter"
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
            Colete medidas de qualquer ambiente em minutos. Salve suas paredes e envie direto para o plugin do
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
    </div>
  );
}
