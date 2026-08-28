import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Calculator,
  WhatsappLogo,
  ArrowLeft,
  Copy,
  Lightning,
} from "@phosphor-icons/react";
import AppShell from "@/components/AppShell";
import { Field } from "@/components/Field";
import { estimateCatalog, estimateCalc } from "@/lib/api";
import { useNavigate } from "react-router-dom";

const brl = (v) =>
  `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function OrcamentoRapido() {
  const navigate = useNavigate();
  const [catalog, setCatalog] = useState({ modules: [], mdf_tiers: [] });
  const [moduleId, setModuleId] = useState("balcao_portas_correr");
  const [mdfTier, setMdfTier] = useState("medio");
  const [largura, setLargura] = useState(270);
  const [altura, setAltura] = useState(90);
  const [profundidade, setProfundidade] = useState(50);
  const [qty, setQty] = useState(1);
  const [clienteNome, setClienteNome] = useState("");
  const [phone, setPhone] = useState("");
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    estimateCatalog()
      .then(setCatalog)
      .catch(() => toast.error("Erro ao carregar catálogo"));
  }, []);

  const currentModule = useMemo(
    () => catalog.modules.find((m) => m.id === moduleId),
    [catalog, moduleId]
  );

  const needs = currentModule?.needs || [];

  const handleCalc = async () => {
    if (!currentModule) return;
    setBusy(true);
    try {
      const payload = { module: moduleId, mdf_tier: mdfTier, largura, qty };
      if (needs.includes("altura")) payload.altura = altura;
      if (needs.includes("profundidade")) payload.profundidade = profundidade;
      if (clienteNome.trim()) payload.cliente_nome = clienteNome.trim();
      const data = await estimateCalc(payload);
      setResult(data);
      toast.success("Estimativa gerada!");
    } catch (e) {
      toast.error(e.response?.data?.detail || "Erro no cálculo");
    } finally {
      setBusy(false);
    }
  };

  const handleWhatsApp = () => {
    if (!result) return;
    const cleanPhone = phone.replace(/\D/g, "");
    const text = encodeURIComponent(result.whatsapp_text);
    if (cleanPhone) {
      window.open(`https://wa.me/55${cleanPhone}?text=${text}`, "_blank");
    } else {
      window.open(`https://wa.me/?text=${text}`, "_blank");
    }
    toast.success("WhatsApp aberto — só apertar enviar");
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.whatsapp_text);
    toast.success("Texto copiado!");
  };

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-5 py-6 space-y-6">
        <button
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-2 text-[#a3a39a] hover:text-[#d4af37] text-sm tmf-mono uppercase tracking-widest"
          data-testid="btn-back"
        >
          <ArrowLeft size={14} weight="bold" /> Início
        </button>

        <header>
          <div className="tmf-mono text-[10px] tracking-[0.4em] text-[#d4af37] mb-2 inline-flex items-center gap-2">
            <Lightning size={13} weight="fill" />
            ORÇAMENTO RÁPIDO · 30 SEGUNDOS
          </div>
          <h1 className="tmf-heading text-3xl tmf-gold-text leading-tight">
            Estimador rápido
          </h1>
          <p className="text-[#a3a39a] mt-2 text-sm">
            Para dar uma faixa de preço ao cliente <strong className="text-[#f3e5ab]">antes</strong> da
            visita técnica. Serve pra segurar o lead enquanto você agenda a trena a laser.
          </p>
        </header>

        {/* Form */}
        <div className="tmf-card tmf-corner-marks space-y-5" data-testid="card-form">
          {/* Module */}
          <div>
            <label className="tmf-label">Tipo de móvel</label>
            <select
              value={moduleId}
              onChange={(e) => setModuleId(e.target.value)}
              className="tmf-input"
              data-testid="select-module"
            >
              {catalog.modules.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
            {currentModule && (
              <div className="text-xs text-[#7a7a70] mt-1">{currentModule.descricao}</div>
            )}
          </div>

          {/* MDF Tier */}
          <div>
            <label className="tmf-label">Qualidade do MDF</label>
            <div className="grid grid-cols-3 gap-2">
              {catalog.mdf_tiers.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setMdfTier(t.id)}
                  data-testid={`btn-mdf-${t.id}`}
                  className={`p-3 border tmf-mono text-[10px] tracking-widest uppercase transition-colors ${
                    mdfTier === t.id
                      ? "border-[#d4af37] bg-[rgba(212,175,55,0.12)] text-[#f3e5ab]"
                      : "border-[rgba(212,175,55,0.25)] text-[#a3a39a] hover:border-[#d4af37]"
                  }`}
                >
                  {t.id}
                </button>
              ))}
            </div>
            <div className="text-xs text-[#7a7a70] mt-1">
              {catalog.mdf_tiers.find((t) => t.id === mdfTier)?.label}
            </div>
          </div>

          {/* Dimensions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Field
              label="Largura"
              value={largura}
              onChange={setLargura}
              testid="input-largura"
            />
            {needs.includes("altura") && (
              <Field
                label="Altura"
                value={altura}
                onChange={setAltura}
                testid="input-altura"
              />
            )}
            {needs.includes("profundidade") && (
              <Field
                label="Profundidade"
                value={profundidade}
                onChange={setProfundidade}
                testid="input-profundidade"
              />
            )}
          </div>

          {/* Quantity */}
          <div>
            <label className="tmf-label">Quantidade</label>
            <input
              type="number"
              min={1}
              max={20}
              value={qty}
              onChange={(e) => setQty(Number(e.target.value) || 1)}
              className="tmf-input"
              data-testid="input-qty"
            />
          </div>

          {/* Optional client fields */}
          <div className="pt-2 border-t border-[rgba(212,175,55,0.15)]">
            <div className="tmf-mono text-[9px] tracking-[0.35em] text-[#a3a39a] mb-2">
              PERSONALIZAR MENSAGEM (OPCIONAL)
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="tmf-label">Nome do cliente</label>
                <input
                  type="text"
                  value={clienteNome}
                  onChange={(e) => setClienteNome(e.target.value)}
                  placeholder="Léo"
                  className="tmf-input"
                  data-testid="input-cliente-nome"
                />
              </div>
              <div>
                <label className="tmf-label">WhatsApp (DDD + número)</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="51 99999 8888"
                  className="tmf-input"
                  data-testid="input-cliente-phone"
                />
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCalc}
            disabled={busy}
            className="tmf-btn w-full"
            data-testid="btn-calc"
          >
            <div className="flex items-center justify-center gap-2">
              <Calculator size={18} weight="fill" />
              {busy ? "Calculando..." : "Calcular estimativa"}
            </div>
          </button>
        </div>

        {/* Result */}
        {result && (
          <div className="tmf-card tmf-corner-marks space-y-4" data-testid="card-result">
            <div className="tmf-mono text-[10px] tracking-[0.35em] text-[#d4af37]">
              FAIXA ESTIMADA
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-3 border border-[rgba(163,163,154,0.35)]">
                <div className="tmf-mono text-[9px] text-[#a3a39a]">MÍNIMO</div>
                <div className="tmf-heading text-lg text-[#a3a39a]">{brl(result.min)}</div>
              </div>
              <div className="p-3 border border-[#d4af37] bg-[rgba(212,175,55,0.08)]">
                <div className="tmf-mono text-[9px] text-[#d4af37]">MÉDIO</div>
                <div className="tmf-heading text-xl tmf-gold-text">{brl(result.avg)}</div>
              </div>
              <div className="p-3 border border-[rgba(163,163,154,0.35)]">
                <div className="tmf-mono text-[9px] text-[#a3a39a]">MÁXIMO</div>
                <div className="tmf-heading text-lg text-[#a3a39a]">{brl(result.max)}</div>
              </div>
            </div>

            <div className="text-xs text-[#7a7a70] space-y-1">
              <div>Área calculada: <strong className="text-[#f3e5ab]">{result.area_m2} m²</strong></div>
              <div>Material: {brl(result.material)} · Mão de obra: {brl(result.labor)}</div>
              <div>Base: {result.module_label} · MDF {result.mdf_label}</div>
            </div>

            <div className="pt-3 border-t border-[rgba(212,175,55,0.15)]">
              <div className="tmf-mono text-[9px] tracking-[0.35em] text-[#a3a39a] mb-2">
                MENSAGEM PRONTA PARA WHATSAPP
              </div>
              <pre className="bg-black/40 p-3 text-xs text-[#f3e5ab] whitespace-pre-wrap font-sans leading-relaxed">
                {result.whatsapp_text}
              </pre>

              <div className="grid grid-cols-2 gap-3 mt-4">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="tmf-btn-secondary inline-flex items-center justify-center gap-2"
                  data-testid="btn-copy"
                >
                  <Copy size={16} weight="bold" /> Copiar
                </button>
                <button
                  type="button"
                  onClick={handleWhatsApp}
                  className="tmf-btn inline-flex items-center justify-center gap-2"
                  style={{ background: "linear-gradient(180deg,#25d366,#128c7e)", color: "#fff" }}
                  data-testid="btn-whatsapp"
                >
                  <WhatsappLogo size={18} weight="fill" /> Enviar
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="text-center text-xs text-[#7a7a70] pt-2">
          <p>
            💡 O valor é uma <strong>estimativa</strong> para segurar o lead. Após a visita técnica,
            o app gera o orçamento final com plano de corte.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
