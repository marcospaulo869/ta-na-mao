import React from "react";
import { Link } from "react-router-dom";
import { CaretLeft } from "@phosphor-icons/react";

export default function AppShell({ title, subtitle, back = "/", children, actions }) {
  return (
    <div className="min-h-screen tmf-grid-bg relative" data-testid="app-shell">
      {/* Top brand bar */}
      <header className="border-b border-[rgba(243,229,171,0.15)] bg-[rgba(10,10,8,0.75)] backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-5 py-4 flex items-center justify-between">
          <Link
            to={back}
            data-testid="btn-back"
            className="flex items-center gap-2 text-[#f3e5ab] hover:text-[#d4af37] transition-colors"
          >
            <CaretLeft size={18} weight="bold" />
            <span className="tmf-mono text-xs uppercase tracking-widest">Voltar</span>
          </Link>
          <Link to="/" data-testid="brand-logo" className="flex flex-col items-center">
            <div className="flex items-center gap-2">
              <img
                src="/brand/logo.png"
                alt="Madeira Forte"
                className="w-9 h-9 object-contain"
                style={{
                  filter: "drop-shadow(0 0 6px rgba(212,175,55,0.5))",
                }}
              />
              <span className="tmf-heading text-lg tmf-gold-text leading-none">
                TUDO MAIS FÁCIL
              </span>
            </div>
            <span className="tmf-mono text-[9px] tracking-[0.35em] text-[#a3a39a] mt-1">
              MADEIRA FORTE PLANEJADOS
            </span>
          </Link>
          <div className="w-16" />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-5 py-8 relative z-10">
        {title && (
          <div className="mb-8 tmf-fade-in">
            <div className="tmf-tag mb-3">Módulo</div>
            <h1 className="tmf-heading text-3xl md:text-4xl font-black uppercase tracking-tight text-white">
              {title}
            </h1>
            {subtitle && (
              <p className="text-[#a3a39a] mt-2 max-w-xl">{subtitle}</p>
            )}
            {actions && <div className="mt-4">{actions}</div>}
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
