import React, { useState, useEffect, useCallback } from "react";
import "./pitch.css";
import {
  CaretLeft,
  CaretRight,
  Lock,
  Sparkle,
  Camera,
  Cube,
  Microphone,
  ChartLineUp,
  ShieldCheck,
  Handshake,
  Warning,
  Fire,
  Crown,
} from "@phosphor-icons/react";

const PASSCODE = "madeiraforte2026";
const STORAGE_KEY = "tmf.pitch.access";

// --------- SLIDES ---------
const SLIDES = [
  // 1. Cover
  ({ active }) => (
    <div className={`pitch-slide ${active ? "active" : ""}`}>
      <div className="pitch-logo-wrap">
        <img src="/brand/logo.png" alt="Madeira Forte" />
      </div>
      <div className="pitch-pill">
        <span className="pitch-pulse" />
        Apresentação Confidencial
      </div>
      <h1 className="pitch-h1">Tudo Mais Fácil</h1>
      <p className="pitch-lead" style={{ maxWidth: 640, marginTop: "1.5rem" }}>
        Uma oportunidade que existe <strong style={{ color: "#f3e5ab" }}>por poucos dias</strong>,
        para <strong style={{ color: "#f3e5ab" }}>uma única pessoa</strong>,
        antes do mercado descobrir que a máquina já está rodando.
      </p>
      <div className="pitch-tag" style={{ marginTop: "2rem" }}>Deslize para conhecer</div>
    </div>
  ),

  // 2. The Pain
  ({ active }) => (
    <div className={`pitch-slide ${active ? "active" : ""}`}>
      <div className="pitch-tag">A dor real · Brasil · Todo mês</div>
      <div className="pitch-big-number">
        490.000
        <small>Profissionais perdem 4h por semana medindo à mão</small>
      </div>
      <p className="pitch-lead" style={{ marginTop: "2rem" }}>
        <strong style={{ color: "#f3e5ab" }}>180 mil arquitetos</strong> +
        <strong style={{ color: "#f3e5ab" }}> 60 mil marcenarias</strong> +
        <strong style={{ color: "#f3e5ab" }}> 250 mil autônomos</strong>
        <br />
        Todo mês, todo cliente, o mesmo caderno, a mesma trena, o mesmo erro.
      </p>
    </div>
  ),

  // 3. The Cost
  ({ active }) => (
    <div className={`pitch-slide ${active ? "active" : ""}`}>
      <div className="pitch-tag">O tamanho do prejuízo</div>
      <div className="pitch-big-number" style={{ color: "#c8412e" }}>
        R$ 1,17 BI
        <small>por mês em retrabalho — dinheiro jogado fora</small>
      </div>
      <p className="pitch-lead" style={{ marginTop: "2rem", maxWidth: 640 }}>
        Cada marceneiro perde em média <strong style={{ color: "#f3e5ab" }}>R$ 2.400 por mês</strong> refazendo peças com medida errada.
        Cada arquiteto perde <strong style={{ color: "#f3e5ab" }}>de 4 a 8 horas por semana</strong> convertendo trena + foto em CAD.
      </p>
      <div className="pitch-tag" style={{ marginTop: "2rem", color: "#c8412e" }}>
        <Warning size={14} weight="fill" /> É um dos maiores desperdícios silenciosos do setor
      </div>
    </div>
  ),

  // 4. The Solution
  ({ active }) => (
    <div className={`pitch-slide ${active ? "active" : ""}`}>
      <div className="pitch-tag">O que já construímos</div>
      <h2 className="pitch-h2">
        O celular vira o instrumento.<br />
        A IA vira o olhar. O 3D nasce sozinho.
      </h2>
      <div className="pitch-metric-grid">
        <div className="pitch-metric">
          <Microphone size={28} weight="duotone" color="#d4af37" />
          <div className="pitch-metric-value" style={{ marginTop: "0.5rem" }}>Voz</div>
          <div className="pitch-metric-label">Ditar medidas</div>
          <div className="pitch-metric-hint">Sem digitar, sem parar de trabalhar</div>
        </div>
        <div className="pitch-metric">
          <Camera size={28} weight="duotone" color="#d4af37" />
          <div className="pitch-metric-value" style={{ marginTop: "0.5rem" }}>Visão IA</div>
          <div className="pitch-metric-label">Foto vira medida</div>
          <div className="pitch-metric-hint">Aponta o celular, a IA identifica cores, portas, janelas</div>
        </div>
        <div className="pitch-metric">
          <Cube size={28} weight="duotone" color="#d4af37" />
          <div className="pitch-metric-value" style={{ marginTop: "0.5rem" }}>SketchUp</div>
          <div className="pitch-metric-label">Plugin oficial</div>
          <div className="pitch-metric-hint">Um clique gera parede, armário, lastro em 3D</div>
        </div>
      </div>
      <div className="pitch-tag" style={{ marginTop: "1.5rem" }}>
        <Sparkle size={13} weight="fill" /> Já no ar · Já cobrando · Já tem cliente pagando
      </div>
    </div>
  ),

  // 5. The Magic Moment
  ({ active }) => (
    <div className={`pitch-slide ${active ? "active" : ""}`}>
      <div className="pitch-tag">O momento que apaixona</div>
      <h2 className="pitch-h2">4 horas de trabalho <br /> viram <span style={{ color: "#d4af37" }}>3 minutos</span></h2>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
        gap: "0.75rem",
        maxWidth: 900,
        width: "100%",
        marginTop: "2rem",
      }}>
        {[
          { n: "01", label: "Abre o app", detail: "PWA, não baixa da loja" },
          { n: "02", label: "Dita a parede", detail: "\"Pé direito 260, largura 320...\"" },
          { n: "03", label: "Tira 1 foto", detail: "IA identifica cor e detalhes" },
          { n: "04", label: "Salva no projeto", detail: "Cliente vira pasta organizada" },
          { n: "05", label: "Abre o SketchUp", detail: "Plugin importa em 1 clique" },
          { n: "06", label: "Envia PDF", detail: "Cliente recebe pelo WhatsApp" },
        ].map((s, i) => (
          <div key={i} className="pitch-metric" style={{ padding: "0.85rem" }}>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: "#d4af37", letterSpacing: "0.2em" }}>
              PASSO {s.n}
            </div>
            <div style={{ fontWeight: 700, color: "#fff", marginTop: 4, fontSize: "0.95rem" }}>{s.label}</div>
            <div style={{ color: "#a3a39a", fontSize: "0.75rem", marginTop: 4 }}>{s.detail}</div>
          </div>
        ))}
      </div>
    </div>
  ),

  // 6. Market
  ({ active }) => (
    <div className={`pitch-slide ${active ? "active" : ""}`}>
      <div className="pitch-tag">O mapa da mina</div>
      <h2 className="pitch-h2">Começamos no Brasil,<br />mas o teto é o mundo.</h2>
      <div className="pitch-metric-grid">
        <div className="pitch-metric">
          <div className="pitch-metric-value">490 mil</div>
          <div className="pitch-metric-label">Brasil · Ano 1–3</div>
          <div className="pitch-metric-hint">Meta 1,5% = 7 mil pagantes</div>
        </div>
        <div className="pitch-metric">
          <div className="pitch-metric-value">1,2 mi</div>
          <div className="pitch-metric-label">LATAM + PT · Ano 3</div>
          <div className="pitch-metric-hint">ES + PT-PT · Argentina, México, Colômbia</div>
        </div>
        <div className="pitch-metric">
          <div className="pitch-metric-value">8 milhões</div>
          <div className="pitch-metric-label">Global · Ano 4–5</div>
          <div className="pitch-metric-hint">EUA, Europa, Ásia · Inglês + traduções</div>
        </div>
      </div>
      <p className="pitch-lead" style={{ marginTop: "1.5rem" }}>
        Ticket médio de <strong style={{ color: "#f3e5ab" }}>R$ 37/mês por usuário</strong>.
        <br />Modelo de assinatura recorrente — receita <strong style={{ color: "#f3e5ab" }}>previsível e escalável</strong>.
      </p>
    </div>
  ),

  // 7. Projection
  ({ active }) => (
    <div className={`pitch-slide ${active ? "active" : ""}`}>
      <div className="pitch-tag">Projeção conservadora · 5 anos</div>
      <h2 className="pitch-h2">A curva do dinheiro</h2>
      <table className="pitch-table" style={{ marginTop: "1rem" }}>
        <thead>
          <tr>
            <th>Ano</th>
            <th>Assinantes</th>
            <th>Receita</th>
            <th>Lucro</th>
            <th>Valuation</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>1</td><td>500</td><td>R$ 110k</td><td>R$ 60k</td><td>R$ 1M</td></tr>
          <tr><td>2</td><td>3.000</td><td>R$ 760k</td><td>R$ 400k</td><td>R$ 5M</td></tr>
          <tr><td>3</td><td>8.000</td><td className="highlight">R$ 2,5M</td><td>R$ 1,3M</td><td>R$ 15M</td></tr>
          <tr><td>4</td><td>20.000</td><td>R$ 6,5M</td><td>R$ 3,3M</td><td>R$ 40M</td></tr>
          <tr><td className="highlight">5</td><td className="highlight">40.000</td><td className="highlight">R$ 14M</td><td className="highlight">R$ 7,5M</td><td className="highlight">R$ 85–100M</td></tr>
        </tbody>
      </table>
      <p className="pitch-lead" style={{ marginTop: "1.5rem", maxWidth: 640 }}>
        <strong style={{ color: "#f3e5ab" }}>Cenário conservador.</strong> Com marketing agressivo e time montado, a curva dobra.
      </p>
    </div>
  ),

  // 8. Why now
  ({ active }) => (
    <div className={`pitch-slide ${active ? "active" : ""}`}>
      <div className="pitch-tag">Por que agora e nunca antes</div>
      <h2 className="pitch-h2">Quatro ondas convergindo <br /> pela primeira vez na história</h2>
      <div className="pitch-metric-grid">
        <div className="pitch-metric">
          <Fire size={28} weight="duotone" color="#d4af37" />
          <div className="pitch-metric-value" style={{ marginTop: "0.5rem" }}>IA madura</div>
          <div className="pitch-metric-hint">Reconhecimento visual barateou 90% em 12 meses</div>
        </div>
        <div className="pitch-metric">
          <Fire size={28} weight="duotone" color="#d4af37" />
          <div className="pitch-metric-value" style={{ marginTop: "0.5rem" }}>5G no Brasil</div>
          <div className="pitch-metric-hint">Upload de foto em segundos, até no interior</div>
        </div>
        <div className="pitch-metric">
          <Fire size={28} weight="duotone" color="#d4af37" />
          <div className="pitch-metric-value" style={{ marginTop: "0.5rem" }}>Geração nova</div>
          <div className="pitch-metric-hint">Marceneiros digitais assumindo o negócio dos pais</div>
        </div>
        <div className="pitch-metric">
          <Fire size={28} weight="duotone" color="#d4af37" />
          <div className="pitch-metric-value" style={{ marginTop: "0.5rem" }}>Zero concorrente</div>
          <div className="pitch-metric-hint">Softwares atuais são caros, desktop, complicados</div>
        </div>
      </div>
    </div>
  ),

  // 9. Moat
  ({ active }) => (
    <div className={`pitch-slide ${active ? "active" : ""}`}>
      <div className="pitch-tag">O que ninguém consegue copiar</div>
      <h2 className="pitch-h2">
        Quatro barreiras já sendo construídas <br />
        <span style={{ color: "#d4af37" }}>enquanto ninguém está olhando</span>
      </h2>
      <div className="pitch-metric-grid">
        <div className="pitch-metric">
          <ShieldCheck size={24} weight="duotone" color="#d4af37" />
          <div className="pitch-metric-value" style={{ marginTop: "0.5rem", fontSize: "1.3rem" }}>Dados</div>
          <div className="pitch-metric-hint">Cada parede capturada treina a IA. Copiador começa 2 anos atrás.</div>
        </div>
        <div className="pitch-metric">
          <ShieldCheck size={24} weight="duotone" color="#d4af37" />
          <div className="pitch-metric-value" style={{ marginTop: "0.5rem", fontSize: "1.3rem" }}>Plugin</div>
          <div className="pitch-metric-hint">Efeito de rede no SketchUp: escritório inteiro amarrado à nossa solução.</div>
        </div>
        <div className="pitch-metric">
          <ShieldCheck size={24} weight="duotone" color="#d4af37" />
          <div className="pitch-metric-value" style={{ marginTop: "0.5rem", fontSize: "1.3rem" }}>Marca</div>
          <div className="pitch-metric-hint">INPI + patente de método já em protocolo.</div>
        </div>
        <div className="pitch-metric">
          <ShieldCheck size={24} weight="duotone" color="#d4af37" />
          <div className="pitch-metric-value" style={{ marginTop: "0.5rem", fontSize: "1.3rem" }}>Velocidade</div>
          <div className="pitch-metric-hint">Enquanto competidor pensa em começar, já estamos em 3 países.</div>
        </div>
      </div>
    </div>
  ),

  // 10. The Offer
  ({ active }) => (
    <div className={`pitch-slide ${active ? "active" : ""}`}>
      <div className="pitch-pill">
        <Crown size={12} weight="fill" />
        Uma única vaga · Uma única vez
      </div>
      <h2 className="pitch-h2" style={{ maxWidth: 800 }}>
        Você não compra empresa. <br />
        <span style={{ color: "#d4af37" }}>Você compra um pedaço da mina.</span>
      </h2>
      <div style={{
        border: "1px solid rgba(212, 175, 55, 0.4)",
        background: "rgba(212, 175, 55, 0.05)",
        padding: "1.75rem",
        maxWidth: 720,
        width: "100%",
        marginTop: "1rem",
      }}>
        <table className="pitch-table" style={{ margin: 0 }}>
          <tbody>
            <tr>
              <td style={{ color: "#a3a39a" }}>Formato</td>
              <td className="highlight">SCP · Sociedade em Conta de Participação</td>
            </tr>
            <tr>
              <td style={{ color: "#a3a39a" }}>Aporte</td>
              <td className="highlight">R$ 50 mil a R$ 150 mil</td>
            </tr>
            <tr>
              <td style={{ color: "#a3a39a" }}>Retorno</td>
              <td className="highlight">15% a 20% da receita mensal</td>
            </tr>
            <tr>
              <td style={{ color: "#a3a39a" }}>Teto (cap)</td>
              <td className="highlight">Até 3× o valor investido</td>
            </tr>
            <tr>
              <td style={{ color: "#a3a39a" }}>Prazo estimado</td>
              <td className="highlight">12 a 18 meses para retorno total</td>
            </tr>
            <tr>
              <td style={{ color: "#a3a39a" }}>Bônus residual</td>
              <td className="highlight">+ 5% por 24 meses após o cap</td>
            </tr>
            <tr>
              <td style={{ color: "#a3a39a" }}>Participação societária</td>
              <td className="highlight">Zero · Sem voto · Sem gestão</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="pitch-lead" style={{ marginTop: "1.25rem", maxWidth: 640 }}>
        O controle e a operação continuam <strong style={{ color: "#f3e5ab" }}>100% comigo</strong> —
        o que preserva a empresa para o crescimento futuro sem travar rodadas seguintes.
      </p>
    </div>
  ),

  // 11. Close
  ({ active }) => (
    <div className={`pitch-slide ${active ? "active" : ""}`}>
      <div className="pitch-pill">
        <Handshake size={12} weight="fill" />
        Fim da apresentação
      </div>
      <h1 className="pitch-h1" style={{ fontSize: "clamp(2rem, 6vw, 3.75rem)" }}>
        Uma vaga.<br />
        Uma conversa.<br />
        Uma decisão.
      </h1>
      <p className="pitch-lead" style={{ marginTop: "2rem", maxWidth: 720 }}>
        Se aqui, olhando essa apresentação, seu instinto disse
        <strong style={{ color: "#f3e5ab" }}> "eu quero estar dentro dessa" </strong> —
        me chame hoje mesmo.
        <br /><br />
        Uma vaga fica aberta enquanto essa conversa acontece.
        Depois disso, próxima captação vem em condições piores, com fundo, com diluição, com valuation maior.
      </p>
      <div className="pitch-tag" style={{ marginTop: "2rem" }}>
        <ChartLineUp size={13} weight="fill" /> A mina já existe · falta você entrar antes do mercado descobrir
      </div>
    </div>
  ),
];

