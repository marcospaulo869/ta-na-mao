import React, { useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AppShell from "@/components/AppShell";
import { Camera, CheckCircle, Upload, Palette } from "@phosphor-icons/react";
import { toast } from "sonner";
import { createPhoto } from "@/lib/api";
import { extractDominantColorFromDataUrl, fileToDataUrl } from "@/lib/color";

const TIPO_INFO = {
  parede: {
    titulo: "Foto — Cor da Parede",
    hint: "Aponte para uma região limpa e bem iluminada da parede.",
  },
  piso: {
    titulo: "Foto — Cor do Piso",
    hint: "Enquadre uma região sem sombras ou reflexos do piso.",
  },
};

export default function CapturarFoto() {
  const { tipo } = useParams();
  const navigate = useNavigate();
  const info = TIPO_INFO[tipo] || TIPO_INFO.parede;
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [color, setColor] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleFile = async (file) => {
    if (!file) return;
    const dataUrl = await fileToDataUrl(file);
    setPreview(dataUrl);
    try {
      const hex = await extractDominantColorFromDataUrl(dataUrl);
      setColor(hex);
    } catch (e) {
      setColor("#888888");
    }
  };

  const handleSave = async () => {
    if (!preview || !color) return;
    setSaving(true);
    try {
      await createPhoto({
        tipo,
        data_base64: preview,
        cor_dominante_hex: color,
      });
      toast.success("Foto salva com sucesso!", {
        description: `Cor dominante ${color} armazenada.`,
      });
      navigate("/");
    } catch (e) {
      toast.error("Erro ao salvar foto", { description: e?.message || "" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell title={info.titulo} subtitle={info.hint} back="/">
      <div className="tmf-card tmf-corner-marks" data-testid="foto-capture-card">
        {!preview ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Camera size={64} weight="duotone" className="text-[#d4af37]" />
            <p className="mt-4 text-[#a3a39a] max-w-xs">
              Toque no botão abaixo para abrir sua câmera ou selecionar uma imagem.
            </p>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              data-testid="input-file-foto"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
            <button
              className="tmf-btn mt-8 max-w-xs"
              onClick={() => inputRef.current?.click()}
              data-testid="btn-abrir-camera"
            >
              <div className="flex items-center gap-3">
                <Upload size={22} weight="bold" />
                <span>Capturar imagem</span>
              </div>
            </button>
          </div>
        ) : (
          <div className="space-y-5" data-testid="foto-preview-block">
            <div className="relative overflow-hidden border border-[rgba(243,229,171,0.2)]">
              <img
                src={preview}
                alt="preview"
                className="w-full max-h-[380px] object-cover"
                data-testid="foto-preview-img"
              />
            </div>

            {color && (
              <div className="flex items-stretch gap-4">
                <div
                  className="w-24 h-24 border border-[rgba(243,229,171,0.35)] flex-shrink-0"
                  style={{ background: color }}
                  data-testid="foto-color-swatch"
                />
                <div className="flex-1 flex flex-col justify-center">
                  <div className="flex items-center gap-2 text-[#f3e5ab]">
                    <Palette size={18} weight="duotone" />
                    <span className="tmf-mono text-[10px] tracking-[0.3em]">
                      COR DOMINANTE
                    </span>
                  </div>
                  <div
                    className="tmf-heading text-2xl font-black text-white mt-1"
                    data-testid="foto-color-hex"
                  >
                    {color}
                  </div>
                  <div className="tmf-mono text-[10px] text-[#a3a39a] mt-1">
                    SERÁ APLICADA COMO MATERIAL NO SKETCHUP
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                className="tmf-btn-secondary flex-1"
                data-testid="btn-retirar-foto"
                onClick={() => {
                  setPreview(null);
                  setColor(null);
                }}
              >
                Trocar imagem
              </button>
              <button
                className="tmf-btn flex-1"
                data-testid="btn-salvar-foto"
                onClick={handleSave}
                disabled={saving}
                style={saving ? { opacity: 0.6 } : {}}
              >
                <div className="flex items-center gap-2">
                  <CheckCircle size={20} weight="fill" />
                  <span>{saving ? "SALVANDO..." : "Salvar foto"}</span>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
