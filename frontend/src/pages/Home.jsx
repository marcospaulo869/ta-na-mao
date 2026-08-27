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
  Crown,
  SignOut,
  User,
  FolderSimple,
} from "@phosphor-icons/react";
import { listWalls, listProjects } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

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
  const { user, limits, logout } = useAuth();
  const [wallsCount, setWallsCount] = useState(null);
  const [projectsCount, setProjectsCount] = useState(0);

  useEffect(() => {
    listWalls()
      .then((w) => setWallsCount(w.length))
      .catch(() => setWallsCount(0));
    listProjects()
      .then((p) => setProjectsCount(p.length))
      .catch(() => setProjectsCount(0));
  }, []);

  const isPro = limits?.is_pro;

  return (
    <div className="min-h-screen tmf-grid-bg relative overflow-x-hidden" data-testid="home-page">
      {/* User bar */}
      <div className="max-w-3xl mx-auto px-5 pt-4 flex items-center justify-between" data-testid="user-bar">
        <div className="flex items-center gap-2 text-[#a3a39a] text-sm">
          {user?.picture ? (
            <img src={user.picture} alt="" className="w-7 h-7 rounded-full border border-[#d4af37]" />
          ) : (
            <User size={18} weight="duotone" className="text-[#d4af37]" />
          )}
          <span className="truncate max-w-[160px]">{user?.name || user?.email}</span>
          {isPro ? (
            <span className="tmf-tag ml-1 flex items-center gap-1">
              <Crown size={11} weight="fill" /> PRO
            </span>
          ) : (
            <span className="tmf-tag ml-1">GRÁTIS</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!isPro && (
            <Link
              to="/precos"
              data-testid="btn-upgrade"
              className="tmf-btn-secondary flex items-center gap-1"
              style={{ padding: "0.4rem 0.7rem" }}
            >
              <Crown size={13} weight="fill" />
              <span className="hidden sm:inline">Assinar PRO</span>
              <span className="sm:hidden">PRO</span>
            </Link>
          )}
          <button
            onClick={async () => {
              await logout();
              navigate("/login");
            }}
            data-testid="btn-logout"
            className="tmf-btn-secondary flex items-center gap-1"
            style={{ padding: "0.4rem 0.7rem" }}
            aria-label="Sair"
            title="Sair"
          >
            <SignOut size={13} weight="bold" />
          </button>
        </div>
      </div>
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
          to="/projetos"
          testid="btn-novo-projeto"
          icon={FolderSimple}
          label="Novo projeto"
          hint="01 · CADASTRAR CLIENTE / OBRA"
        />
        <HomeButton
          to="/parede/nova"
          testid="btn-criar-parede"
          icon={Wall}
          label="Criar nova parede"
          hint="02 · MEDIDAS DO AMBIENTE"
        />
        <HomeButton
          to="/foto/parede"
          testid="btn-foto-parede"
          icon={Camera}
          label="Tirar foto cor parede"
          hint="03 · CAPTURA DE COR"
        />
        <HomeButton
          to="/foto/piso"
          testid="btn-foto-piso"
          icon={Camera}
          label="Tirar foto cor piso"
          hint="04 · CAPTURA DE COR"
        />
      </section>

      {/* Saved walls + Projects quick access */}
      <section className="max-w-xl mx-auto px-5 pb-8">
        <div className="tmf-divider" />
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate("/projetos")}
            data-testid="btn-projetos"
            className="flex flex-col items-start p-4 bg-transparent border border-[rgba(243,229,171,0.25)] hover:border-[#d4af37] hover:bg-[rgba(212,175,55,0.05)] transition-colors text-left"
          >
            <FolderSimple size={22} weight="duotone" className="text-[#d4af37]" />
            <div className="tmf-heading uppercase font-bold text-white tracking-wide mt-2 text-sm">
              Projetos
            </div>
            <div className="tmf-mono text-[9px] tracking-widest text-[#a3a39a] mt-1">
              {projectsCount} CADASTRADOS
            </div>
          </button>

          <button
            onClick={() => navigate("/paredes")}
            data-testid="btn-paredes-salvas"
            className="flex flex-col items-start p-4 bg-transparent border border-[rgba(243,229,171,0.25)] hover:border-[#d4af37] hover:bg-[rgba(212,175,55,0.05)] transition-colors text-left"
          >
            <Stack size={22} weight="duotone" className="text-[#d4af37]" />
            <div className="tmf-heading uppercase font-bold text-white tracking-wide mt-2 text-sm">
              Paredes
            </div>
            <div className="tmf-mono text-[9px] tracking-widest text-[#a3a39a] mt-1">
              {wallsCount === null
                ? "..."
                : limits?.walls_limit
                ? `${wallsCount}/${limits.walls_limit} · GRÁTIS`
                : `${wallsCount} SALVAS`}
            </div>
          </button>
        </div>

        <footer className="mt-8 text-center">
          <div className="tmf-mono text-[9px] tracking-[0.4em] text-[#a3a39a]">
            v1.2 · PROJETOS + PDF
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
                v1.2 · PAREDES + LASTRO + MÓDULOS
              </div>
            </div>
          </div>
          <p className="text-[#a3a39a] text-sm mb-4">
            Instale o plugin no SketchUp e ganhe 3 ferramentas: importa paredes
            (com portas, janelas, tomadas e ângulos), gera o <strong className="text-[#f3e5ab]">Lastro de Cozinha</strong> e
            o <strong className="text-[#f3e5ab]">Construtor de Módulos</strong> parametrizado.
          </p>

          {/* Quick install steps — visible without opening the README */}
          <div
            className="mb-4 border border-[rgba(212,175,55,0.25)] bg-[rgba(212,175,55,0.04)] p-3 space-y-2"
            data-testid="plugin-install-steps"
          >
            <div className="tmf-mono text-[10px] tracking-[0.3em] text-[#d4af37]">
              INSTALAR EM 4 PASSOS (SKETCHUP 2018 – 2026)
            </div>
            <ol className="text-[#f3e5ab] text-xs space-y-1.5 list-decimal pl-4">
              <li>Baixe o arquivo <span className="tmf-mono text-[#d4af37]">.rbz</span> abaixo</li>
              <li>
                Abra o SketchUp → menu <strong className="text-white">Extensões</strong> →{" "}
                <strong className="text-white">Gerenciador de Extensões</strong>
              </li>
              <li>
                Clique em <strong className="text-white">Instalar Extensão</strong> (canto inferior) e escolha o arquivo baixado. Se pedir confirmação de "extensão não assinada", clique <strong className="text-white">Sim</strong>
              </li>
              <li>
                Pronto! O plugin aparece em <strong className="text-white">Extensões → Tudo Mais Fácil</strong>
              </li>
            </ol>
            <div className="tmf-mono text-[9px] tracking-wider text-[#a3a39a] pt-1 border-t border-[rgba(212,175,55,0.15)]">
              NÃO ACHOU O GERENCIADOR? TOQUE EM "COMO INSTALAR" ABAIXO — TEM UM MÉTODO ALTERNATIVO
            </div>
          </div>
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