// --------- MAIN COMPONENT ---------
export default function ApresentacaoPrivada() {
  const [unlocked, setUnlocked] = useState(false);
  const [attempt, setAttempt] = useState("");
  const [error, setError] = useState("");
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) === "1") setUnlocked(true);
    } catch {}
  }, []);

  const submitCode = (e) => {
    e.preventDefault();
    if (attempt.trim().toLowerCase() === PASSCODE) {
      try { localStorage.setItem(STORAGE_KEY, "1"); } catch {}
      setUnlocked(true);
      setError("");
    } else {
      setError("Código inválido.");
      setAttempt("");
    }
  };

  const next = useCallback(
    () => setCurrent((c) => Math.min(c + 1, SLIDES.length - 1)),
    []
  );
  const prev = useCallback(
    () => setCurrent((c) => Math.max(c - 1, 0)),
    []
  );

  // Keyboard nav
  useEffect(() => {
    if (!unlocked) return;
    const onKey = (e) => {
      if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); next(); }
      if (e.key === "ArrowLeft") { e.preventDefault(); prev(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [unlocked, next, prev]);

  // Touch swipe
  useEffect(() => {
    if (!unlocked) return;
    let x = 0;
    const start = (e) => { x = e.touches[0].clientX; };
    const end = (e) => {
      const dx = (e.changedTouches[0].clientX - x);
      if (dx < -60) next();
      if (dx > 60) prev();
    };
    document.addEventListener("touchstart", start, { passive: true });
    document.addEventListener("touchend", end, { passive: true });
    return () => {
      document.removeEventListener("touchstart", start);
      document.removeEventListener("touchend", end);
    };
  }, [unlocked, next, prev]);

  if (!unlocked) {
    return (
      <div className="pitch-gate" data-testid="pitch-gate">
        <div className="pitch-corners"><span /></div>
        <div className="pitch-aura" />
        <Lock size={40} weight="duotone" color="#d4af37" />
        <div className="pitch-tag" style={{ margin: "1.5rem 0 0.5rem" }}>
          Apresentação Privada
        </div>
        <h1 className="pitch-h1" style={{ fontSize: "clamp(1.75rem, 5vw, 2.8rem)" }}>
          Área Restrita
        </h1>
        <p className="pitch-lead" style={{ marginBottom: "1.5rem" }}>
          Digite o código de acesso que você recebeu.
        </p>
        <form onSubmit={submitCode}>
          <input
            type="password"
            value={attempt}
            onChange={(e) => { setAttempt(e.target.value); setError(""); }}
            placeholder="código"
            autoFocus
            data-testid="pitch-passcode-input"
          />
          <div style={{ minHeight: 22, color: "#c8412e", fontSize: 12, textAlign: "center", marginTop: 10 }}>
            {error}
          </div>
          <div style={{ textAlign: "center" }}>
            <button type="submit" data-testid="pitch-passcode-submit">Entrar</button>
          </div>
        </form>
      </div>
    );
  }

  const progress = ((current + 1) / SLIDES.length) * 100;

  return (
    <div className="pitch-root" data-testid="pitch-root">
      <div className="pitch-progress" style={{ width: `${progress}%` }} />
      <div className="pitch-aura" />
      <div className="pitch-grid" />
      <div className="pitch-grain" />
      <div className="pitch-corners"><span /></div>

      {SLIDES.map((SlideCmp, i) => (
        <SlideCmp key={i} active={i === current} />
      ))}

      <div className="pitch-nav">
        <button
          className="pitch-nav-btn"
          onClick={prev}
          disabled={current === 0}
          aria-label="Anterior"
          data-testid="pitch-prev"
        >
          <CaretLeft size={20} weight="bold" />
        </button>
        <div className="pitch-slide-counter" data-testid="pitch-counter">
          {String(current + 1).padStart(2, "0")} / {String(SLIDES.length).padStart(2, "0")}
        </div>
        <button
          className="pitch-nav-btn"
          onClick={next}
          disabled={current === SLIDES.length - 1}
          aria-label="Próximo"
          data-testid="pitch-next"
        >
          <CaretRight size={20} weight="bold" />
        </button>
      </div>
    </div>
  );
}
