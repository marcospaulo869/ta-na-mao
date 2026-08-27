import React from "react";
import { Link } from "react-router-dom";
import { GoogleLogo, ArrowRight } from "@phosphor-icons/react";

export function BrandHeader({ subtitle }) {
  return (
    <div className="text-center mb-8">
      <Link to="/" className="inline-flex flex-col items-center gap-2">
        <img
          src="/brand/logo.svg"
          alt="Tá Na Mão"
          className="w-20 h-auto"
          style={{ filter: "drop-shadow(0 0 12px rgba(212,175,55,0.4))" }}
        />
        <div className="tmf-heading text-2xl tmf-gold-text tracking-tight leading-none mt-1">
          TÁ NA MÃO
        </div>
        <div className="tmf-mono text-[9px] tracking-[0.35em] text-[#a3a39a]">
          MEDIDAS · 3D · MARCENARIA
        </div>
      </Link>
      {subtitle && (
        <div className="tmf-mono text-[10px] tracking-[0.3em] text-[#d4af37] mt-4">
          {subtitle}
        </div>
      )}
    </div>
  );
}

export function GoogleSignInButton({ label = "Entrar com Google", testid = "btn-google-signin" }) {
  const handleClick = () => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const redirectUrl = window.location.origin + "/";
    window.location.href =
      "https://auth.emergentagent.com/?redirect=" + encodeURIComponent(redirectUrl);
  };
  return (
    <button
      onClick={handleClick}
      data-testid={testid}
      className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-[rgba(243,229,171,0.4)] text-white bg-transparent hover:bg-[rgba(212,175,55,0.08)] hover:border-[#d4af37] transition-colors"
      style={{ borderRadius: 0 }}
    >
      <GoogleLogo size={20} weight="bold" className="text-[#d4af37]" />
      <span className="font-semibold tracking-wide">{label}</span>
    </button>
  );
}

export function AuthDivider() {
  return (
    <div className="flex items-center gap-3 my-6">
      <span className="flex-1 h-px bg-[rgba(243,229,171,0.15)]" />
      <span className="tmf-mono text-[9px] tracking-[0.4em] text-[#a3a39a]">OU</span>
      <span className="flex-1 h-px bg-[rgba(243,229,171,0.15)]" />
    </div>
  );
}

export function AuthShell({ children }) {
  return (
    <div className="min-h-screen tmf-grid-bg relative flex items-start justify-center px-4 py-10">
      <div className="relative z-10 w-full max-w-md tmf-fade-in">
        {children}
      </div>
    </div>
  );
}
