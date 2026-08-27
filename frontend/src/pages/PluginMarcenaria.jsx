import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import {
  Cube,
  Wrench,
  Ruler,
  CheckCircle,
  Sparkle,
  DownloadSimple,
  ArrowRight,
  Package,
  Buildings,
  Toolbox,
  Question,
} from "@phosphor-icons/react";

/**
 * PluginMarcenaria — landing page dedicada ao produto secundário
 * (plugin de móveis planejados para SketchUp).
 *
 * Vive fora da experiência do app principal — é a "vitrine" pra quem chega
 * pelo Google, redes sociais ou pelo banner de upsell dentro do app.
 */
export default function PluginMarcenaria() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [busyPlan, setBusyPlan] = useState(null);

  const handleSubscribe = async (lookupKey) => {
    // If not logged in, send to register + memorize the desired plan
    if (!user) {
      try { sessionStorage.setItem("tmf.pendingPlan", lookupKey); } catch {}
      toast.info("Crie sua conta para prosseguir com a assinatura");
      navigate("/cadastro");
      return;
    }
    setBusyPlan(lookupKey);
    const t = toast.loading("Abrindo checkout seguro...");
    try {
      const { data } = await api.post("/payments/checkout", {
        lookup_key: lookupKey,
        origin_url: window.location.origin,
      });
      toast.success("Redirecionando para o pagamento", { id: t });
      window.location.href = data.checkout_url;
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Erro ao abrir checkout", { id: t });
      setBusyPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a08] text-white tmf-bg-grid" data-testid="plugin-lp">
      {/* NAV */}
      <nav className="border-b border-[rgba(212,175,55,0.15)] backdrop-blur-md sticky top-0 z-30 bg-[rgba(10,10,8,0.85)]">
        <div className="max-w-6xl mx-auto flex items-center justify-between py-4 px-4 sm:px-6">
          <Link to="/lp" className="flex items-center gap-2" data-testid="pluglp-nav-brand">
            <div
              className="w-10 h-10 flex items-center justify-center border border-[rgba(212,175,55,0.5)]"
              style={{
                background: "linear-gradient(135deg, rgba(243,229,171,0.15), rgba(212,175,55,0.04))",
                boxShadow: "0 0 12px rgba(212,175,55,0.35)",
              }}
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
                TÁ NA MÃO
              </div>
              <div className="tmf-mono text-[8px] tracking-[0.3em] text-[#a3a39a] mt-1">
                PLUGIN · MARCENARIA
              </div>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <a
              href="#planos"
              className="hidden sm:inline-flex tmf-mono text-[10px] tracking-widest text-[#a3a39a] hover:text-[#f3e5ab] px-3 py-2"
            >
              PLANOS
            </a>
            <a
              href="#faq"
              className="hidden sm:inline-flex tmf-mono text-[10px] tracking-widest text-[#a3a39a] hover:text-[#f3e5ab] px-3 py-2"
            >
              FAQ
            </a>
            <Link to="/cadastro" className="tmf-btn-secondary text-xs" data-testid="pluglp-cta-nav">
              Começar
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="tmf-fade-in">
            <div className="mb-5 flex flex-col items-start gap-2" data-testid="pluglp-hero-audience">
              <span className="block w-14 h-px bg-[#d4af37]" aria-hidden="true" />
              <span
                className="tmf-mono tracking-[0.28em] text-[#f3e5ab] font-bold uppercase"
                style={{ fontSize: "clamp(0.72rem, 2vw, 0.95rem)" }}
              >
                Marcenaria · SketchUp Plugin
              </span>
              <span className="block w-14 h-px bg-[#d4af37]" aria-hidden="true" />
            </div>
            <h1
              className="tmf-heading tmf-gold-text leading-[1.08] tracking-tight"
              style={{ fontSize: "clamp(1.7rem, 4vw, 3.2rem)" }}
              data-testid="pluglp-hero-title"
            >
              Chega de desenhar <span className="text-white">gaveta na mão</span>.
              <br />
              <span className="text-[#f3e5ab]">Preencha os campos.</span>
              <br />
              <span className="text-white">Aperte um botão. 3D pronto.</span>
            </h1>
            <p className="text-[#c8c8be] mt-5 text-base md:text-lg max-w-lg leading-relaxed">
              O plugin faz o trabalho pesado da <span className="text-[#f3e5ab]">marcenaria planejada</span> —
              lastro de cozinha, gaveteiros, torres, aéreos, closets. Você escolhe as medidas,
              a chapa, as ferragens; o SketchUp <span className="text-[#d4af37]">desenha
              sozinho</span> e ainda te devolve o custo estimado.
            </p>
            <div className="flex flex-wrap items-center gap-3 mt-8">
              <a
                href="#planos"
                data-testid="pluglp-cta-plans"
                className="tmf-btn max-w-xs"
              >
                <div className="flex items-center gap-2">
                  <Sparkle size={20} weight="fill" />
                  <span>Ver planos</span>
                </div>
              </a>
              <a
                href="/downloads/ta_na_mao.rbz"
                data-testid="pluglp-cta-download"
                className="tmf-btn-secondary inline-flex items-center gap-2"
              >
                <DownloadSimple size={18} weight="bold" />
                Baixar plugin (.rbz)
              </a>
            </div>
            <div className="mt-6 flex flex-wrap gap-4 text-xs text-[#a3a39a]">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle size={14} weight="fill" className="text-[#d4af37]" />
                SketchUp 2018 até 2026
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle size={14} weight="fill" className="text-[#d4af37]" />
                Windows e Mac
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle size={14} weight="fill" className="text-[#d4af37]" />
                Cancele quando quiser
              </span>
            </div>
          </div>

          {/* Right showcase — icon trio + cabinet preview */}
          <div className="relative tmf-fade-in" data-testid="pluglp-hero-showcase">
            <div
              className="absolute inset-0 pointer-events-none blur-3xl opacity-40"
              style={{
                background:
                  "radial-gradient(ellipse at 50% 50%, rgba(212,175,55,0.35), transparent 70%)",
              }}
            />
            <div className="relative grid grid-cols-2 gap-4">
              <div
                className="col-span-2 aspect-video overflow-hidden border border-[rgba(212,175,55,0.35)] bg-gradient-to-br from-[#161612] to-[#0b0b09] p-6 flex items-center justify-center"
                style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.55)" }}
              >
                <img
                  src="/preview_plugin/icon_modulo.png"
                  alt="Ícone do Construtor de Módulos"
                  className="w-32 h-32 object-contain drop-shadow-[0_0_24px_rgba(212,175,55,0.4)]"
                />
              </div>
              <div
                className="aspect-square overflow-hidden border border-[rgba(212,175,55,0.35)] bg-gradient-to-br from-[#161612] to-[#0b0b09] p-4 flex items-center justify-center"
                style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.55)" }}
              >
                <img
                  src="/preview_plugin/icon_lastro.png"
                  alt="Ícone do Lastro de Cozinha"
                  className="w-24 h-24 object-contain drop-shadow-[0_0_16px_rgba(212,175,55,0.35)]"
                />
              </div>
              <div
                className="aspect-square overflow-hidden border border-[rgba(212,175,55,0.35)] bg-gradient-to-br from-[#161612] to-[#0b0b09] p-4 flex items-center justify-center"
                style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.55)" }}
              >
                <img
                  src="/preview_plugin/icon_main.png"
                  alt="Ícone Tá Na Mão"
                  className="w-24 h-24 object-contain drop-shadow-[0_0_16px_rgba(212,175,55,0.35)]"
                />
              </div>
            </div>
            <div
              className="mt-4 border border-[rgba(212,175,55,0.25)] bg-[rgba(212,175,55,0.04)] px-3 py-2"
              style={{ boxShadow: "inset 0 0 24px rgba(212,175,55,0.08)" }}
            >
              <div className="tmf-mono text-[9px] tracking-[0.3em] text-[#d4af37] mb-1">
                COMPATIBILIDADE
              </div>
              <div className="text-[#f3e5ab] text-xs">
                Instala em qualquer SketchUp desktop (2018 – 2026) com 1 arquivo .rbz.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURE TRIO — What the plugin does today */}
      <section className="border-y border-[rgba(212,175,55,0.15)] bg-[rgba(16,16,12,0.6)]" data-testid="pluglp-features">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 md:py-20">
          <div className="text-center mb-10">
            <span className="tmf-mono text-[10px] tracking-[0.35em] text-[#d4af37]">
              O QUE VOCÊ GANHA
            </span>
            <h2 className="tmf-heading text-white text-3xl md:text-4xl mt-3">
              3 ferramentas dentro do SketchUp
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FeatureCard
              icon={<Ruler size={28} weight="duotone" className="text-[#d4af37]" />}
              tag="INCLUÍDO"
              title="Importador de paredes"
              desc="Puxa qualquer parede que você mediu no app — com portas, janelas, tomadas, colunas, vigas e paredes em ângulo — e gera 3D em 1 clique."
            />
            <FeatureCard
              icon={<Package size={28} weight="duotone" className="text-[#d4af37]" />}
              tag="INCLUÍDO"
              title="Lastro de Cozinha"
              desc="Base de madeira sob os módulos com espessura, altura, tipo (pinus tratado ou grapia) e valor/metro — calcula o custo automaticamente."
            />
            <FeatureCard
              icon={<Toolbox size={28} weight="duotone" className="text-[#d4af37]" />}
              tag="INCLUÍDO"
              title="Construtor de Módulos"
              desc="Gera armários, gabinetes, gaveteiros. Escolhe chapa, portas, gavetas, ferragens; o plugin monta o 3D e calcula quanto vai custar."
            />
          </div>
        </div>
      </section>

      {/* ROADMAP — Ambientes prontos que vêm no Pro */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14 md:py-20" data-testid="pluglp-roadmap">
        <div className="text-center mb-10">
          <span className="tmf-mono text-[10px] tracking-[0.35em] text-[#d4af37]">
            VEM POR AÍ (INCLUÍDO NO PRO)
          </span>
          <h2 className="tmf-heading text-white text-3xl md:text-4xl mt-3">
            Ambientes prontos em 1 clique
          </h2>
          <p className="text-[#a3a39a] mt-3 max-w-2xl mx-auto">
            Em vez de montar cada módulo, você escolhe um ambiente completo (com layout típico
            e dimensões editáveis), e o plugin monta tudo — pronto pra apresentar ao cliente.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { name: "Cozinha", eta: "P1" },
            { name: "Banheiro", eta: "P1" },
            { name: "Área de Serviço", eta: "P2" },
            { name: "Quarto Suíte", eta: "P2" },
            { name: "Quarto Casal", eta: "P2" },
            { name: "Sala de Estar", eta: "P3" },
            { name: "Home Office", eta: "P3" },
            { name: "Closet", eta: "P3" },
          ].map((amb) => (
            <div
              key={amb.name}
              className="border border-[rgba(212,175,55,0.2)] bg-[rgba(16,16,12,0.5)] p-4 text-center"
              data-testid={`pluglp-room-${amb.name.toLowerCase().replace(/\s/g, "-")}`}
            >
              <Buildings size={22} weight="duotone" className="text-[#d4af37] mx-auto" />
              <div className="text-white text-sm font-semibold mt-2">{amb.name}</div>
              <div className="tmf-mono text-[9px] tracking-widest text-[#a3a39a] mt-1">
                {amb.eta}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section
        id="planos"
        className="border-y border-[rgba(212,175,55,0.15)] bg-[rgba(16,16,12,0.6)]"
        data-testid="pluglp-pricing"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 md:py-20">
          <div className="text-center mb-10">
            <span className="tmf-mono text-[10px] tracking-[0.35em] text-[#d4af37]">
              PLANOS
            </span>
            <h2 className="tmf-heading text-white text-3xl md:text-4xl mt-3">
              Menos que um cafezinho por dia
            </h2>
            <p className="text-[#a3a39a] mt-3">
              Cancele quando quiser. Sem fidelidade, sem taxa de setup.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
            <PriceCard
              label="BASIC"
              price="29"
              tagline="Pro marceneiro autônomo começando."
              features={[
                "Importador de paredes ilimitado",
                "Lastro de Cozinha ilimitado",
                "Construtor de Módulos (portas + gavetas + prateleiras)",
                "Cálculo de custo estimado (chapa + trilhos)",
                "Compatível SketchUp 2018 – 2026",
              ]}
              cta="Assinar Basic"
              testid="price-basic"
              lookupKey="plugin_basic_monthly"
              onSubscribe={handleSubscribe}
              busy={busyPlan === "plugin_basic_monthly"}
            />
            <PriceCard
              label="PRO"
              price="49"
              featured
              tagline="Pra quem entrega ambientes completos."
              features={[
                "Tudo do Basic +",
                "Ambientes prontos (cozinha, banheiro, quartos)",
                "DXF Ø35mm da dobradiça (pra CNC)",
                "Plano de corte otimizado (chapa 275×184)",
                "Presets de módulos favoritos",
                "Suporte prioritário WhatsApp",
              ]}
              cta="Assinar Pro"
              testid="price-pro"
              lookupKey="plugin_pro_monthly"
              onSubscribe={handleSubscribe}
              busy={busyPlan === "plugin_pro_monthly"}
            />
          </div>
          <div className="text-center mt-8">
            <p className="tmf-mono text-[10px] tracking-[0.2em] text-[#a3a39a]">
              JÁ É CLIENTE DO APP TÁ NA MÃO?{" "}
              <span className="text-[#d4af37]">GANHE 20% DE DESCONTO NO PLUGIN.</span>
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section
        id="faq"
        className="max-w-3xl mx-auto px-4 sm:px-6 py-14 md:py-20"
        data-testid="pluglp-faq"
      >
        <div className="text-center mb-10">
          <span className="tmf-mono text-[10px] tracking-[0.35em] text-[#d4af37]">
            PERGUNTAS FREQUENTES
          </span>
          <h2 className="tmf-heading text-white text-3xl md:text-4xl mt-3">
            Dúvidas antes de assinar?
          </h2>
        </div>
        <div className="space-y-3">
          <Faq
            q="Preciso do app Tá Na Mão pra usar o plugin?"
            a="Não! O plugin funciona sozinho. O Lastro de Cozinha e o Construtor de Módulos são criados dentro do próprio SketchUp — sem precisar sair. Se você também usa o app, ganha o superpoder extra de importar paredes que já mediu na obra."
          />
          <Faq
            q="Funciona em qual SketchUp?"
            a="Testado do SketchUp 2018 até o 2026, no Windows e no Mac. É um arquivo .rbz que instala em 4 passos pelo Gerenciador de Extensões."
          />
          <Faq
            q="Como faço pra baixar depois que assinar?"
            a="Assim que a assinatura for confirmada, o link do .rbz aparece no seu painel do app Tá Na Mão. Você pode reinstalar quantas vezes quiser em quantos computadores usar."
          />
          <Faq
            q="Posso cancelar quando quiser?"
            a="Sim. Sem fidelidade, sem multa. Você cancela pelo próprio painel — a cobrança para no próximo mês e o plugin continua funcionando até o fim do período pago."
          />
          <Faq
            q="Aceita quais formas de pagamento?"
            a="Cartão de crédito internacional (Visa, Mastercard, Elo, Amex, Hipercard) via Stripe — o mesmo sistema que Netflix, Spotify e milhares de empresas usam. Recibo mensal por email."
          />
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="border-t border-[rgba(212,175,55,0.15)] bg-gradient-to-b from-transparent to-[rgba(212,175,55,0.05)]">
        <div className="max-w-3xl mx-auto text-center px-4 sm:px-6 py-16">
          <Wrench size={36} weight="duotone" className="text-[#d4af37] mx-auto mb-4" />
          <h2 className="tmf-heading text-3xl md:text-4xl tmf-gold-text">
            Pare de perder o final de semana desenhando gaveta.
          </h2>
          <p className="text-[#a3a39a] mt-4 text-lg">
            Você desenha uma vez. O plugin repete pra sempre.
          </p>
          <a
            href="#planos"
            className="tmf-btn inline-flex items-center gap-2 mt-8"
            data-testid="pluglp-cta-final"
          >
            <Sparkle size={20} weight="fill" />
            Assinar por R$ 29/mês
            <ArrowRight size={18} weight="bold" />
          </a>
          <p className="tmf-mono text-[9px] tracking-widest text-[#a3a39a] mt-4">
            SEM FIDELIDADE · CANCELE QUANDO QUISER · TESTE POR 7 DIAS GRÁTIS
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[rgba(212,175,55,0.15)] py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link to="/lp" className="flex items-center gap-2">
            <div
              className="w-8 h-8 flex items-center justify-center border border-[rgba(212,175,55,0.4)]"
              style={{
                background: "linear-gradient(135deg, rgba(243,229,171,0.12), rgba(212,175,55,0.04))",
              }}
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
                TÁ NA MÃO
              </div>
              <div className="tmf-mono text-[8px] text-[#a3a39a] tracking-widest">
                PLUGIN · MARCENARIA
              </div>
            </div>
          </Link>
          <div className="tmf-mono text-[9px] tracking-widest text-[#a3a39a] flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
            <span>© 2026 · TÁ NA MÃO</span>
            <Link to="/privacidade" className="hover:text-[#f3e5ab]">
              PRIVACIDADE
            </Link>
            <Link to="/termos" className="hover:text-[#f3e5ab]">
              TERMOS
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

// -----------------------------------------------------------------------------
// helpers

function FeatureCard({ icon, tag, title, desc }) {
  return (
    <div className="border border-[rgba(212,175,55,0.2)] bg-[rgba(16,16,12,0.5)] p-5 tmf-corner-marks">
      <div className="flex items-center justify-between mb-3">
        {icon}
        <span className="tmf-mono text-[9px] tracking-[0.3em] text-[#d4af37] border border-[rgba(212,175,55,0.35)] px-2 py-0.5">
          {tag}
        </span>
      </div>
      <div className="text-white text-lg font-semibold">{title}</div>
      <p className="text-[#a3a39a] text-sm mt-2 leading-relaxed">{desc}</p>
    </div>
  );
}

function PriceCard({ label, price, tagline, features, cta, featured, testid, lookupKey, onSubscribe, busy }) {
  const border = featured
    ? "border-[#d4af37]"
    : "border-[rgba(212,175,55,0.25)]";
  return (
    <div
      className={`relative border ${border} bg-[rgba(16,16,12,0.7)] p-6 tmf-corner-marks`}
      style={
        featured
          ? {
              boxShadow: "0 0 40px rgba(212,175,55,0.15), 0 20px 60px rgba(0,0,0,0.4)",
            }
          : undefined
      }
      data-testid={testid}
    >
      {featured && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 tmf-mono text-[9px] tracking-[0.3em] bg-[#d4af37] text-black font-bold px-3 py-1">
          MAIS ESCOLHIDO
        </span>
      )}
      <div className="tmf-mono text-[10px] tracking-[0.35em] text-[#d4af37] mb-2">{label}</div>
      <div className="flex items-baseline gap-1 mb-1">
        <span className="text-white text-lg">R$</span>
        <span className="tmf-heading tmf-gold-text text-5xl">{price}</span>
        <span className="text-[#a3a39a] text-sm">/mês</span>
      </div>
      <p className="text-[#a3a39a] text-sm mb-5">{tagline}</p>
      <ul className="space-y-2 mb-6">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm text-[#f3e5ab]">
            <CheckCircle size={16} weight="fill" className="text-[#d4af37] flex-shrink-0 mt-0.5" />
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <button
        type="button"
        disabled={busy}
        onClick={() => onSubscribe && onSubscribe(lookupKey)}
        className={featured ? "tmf-btn w-full" : "tmf-btn-secondary w-full inline-flex items-center justify-center gap-2"}
        data-testid={`${testid}-cta`}
        style={busy ? { opacity: 0.55, cursor: "wait" } : undefined}
      >
        <div className="flex items-center justify-center gap-2">
          {featured && <Sparkle size={18} weight="fill" />}
          {busy ? "Abrindo checkout..." : cta}
        </div>
      </button>
    </div>
  );
}

function Faq({ q, a }) {
  return (
    <details className="group border border-[rgba(212,175,55,0.2)] bg-[rgba(16,16,12,0.5)] p-4 open:bg-[rgba(212,175,55,0.06)] open:border-[rgba(212,175,55,0.4)] transition-colors">
      <summary className="flex items-center justify-between cursor-pointer list-none">
        <div className="flex items-center gap-3">
          <Question size={18} weight="duotone" className="text-[#d4af37] flex-shrink-0" />
          <span className="text-white font-semibold text-sm md:text-base">{q}</span>
        </div>
        <span className="tmf-mono text-[#d4af37] text-lg group-open:rotate-45 transition-transform">
          +
        </span>
      </summary>
      <p className="text-[#c8c8be] text-sm mt-3 pl-8 leading-relaxed">{a}</p>
    </details>
  );
}
