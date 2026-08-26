import React, { useRef, useState } from "react";
import { toast } from "sonner";
import { Camera, Sparkle, X } from "@phosphor-icons/react";
import { api } from "@/lib/api";

/**
 * VisionCapture — floating card that lets the user snap a photo of the wall.
 * Gemini identifies doors, windows, sockets, columns, beams etc. and
 * onIdentified(prefill) is called with a partial wall dict ready to merge.
 */
export default function VisionCapture({ onIdentified }) {
  const inputRef = useRef(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);

  const openCamera = () => inputRef.current?.click();

  const handleFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Selecione uma imagem JPG ou PNG.");
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      toast.error("Foto muito grande (máx 15 MB).");
      return;
    }
    setProcessing(true);
    setResult(null);
    try {
      const fd = new FormData();
      fd.append("photo", file, file.name || "wall.jpg");
      const { data } = await api.post("/vision/analyze", fd, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 90000,
      });
      if (!data.valid) {
        toast.warning("Foto não reconhecida como parede", {
          description: data.reason || "Tire uma foto clara da parede, sem obstáculos.",
        });
        setResult({ valid: false, reason: data.reason });
        return;
      }
      const prefill = data.prefill || {};
      const totalPrefill = Object.values(prefill).reduce(
        (n, arr) => n + (Array.isArray(arr) ? arr.length : 0),
        0
      );
      setResult({
        valid: true,
        descricao: data.descricao,
        elementos_identificados: data.elementos_identificados || 0,
        cor_predominante_hex: data.cor_predominante_hex,
        totalPrefill,
        prefill,
      });
      if (totalPrefill > 0) {
        onIdentified?.(prefill, data);
        toast.success(`IA identificou ${totalPrefill} elemento${totalPrefill === 1 ? "" : "s"}!`, {
          description: data.descricao || "",
        });
      } else {
        toast.info("Nenhum elemento identificado com alta confiança.", {
          description: "Preencha manualmente ou tente outra foto.",
        });
      }
    } catch (e) {
      toast.error(e.response?.data?.detail || "Falha na análise da IA");
    } finally {
      setProcessing(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div
      className="border border-[rgba(212,175,55,0.35)] p-4 bg-[rgba(212,175,55,0.04)] tmf-corner-marks"
      data-testid="vision-capture"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="tmf-tag">IA · VISÃO</span>
            {processing && (
              <span className="tmf-mono text-[10px] tracking-wider text-[#d4af37] flex items-center gap-1">
                <Sparkle size={12} weight="fill" className="animate-pulse" />
                ANALISANDO...
              </span>
            )}
          </div>
          <div className="text-white text-sm mt-1 font-semibold">
            {processing
              ? "Gemini identificando portas, janelas, tomadas..."
              : "Foto da parede (IA identifica)"}
          </div>
          {!processing && !result && (
            <div className="tmf-mono text-[10px] text-[#a3a39a] tracking-wider mt-1">
              A IA CONTA PORTAS, JANELAS, TOMADAS, VIGAS E COLUNAS
            </div>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          data-testid="vision-input-file"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        <button
          type="button"
          onClick={openCamera}
          disabled={processing}
          data-testid="btn-vision-capture"
          className="w-14 h-14 rounded-full flex items-center justify-center text-black font-bold transition-transform hover:scale-105"
          style={{
            background: "linear-gradient(135deg, #f3e5ab, #d4af37)",
            boxShadow: "0 6px 20px rgba(212,175,55,0.4)",
            opacity: processing ? 0.6 : 1,
          }}
          aria-label="Tirar foto"
        >
          <Camera size={26} weight="fill" />
        </button>
      </div>

      {result?.valid && result.totalPrefill > 0 && (
        <div
          className="mt-3 pt-3 border-t border-[rgba(243,229,171,0.15)]"
          data-testid="vision-result"
        >
          <div className="tmf-mono text-[9px] tracking-[0.3em] text-[#d4af37] mb-1">
            {result.elementos_identificados} ELEMENTO(S) IDENTIFICADO(S)
          </div>
          <div className="text-[#f3e5ab] text-sm italic leading-relaxed">
            "{result.descricao}"
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {Object.entries(result.prefill).map(([key, arr]) => (
              <span
                key={key}
                className="tmf-mono text-[9px] px-2 py-0.5 border border-[rgba(212,175,55,0.4)] text-[#f3e5ab] uppercase tracking-wider"
              >
                {arr.length} {key.replace(/_/g, " ")}
              </span>
            ))}
          </div>
          <div className="tmf-mono text-[9px] text-[#a3a39a] tracking-wider mt-2">
            ↓ VALORES ADICIONADOS ABAIXO — AJUSTE AS MEDIDAS EXATAS
          </div>
        </div>
      )}

      {result && !result.valid && (
        <div
          className="mt-3 pt-3 border-t border-[rgba(255,107,107,0.25)] flex items-start gap-2"
          data-testid="vision-error"
        >
          <X size={14} weight="bold" className="text-[#ff8f8f] mt-0.5 flex-shrink-0" />
          <div className="text-[#ff8f8f] text-xs leading-relaxed">
            {result.reason || "Não foi possível analisar a imagem."}
          </div>
        </div>
      )}
    </div>
  );
}
