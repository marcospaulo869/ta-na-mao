import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { CheckCircle, XCircle, ArrowRight } from "@phosphor-icons/react";
import AppShell from "@/components/AppShell";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export function PagamentoSucesso() {
  const { search } = useLocation();
  const navigate = useNavigate();
  const { refresh } = useAuth();
  const [status, setStatus] = useState("checking"); // checking | paid | expired | failed
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams(search);
    const sessionId = params.get("session_id");
    if (!sessionId) {
      setStatus("failed");
      return;
    }

    let cancelled = false;
    const poll = async (i) => {
      if (cancelled) return;
      if (i >= 10) {
        setStatus("expired");
        return;
      }
      try {
        const { data } = await api.get(`/payments/status/${sessionId}`);
        setAttempts(i + 1);
        if (data.payment_status === "paid") {
          setStatus("paid");
          await refresh();
          return;
        }
        if (["failed", "expired"].includes(data.payment_status)) {
          setStatus("failed");
          return;
        }
        setTimeout(() => poll(i + 1), 2000);
      } catch (e) {
        setStatus("failed");
      }
    };
    poll(0);
    return () => {
      cancelled = true;
    };
  }, [search, refresh]);

  return (
    <AppShell title="Pagamento" back="/" subtitle="Aguarde a confirmação...">
      <div className="tmf-card tmf-corner-marks text-center py-12" data-testid={`payment-status-${status}`}>
        {status === "checking" && (
          <>
            <div className="tmf-mono text-[10px] tracking-[0.35em] text-[#d4af37] mb-4">
              CONFIRMANDO...
            </div>
            <div className="w-12 h-12 mx-auto border-2 border-[#d4af37] border-t-transparent rounded-full animate-spin" />
            <p className="text-[#a3a39a] mt-6 text-sm">
              Tentativa {attempts} de 10 · Não feche a página
            </p>
          </>
        )}
        {status === "paid" && (
          <>
            <CheckCircle size={64} weight="fill" className="mx-auto text-[#d4af37]" />
            <h2 className="tmf-heading text-3xl tmf-gold-text mt-4">Pagamento aprovado!</h2>
            <p className="text-[#a3a39a] mt-3 max-w-md mx-auto">
              Seu plano PRO está ativo. Agora você tem paredes ilimitadas + tudo do plano
              gratuito.
            </p>
            <Link
              to="/"
              className="tmf-btn mt-6 max-w-xs mx-auto"
              data-testid="btn-back-home"
            >
              <div className="flex items-center gap-2">
                <span>Começar a usar</span>
                <ArrowRight size={18} weight="bold" />
              </div>
            </Link>
          </>
        )}
        {(status === "failed" || status === "expired") && (
          <>
            <XCircle size={64} weight="fill" className="mx-auto text-[#ff6b6b]" />
            <h2 className="tmf-heading text-2xl text-white mt-4">
              {status === "expired" ? "Confirmação demorou" : "Pagamento não confirmado"}
            </h2>
            <p className="text-[#a3a39a] mt-3 max-w-md mx-auto text-sm">
              Se o valor foi debitado, ele será confirmado em instantes. Você pode tentar
              novamente ou voltar para a home.
            </p>
            <div className="flex gap-3 justify-center mt-6">
              <Link to="/precos" className="tmf-btn-secondary">
                Ver planos
              </Link>
              <Link to="/" className="tmf-btn-secondary">
                Home
              </Link>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}

export function PagamentoCancelado() {
  return (
    <AppShell title="Pagamento cancelado" back="/precos">
      <div className="tmf-card text-center py-12" data-testid="payment-cancelled">
        <XCircle size={64} weight="duotone" className="mx-auto text-[#a3a39a]" />
        <h2 className="tmf-heading text-2xl text-white mt-4">Sem problemas!</h2>
        <p className="text-[#a3a39a] mt-3">
          Você pode continuar usando o plano gratuito ou voltar aos planos quando quiser.
        </p>
        <Link to="/precos" className="tmf-btn-secondary mt-6 inline-block">
          Ver planos
        </Link>
      </div>
    </AppShell>
  );
}
