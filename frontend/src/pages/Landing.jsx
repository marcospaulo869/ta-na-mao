import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Camera,
  Microphone,
  Cube,
  FilePdf,
  Ruler,
  ArrowRight,
  Check,
  Crown,
  ChatCircleDots,
  Lightning,
  ShieldCheck,
  Sparkle,
} from "@phosphor-icons/react";
import { api } from "@/lib/api";

/** Landing Page — public marketing page shown at "/" when logged out */
export default function Landing() {
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    api.get("/payments/plans").then((r) => setPlans(r.data)).catch(() => {});
  }, []);

  const monthly = plans.find((p) => p.interval === "month");
  const annual = plans.find((p) => p.interval === "year");

  return (
    <div className="min-h-screen relative overflow-x-hidden" data-testid="landing-page">
      {/* Top nav */}
      <nav className="relative z-30 border-b border-[rgba(243,229,171,0.12)] bg-[rgba(10,10,8,0.85)] backdrop-blur-md sticky top-0">
        <div className="max-w-6xl mx-auto px-5 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2" data-testid="nav-brand">
            <div
              className="w-10 h-10 flex items-center justify-center border border-[rgba(212,175,55,0.5)]"
              style={{
                background: "linear-gradient(135deg, rgba(243,229,171,0.15), rgba(212,175,55,0.04))",
                boxShadow: "0 0 12px rgba(212,175,55,0.35)",
              }}
              aria-hidden="true"
            >
              <span
                className="tmf-heading font-black leading-none"
                style={{
                  fontSize: "1.15rem",
                  background: "linear-gradient(180deg, #f3e5ab, #c99d24)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                T
              </span>
            </div>
            <div>
              <div className="tmf-heading text-base tmf-gold-text leading-none">
                TUDO MAIS FÁCIL
              </div>
              <div className="tmf-mono text-[8px] tracking-[0.3em] text-[#a3a39a] mt-1">
                MEDIDAS · 3D · MARCENARIA
              </div>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              data-testid="nav-login"
              className="tmf-btn-secondary hidden sm:inline-flex"
              style={{ padding: "0.5rem 1rem" }}
            >
              Entrar
            </Link>
            <Link
              to="/cadastro"
              data-testid="nav-signup"
              className="tmf-btn"
              style={{ padding: "0.6rem 1rem", fontSize: "0.75rem" }}
            >
              <div className="flex items-center gap-2">
                Criar conta
                <ArrowRight size={14} weight="bold" />
              </div>
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative tmf-grid-bg overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-40"
             style={{ background: "radial-gradient(ellipse at 30% 20%, rgba(212,175,55,0.15), transparent 60%)" }} />
        <div className="relative z-10 max-w-6xl mx-auto px-5 pt-14 pb-16 grid md:grid-cols-2 gap-10 items-center">
          <div className="tmf-fade-in">
            <div className="inline-flex items-center gap-3 mb-5" data-testid="hero-audience">
              <span className="w-10 h-px bg-[#d4af37]" />
              <span
                className="tmf-mono tracking-[0.28em] text-[#f3e5ab] font-bold uppercase"
                style={{ fontSize: "clamp(0.85rem, 1.6vw, 1.05rem)" }}
              >
                Arquitetos · Projetistas · Marceneiros
              </span>
            </div>
            <h1 className="tmf-heading tmf-gold-text leading-[1.05] tracking-tight"
                style={{ fontSize: "clamp(2.5rem, 6vw, 4.4rem)" }}
                data-testid="hero-title">
              Meça um ambiente<br />
              <span className="text-white">em 3 minutos.</span>
            </h1>
            <p className="text-[#c8c8be] mt-6 text-lg max-w-lg leading-relaxed">
              Colete medidas em obra pelo celular, envie um PDF elegante pro cliente no
              WhatsApp e importe o modelo 3D no SketchUp <span className="text-[#d4af37]">automaticamente</span>.
              Trabalho que levava 30 minutos, agora leva 3.
            </p>
            <div className="flex flex-wrap items-center gap-3 mt-8">
              <Link to="/cadastro" data-testid="hero-cta-signup" className="tmf-btn max-w-xs">
                <div className="flex items-center gap-2">
                  <Sparkle size={20} weight="fill" />
                  <span>Começar grátis</span>
                </div>
              </Link>
              <Link
                to="/login"
                data-testid="hero-cta-login"
                className="tmf-btn-secondary inline-flex items-center gap-2"
              >
                Já tenho conta
                <ArrowRight size={14} weight="bold" />
              </Link>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-4 text-[#a3a39a] text-xs">
              <span className="flex items-center gap-1.5">
                <Check size={14} className="text-[#d4af37]" weight="bold" />
                Grátis até 3 paredes
              </span>
              <span className="flex items-center gap-1.5">
                <Check size={14} className="text-[#d4af37]" weight="bold" />
                Sem cartão pra testar
              </span>
              <span className="flex items-center gap-1.5">
                <Check size={14} className="text-[#d4af37]" weight="bold" />
                Cancele quando quiser
              </span>
            </div>
          </div>

          {/* Hero showcase — real human photos */}
          <div className="relative tmf-fade-in" data-testid="hero-photos">
            <div
              className="absolute inset-0 pointer-events-none blur-3xl opacity-40"
              style={{ background: "radial-gradient(ellipse at 60% 40%, rgba(212,175,55,0.35), transparent 70%)" }}
              aria-hidden="true"
            />
            <div className="relative grid grid-cols-2 gap-3 md:gap-4">
              <div
                className="relative overflow-hidden border border-[rgba(212,175,55,0.35)] aspect-[3/4] transform md:-translate-y-6"
                style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.55), 0 0 0 1px rgba(212,175,55,0.08)" }}
              >
                <img
                  src="/hero/arquiteta.png"
                  alt="Arquiteta usando o app Tudo Mais Fácil em uma cobertura moderna"
                  className="w-full h-full object-cover"
                  loading="eager"
                  data-testid="hero-photo-arquiteta"
                />
                <div
                  className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/85 via-black/40 to-transparent"
                  aria-hidden="true"
                >
                  <div className="tmf-mono text-[9px] tracking-[0.35em] text-[#f3e5ab]">ARQUITETA</div>
                  <div className="text-white text-xs mt-1">Mede na obra pelo iPhone</div>
                </div>
              </div>
              <div
                className="relative overflow-hidden border border-[rgba(212,175,55,0.35)] aspect-[3/4] transform md:translate-y-6"
                style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.55), 0 0 0 1px rgba(212,175,55,0.08)" }}
              >
                <img
                  src="/hero/marceneiro.png"
                  alt="Marceneiro usando o app em um ap de cobertura em obra"
                  className="w-full h-full object-cover"
                  loading="eager"
                  data-testid="hero-photo-marceneiro"
                />
                <div
                  className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/85 via-black/40 to-transparent"
                  aria-hidden="true"
                >
                  <div className="tmf-mono text-[9px] tracking-[0.35em] text-[#f3e5ab]">MARCENEIRO</div>
                  <div className="text-white text-xs mt-1">Mede, envia PDF, gera 3D</div>
                </div>
              </div>
            </div>
            {/* floating spec chips */}
            <div className="hidden md:flex absolute -left-2 top-1/2 -translate-y-1/2 flex-col gap-2">
              <span className="tmf-mono text-[9px] tracking-[0.3em] bg-[rgba(10,10,8,0.85)] border border-[rgba(212,175,55,0.35)] px-2 py-1 text-[#f3e5ab]">
                +25 CAMPOS
              </span>
              <span className="tmf-mono text-[9px] tracking-[0.3em] bg-[rgba(10,10,8,0.85)] border border-[rgba(212,175,55,0.35)] px-2 py-1 text-[#f3e5ab]">
                IA · VOZ+FOTO
              </span>
              <span className="tmf-mono text-[9px] tracking-[0.3em] bg-[rgba(10,10,8,0.85)] border border-[rgba(212,175,55,0.35)] px-2 py-1 text-[#f3e5ab]">
                SKETCHUP 1-CLIQUE
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEM STRIP */}
      <section className="border-y border-[rgba(243,229,171,0.1)] bg-[rgba(18,18,15,0.6)] py-8">
        <div className="max-w-4xl mx-auto px-5 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          {[
            { n: "30 min", l: "Método antigo: papel, fita, retrabalho" },
            { n: "3 min", l: "Com TUDO MAIS FÁCIL: fala, foto e pronto" },
            { n: "10× mais projetos", l: "É orçar mais, atrasar menos, ganhar mais" },
          ].map((x, i) => (
            <div key={i}>
              <div className="tmf-heading text-3xl tmf-gold-text">{x.n}</div>
              <div className="tmf-mono text-[10px] tracking-widest text-[#a3a39a] mt-1">
                {x.l.toUpperCase()}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="max-w-6xl mx-auto px-5 py-16">
        <div className="text-center mb-12">
          <span className="tmf-tag">RECURSOS</span>
          <h2 className="tmf-heading text-3xl md:text-4xl text-white uppercase mt-4">
            Feito por quem <span className="tmf-gold-text">está em obra</span>
          </h2>
          <p className="text-[#a3a39a] mt-3 max-w-xl mx-auto">
            Cinco superpoderes que economizam horas do seu dia
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              icon: Microphone,
              tag: "IA · DITADO",
              title: "Fala e o app preenche",
              desc:
                "Aperta o botão dourado, fala 'pé direito 2,80, 3 tomadas, uma porta 80 por 210' — a IA faz o resto em português.",
            },
            {
              icon: Camera,
              tag: "CAPTURA DE COR",
              title: "Foto vira material 3D",
              desc:
                "Tire foto da parede e do piso — a IA detecta a cor dominante e aplica como material no modelo do SketchUp.",
            },
            {
              icon: Ruler,
              tag: "24 CAMPOS",
              title: "Nada de fita esquecida",
              desc:
                "Pé direito, colunas, vigas, portas, janelas, tomadas, interruptores, água, esgoto, gás e registros — tudo num só lugar.",
            },
            {
              icon: FilePdf,
              tag: "PDF PRO CLIENTE",
              title: "Relatório elegante em 1 clique",
              desc:
                "PDF dourado com todas as medidas + fotos + observações. Envia direto pelo WhatsApp com 1 toque.",
            },
            {
              icon: Cube,
              tag: "PLUGIN SKETCHUP",
              title: "Modelo 3D automático",
              desc:
                "Abre o SketchUp, clica em 'Importar da Nuvem' e a parede aparece 3D — com aberturas, colunas, vigas e marcadores dos pontos.",
            },
            {
              icon: ChatCircleDots,
              tag: "PROJETOS",
              title: "Organize por cliente",
              desc:
                "Agrupe várias paredes num projeto (Cozinha, Sala, Quarto). PDF único do ambiente inteiro. Cada projeto com dados do cliente.",
            },
          ].map((f, i) => (
            <div
              key={i}
              className="tmf-card tmf-corner-marks"
              data-testid={`feature-card-${i}`}
            >
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
                   style={{ background: "linear-gradient(135deg, rgba(243,229,171,0.15), rgba(212,175,55,0.06))",
                            border: "1px solid rgba(212,175,55,0.35)" }}>
                <f.icon size={22} weight="duotone" className="text-[#d4af37]" />
              </div>
              <div className="tmf-mono text-[9px] tracking-[0.3em] text-[#d4af37] mb-1">
                {f.tag}
              </div>
              <h3 className="tmf-heading text-lg text-white uppercase leading-tight mb-2">
                {f.title}
              </h3>
              <p className="text-[#a3a39a] text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-[rgba(18,18,15,0.6)] border-y border-[rgba(243,229,171,0.1)] py-16">
        <div className="max-w-4xl mx-auto px-5">
          <div className="text-center mb-10">
            <span className="tmf-tag">FLUXO</span>
            <h2 className="tmf-heading text-3xl text-white uppercase mt-4">
              3 passos, do celular ao SketchUp
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { n: "01", t: "Meça em obra", d: "Fale ou digite as medidas no celular. Fotografe cor da parede e do piso." },
              { n: "02", t: "PDF pro cliente", d: "Gere um relatório elegante e envie pelo WhatsApp com 1 clique." },
              { n: "03", t: "3D automático", d: "No escritório, abra o SketchUp, importe da nuvem e veja o modelo 3D pronto." },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div className="tmf-mono text-4xl tmf-gold-text">{s.n}</div>
                <h3 className="tmf-heading text-xl text-white mt-2 uppercase">{s.t}</h3>
                <p className="text-[#a3a39a] text-sm mt-2">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING PREVIEW */}
      <section className="max-w-4xl mx-auto px-5 py-16" data-testid="landing-pricing">
        <div className="text-center mb-10">
          <span className="tmf-tag">PREÇOS</span>
          <h2 className="tmf-heading text-3xl text-white uppercase mt-4">
            Comece <span className="tmf-gold-text">grátis</span>
          </h2>
          <p className="text-[#a3a39a] mt-3">
            Cadastre-se e ganhe até 3 paredes ilimitado. Assine só quando precisar de mais.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="tmf-card text-center py-8 tmf-corner-marks">
            <div className="tmf-mono text-[10px] tracking-widest text-[#a3a39a]">GRÁTIS</div>
            <div className="tmf-heading text-3xl text-white mt-2">R$ 0</div>
            <div className="tmf-mono text-[10px] text-[#a3a39a] mt-1">SEMPRE</div>
            <div className="text-sm text-[#f3e5ab] mt-6 space-y-1">
              <div>Até 3 paredes</div>
              <div>Ditado por voz</div>
              <div>Export SketchUp</div>
            </div>
          </div>
          <div className="tmf-card text-center py-8 tmf-corner-marks relative"
               style={{ borderColor: "rgba(212,175,55,0.5)",
                        background: "linear-gradient(180deg, rgba(212,175,55,0.08), rgba(18,18,15,0.9))" }}>
            <div className="tmf-mono text-[10px] tracking-widest text-[#d4af37] flex items-center justify-center gap-1">
              <Crown size={11} weight="fill" /> MENSAL
            </div>
            <div className="tmf-heading text-3xl tmf-gold-text mt-2">
              {monthly?.display_price || "R$ 39,90"}
            </div>
            <div className="tmf-mono text-[10px] text-[#a3a39a] mt-1">POR MÊS</div>
            <div className="text-sm text-[#f3e5ab] mt-6 space-y-1">
              <div>Paredes ilimitadas</div>
              <div>Suporte prioritário</div>
              <div>Cancele quando quiser</div>
            </div>
          </div>
          <div className="tmf-card text-center py-8 tmf-corner-marks relative"
               style={{ borderColor: "rgba(212,175,55,0.6)",
                        background: "linear-gradient(180deg, rgba(212,175,55,0.12), rgba(18,18,15,0.9))" }}>
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 tmf-mono text-[9px] tracking-widest bg-[#d4af37] text-black px-3 py-0.5">
              MELHOR OFERTA
            </div>
            <div className="tmf-mono text-[10px] tracking-widest text-[#d4af37] flex items-center justify-center gap-1">
              <Crown size={11} weight="fill" /> ANUAL
            </div>
            <div className="tmf-heading text-3xl tmf-gold-text mt-2">
              {annual?.display_price || "R$ 399,00"}
            </div>
            <div className="tmf-mono text-[10px] text-[#a3a39a] mt-1">
              POR ANO · 2 MESES GRÁTIS
            </div>
            <div className="text-sm text-[#f3e5ab] mt-6 space-y-1">
              <div>Tudo do mensal</div>
              <div>Atualizações primeiro</div>
              <div>Economia de ~R$ 80</div>
            </div>
          </div>
        </div>

        <div className="text-center mt-8">
          <Link to="/cadastro" data-testid="pricing-cta" className="tmf-btn max-w-xs mx-auto">
            <div className="flex items-center gap-2">
              <Sparkle size={18} weight="fill" />
              <span>Criar minha conta grátis</span>
            </div>
          </Link>
          <div className="tmf-mono text-[10px] text-[#a3a39a] mt-3 tracking-widest">
            PAGAMENTO SEGURO · STRIPE · CANCELAMENTO EM 1 CLIQUE
          </div>
        </div>
      </section>

      {/* TESTIMONIALS PLACEHOLDER */}
      <section className="bg-[rgba(18,18,15,0.6)] border-t border-[rgba(243,229,171,0.1)] py-16">
        <div className="max-w-4xl mx-auto px-5 text-center">
          <span className="tmf-tag">DEPOIMENTOS</span>
          <h2 className="tmf-heading text-2xl text-white uppercase mt-4">
            Nossos primeiros clientes estão em obra
          </h2>
          <p className="text-[#a3a39a] mt-3 max-w-md mx-auto text-sm">
            Você pode ser o próximo a economizar horas de trabalho por dia.
            Comece hoje e conte pra gente sua experiência.
          </p>
          <div className="grid sm:grid-cols-3 gap-4 mt-8">
            {[
              { i: Lightning, l: "Rápido", d: "3 min por parede" },
              { i: ShieldCheck, l: "Confiável", d: "Testado em campo" },
              { i: Crown, l: "Profissional", d: "PDF que impressiona" },
            ].map((c, i) => (
              <div key={i} className="border border-[rgba(243,229,171,0.15)] p-4">
                <c.i size={20} weight="duotone" className="text-[#d4af37] mx-auto" />
                <div className="tmf-heading text-white uppercase text-sm mt-2">{c.l}</div>
                <div className="tmf-mono text-[10px] text-[#a3a39a] tracking-widest mt-1">
                  {c.d}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="relative overflow-hidden py-16">
        <div className="absolute inset-0 opacity-25" style={{
          background: "radial-gradient(ellipse at center, rgba(212,175,55,0.4), transparent 60%)",
        }} />
        <div className="relative z-10 max-w-3xl mx-auto px-5 text-center">
          <h2 className="tmf-heading tmf-gold-text uppercase leading-tight"
              style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)" }}>
            Bora medir mais rápido?
          </h2>
          <p className="text-[#c8c8be] mt-4 max-w-lg mx-auto">
            Grátis pra começar. Sem cartão. Sem pegadinha.
            Você vai testar em uma obra e não vai mais querer voltar pro papel.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
            <Link to="/cadastro" data-testid="final-cta-signup" className="tmf-btn max-w-xs">
              <div className="flex items-center gap-2">
                <Sparkle size={20} weight="fill" />
                <span>Criar conta grátis</span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[rgba(243,229,171,0.1)] py-8 bg-[#08080a]">
        <div className="max-w-6xl mx-auto px-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 flex items-center justify-center border border-[rgba(212,175,55,0.4)]"
              style={{ background: "linear-gradient(135deg, rgba(243,229,171,0.12), rgba(212,175,55,0.04))" }}
              aria-hidden="true"
            >
              <span
                className="tmf-heading font-black leading-none text-[0.85rem]"
                style={{
                  background: "linear-gradient(180deg, #f3e5ab, #c99d24)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                T
              </span>
            </div>
            <div>
              <div className="tmf-mono text-[10px] tmf-gold-text tracking-widest">
                TUDO MAIS FÁCIL
              </div>
              <div className="tmf-mono text-[8px] text-[#a3a39a] tracking-widest">
                MEDIDAS · 3D · MARCENARIA
              </div>
            </div>
          </div>
          <div className="tmf-mono text-[9px] tracking-widest text-[#a3a39a] text-center flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
            <span>© 2026 · TUDO MAIS FÁCIL</span>
            <span className="hidden sm:inline">·</span>
            <Link to="/privacidade" className="hover:text-[#d4af37]" data-testid="footer-privacy">
              PRIVACIDADE
            </Link>
            <span className="hidden sm:inline">·</span>
            <Link to="/termos" className="hover:text-[#d4af37]" data-testid="footer-terms">
              TERMOS
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
