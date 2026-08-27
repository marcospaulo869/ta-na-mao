import React, { useRef, useState } from "react";
import { toast } from "sonner";
import { Microphone, Stop } from "@phosphor-icons/react";
import { api } from "@/lib/api";

/**
 * FieldMicButton — tiny microphone next to each Field's cm/mm toggle.
 * Records a short audio, sends to /voice/parse-number and fills the field.
 *
 * Props:
 *   - onValue(number): called with the extracted number (in the internal unit — cm).
 *   - unit: "cm" | "mm" | "°" — used both as context for the AI and to convert.
 *   - testid: base testid so we can address the button in tests.
 */
export function FieldMicButton({ onValue, unit = "cm", testid }) {
  const [recording, setRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const chunksRef = useRef([]);
  const recRef = useRef(null);
  const streamRef = useRef(null);

  const cleanup = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    recRef.current = null;
  };

  const start = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (recording || processing) return;
    if (!navigator.mediaDevices?.getUserMedia) {
      toast.error("Seu navegador não suporta gravação de áudio.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";
      const rec = new MediaRecorder(stream, { mimeType: mime });
      chunksRef.current = [];
      rec.ondataavailable = (ev) => ev.data.size && chunksRef.current.push(ev.data);
      rec.onstop = handleStop;
      rec.start();
      recRef.current = rec;
      setRecording(true);
    } catch {
      toast.error("Permita o microfone nas configurações do navegador.");
      cleanup();
    }
  };

  const stop = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (recRef.current?.state === "recording") recRef.current.stop();
  };

  const handleStop = async () => {
    setRecording(false);
    const blob = new Blob(chunksRef.current, { type: "audio/webm" });
    cleanup();
    if (blob.size < 800) {
      toast.error("Áudio muito curto — fale a medida por 1 a 2 segundos.");
      return;
    }
    setProcessing(true);
    try {
      const fd = new FormData();
      fd.append("audio", blob, "num.webm");
      fd.append("context", `Campo em ${unit}`);
      const { data } = await api.post("/voice/parse-number", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (data.value == null) {
        toast.warning("Não entendi o número. Tente falar assim: \"dois metros e sessenta\".");
        return;
      }
      // Backend always returns value in the natural unit (cm for lengths).
      // The Field stores in cm internally, so no conversion needed here.
      onValue(Number(data.value));
      toast.success(`Preenchido: ${data.value} ${unit === "°" ? "°" : "cm"}`);
    } catch (e) {
      toast.error(e.response?.data?.detail || "Erro ao processar áudio.");
    } finally {
      setProcessing(false);
    }
  };

  const label = recording
    ? "Parar gravação"
    : processing
    ? "Processando"
    : "Ditar por voz";

  return (
    <button
      type="button"
      tabIndex={-1}
      aria-label={label}
      title={label}
      onClick={recording ? stop : start}
      disabled={processing}
      data-testid={testid ? `${testid}-mic` : "field-mic"}
      className={`inline-flex items-center justify-center w-6 h-6 border transition-colors ${
        recording
          ? "border-[#ff6b6b] bg-[#ff6b6b] text-white animate-pulse"
          : processing
          ? "border-[rgba(212,175,55,0.25)] bg-[rgba(212,175,55,0.05)] text-[#d4af37] opacity-60"
          : "border-[rgba(212,175,55,0.35)] bg-transparent text-[#d4af37] hover:bg-[rgba(212,175,55,0.15)]"
      }`}
      style={{ borderRadius: 2 }}
    >
      {recording ? (
        <Stop size={11} weight="fill" />
      ) : (
        <Microphone size={11} weight={processing ? "regular" : "fill"} />
      )}
    </button>
  );
}
