import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Crown, Check, X } from "@phosphor-icons/react";
import AppShell from "@/components/AppShell";
import { useAuth } from "@/context/AuthContext";

const FREE_FEATURES = [
  { ok: true, text: "Até 10 paredes salvas" },
  { ok: true, text: "Captura de fotos com detecção de cor" },
  { ok: true, text: "Todos os 24 campos de medidas" },
  { ok: true, text: "Export para plugin do SketchUp" },
  { ok: false, text: "Paredes ilimitadas" },
  { ok: false, text: "Suporte prioritário" },
];

const PRO_FEATURES = [
  { ok: true, text: "Paredes ilimitadas" },
  { ok: true, text: "Captura de fotos com detecção de cor" },
  { ok: true, text: "Todos os 24 campos de medidas" },
  { ok: true, text: "Export para plugin do SketchUp" },
  { ok: true, text: "Atualizações e novidades primeiro" },
  { ok: true, text: "Suporte prioritário" },
];

export default function Precos() {
  const { user, limits } = useAuth();
  const [plans, setPlans] = useState([]);
  const [busy, setBusy] = useState(null);

  useEffect(() => {
    api.get("/payments/plans").then((r) => setPlans(r.data));
  }, []);

  const handleSubscribe = async (lookupKey) => {
    if (!user) {
      window.location.href = "/login";
      return;
    }
    setBusy(lookupKey);
    try {
      const { data } = await api.post("/payments/checkout", {
        lookup_key: lookupKey,
        origin_url: window.location.origin,
      });
      window.location.href = data.checkout_url;
    } catch (e) {
      toast.error(e.response?.data?.detail || "Erro ao iniciar checkout");
      setBusy(null);
    }
  };

  const isPro = limits?.is_pro;

  return (
    <AppShell
      title="Escolha seu plano"
      subtitle="Comece grátis. Assine quando precisar de paredes ilimitadas."
      back="/"
    >
      <div className="grid md:grid-cols-2 gap-5" data-testid="pricing-grid">
        {/* Free */}
        <div className="tmf-card tmf-corner-marks" data-testid="plan-free">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="tmf-mono text-[10px] tracking-[0.3em] text-[#a3a39a]">
                PLANO GRÁTIS
              </div>
              <h3 className="tmf-heading uppercase text-2xl text-white leading-tight mt-1">
                Starter
              </h3>
            </div>
            {!isPro && <span className="tmf-tag">SEU PLANO</span>}
          </div>
          <div className="tmf-heading text-3xl text-white mb-1">R$ 0</div>
          <div className="tmf-mono text-[10px] tracking-wider text-[#a3a39a] mb-5">
            PARA SEMPRE
          </div>
          <ul className="space-y-2 mb-6">
            {FREE_FEATURES.map((f, i) => (
              <li key={i} className="flex items-center gap-2 text-sm">
                {f.ok ? (
                  <Check size={16} className="text-[#d4af37]" weight="bold" />
                ) : (
                  <X size={16} className="text-[#555]" weight="bold" />
                )}
                <span className={f.ok ? "text-[#f3e5ab]" : "text-[#555] line-through"}>
                  {f.text}
                </span>
              </li>
            ))}
          </ul>
          {!isPro ? (
            <div className="tmf-mono text-[10px] tracking-[0.25em] text-center text-[#a3a39a] py-3 border border-[rgba(243,229,171,0.15)]">
              ATIVO AGORA
            </div>
          ) : (
            <div className="tmf-mono text-[10px] tracking-[0.25em] text-center text-[#a3a39a] py-3 border border-[rgba(243,229,171,0.15)]">
              —
            </div>
          )}
        </div>

        {/* Pro plans */}
        {plans.map((p) => {
          const isMonthly = p.interval === "month";
          const isCurrent = user?.plan === p.code;
          return (
            <div
              key={p.lookup_key}
              className={`tmf-card tmf-corner-marks relative ${!isMonthly ? "md:col-span-2" : ""}`}
              data-testid={`plan-${p.code}`}
              style={{
                background:
                  "linear-gradient(180deg, rgba(212,175,55,0.06), rgba(18,18,15,0.9))",
                borderColor: "rgba(212,175,55,0.4)",
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="tmf-mono text-[10px] tracking-[0.3em] text-[#d4af37]">
                    {isMonthly ? "PLANO MENSAL" : "PLANO ANUAL · MELHOR OFERTA"}
                  </div>
                  <h3 className="tmf-heading uppercase text-2xl tmf-gold-text leading-tight mt-1 flex items-center gap-2">
                    <Crown size={22} weight="fill" className="text-[#d4af37]" />
                    Pro {isMonthly ? "Mensal" : "Anual"}
                  </h3>
                </div>
                {isCurrent && <span className="tmf-tag">SEU PLANO</span>}
              </div>
              <div className="tmf-heading text-3xl tmf-gold-text mb-1">
                {p.display_price}
              </div>
              <div className="tmf-mono text-[10px] tracking-wider text-[#a3a39a] mb-1">
                POR {isMonthly ? "MÊS" : "ANO"}
              </div>
              {!isMonthly && (
                <div className="tmf-mono text-[10px] tracking-wider text-[#d4af37] mb-4">
                  ECONOMIA DE ~2 MESES vs MENSAL
                </div>
              )}
              <ul className="space-y-2 mb-6 mt-4">
                {PRO_FEATURES.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <Check size={16} className="text-[#d4af37]" weight="bold" />
                    <span className="text-[#f3e5ab]">{f.text}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleSubscribe(p.lookup_key)}
                disabled={busy === p.lookup_key || isCurrent}
                className="tmf-btn"
                data-testid={`btn-subscribe-${p.code}`}
                style={busy === p.lookup_key || isCurrent ? { opacity: 0.6 } : {}}
              >
                <div className="flex items-center gap-2">
                  <Crown size={18} weight="fill" />
                  <span>
                    {isCurrent
                      ? "PLANO ATUAL"
                      : busy === p.lookup_key
                      ? "REDIRECIONANDO..."
                      : `Assinar ${isMonthly ? "mensal" : "anual"}`}
                  </span>
                </div>
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-8 text-center text-[#a3a39a] text-xs tmf-mono tracking-widest">
        PAGAMENTO SEGURO VIA STRIPE · CANCELE QUANDO QUISER
      </div>
    </AppShell>
  );
}
