import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Microphone, Stop, X, Check, WaveSine } from "@phosphor-icons/react";
import { api } from "@/lib/api";

/**
 * VoiceRecorder — floating card with big microphone button.
 * On stop, uploads audio to /api/voice/parse and calls onParsed(parsed, transcription).
 */
export default function VoiceRecorder({ onParsed, currentWall }) {
  const [recording, setRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [duration, setDuration] = useState(0);
  const [permissionError, setPermissionError] = useState(null);
  const mediaRecRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => () => stopStream(), []);

  const stopStream = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const start = async () => {
    setPermissionError(null);
    setTranscription("");
    if (!navigator.mediaDevices?.getUserMedia) {
      setPermissionError("Seu navegador não suporta gravação de áudio.");
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
      rec.ondataavailable = (e) => e.data.size && chunksRef.current.push(e.data);
      rec.onstop = handleStop;
      rec.start();
      mediaRecRef.current = rec;
      setRecording(true);
      setDuration(0);
      timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
    } catch (e) {
      setPermissionError(
        "Permissão do microfone negada. Vá em Ajustes → Site → Microfone e permita."
      );
    }
  };

  const stop = () => {
    if (mediaRecRef.current?.state === "recording") mediaRecRef.current.stop();
  };

  const handleStop = async () => {
    setRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
    stopStream();
    const blob = new Blob(chunksRef.current, { type: "audio/webm" });
    if (blob.size < 1000) {
      toast.error("Áudio muito curto. Tente falar por pelo menos 2 segundos.");
      return;
    }
    setProcessing(true);
    try {
      const fd = new FormData();
      fd.append("audio", blob, "voice.webm");
      const { data } = await api.post("/voice/parse", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setTranscription(data.transcription || "");
      if (data.parsed && Object.keys(data.parsed).length > 0) {
        onParsed?.(data.parsed);
        const n = data.fields_captured;
        toast.success(`${n} campo${n === 1 ? "" : "s"} preenchido${n === 1 ? "" : "s"} pela IA!`);
      } else {
        toast.warning("Não consegui extrair medidas. Tente novamente com frases claras.");
      }
    } catch (e) {
      toast.error(e.response?.data?.detail || "Erro ao processar áudio");
    } finally {
      setProcessing(false);
    }
  };

  const mm = String(Math.floor(duration / 60)).padStart(2, "0");
  const ss = String(duration % 60).padStart(2, "0");

  return (
    <div
      className="border border-[rgba(212,175,55,0.35)] p-4 bg-[rgba(212,175,55,0.04)] tmf-corner-marks"
      data-testid="voice-recorder"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="tmf-tag">IA · DITADO</span>
            {recording && (
              <span className="tmf-mono text-[10px] tracking-wider text-[#ff6b6b] flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#ff6b6b] animate-pulse" />
                REC {mm}:{ss}
              </span>
            )}
            {processing && (
              <span className="tmf-mono text-[10px] tracking-wider text-[#d4af37] flex items-center gap-1">
                <WaveSine size={12} weight="bold" className="animate-pulse" />
                PROCESSANDO...
              </span>
            )}
          </div>
          <div className="text-white text-sm mt-1 font-semibold">
            {recording
              ? "Fale as medidas — pé direito, portas, tomadas..."
              : processing
              ? "Transcrevendo e extraindo dados"
              : "Preencha a parede falando (IA)"}
          </div>
          {!recording && !processing && (
            <div className="tmf-mono text-[10px] text-[#a3a39a] tracking-wider mt-1">
              EX: "PÉ DIREITO 2,80, LARGURA 4 METROS, 1 PORTA DE 80 POR 210, 3 TOMADAS..."
            </div>
          )}
        </div>
        {!recording ? (
          <button
            type="button"
            onClick={start}
            disabled={processing}
            data-testid="btn-start-recording"
            className="w-14 h-14 rounded-full flex items-center justify-center text-black font-bold transition-transform hover:scale-105"
            style={{
              background: "linear-gradient(135deg, #f3e5ab, #d4af37)",
              boxShadow: "0 6px 20px rgba(212,175,55,0.4)",
              opacity: processing ? 0.6 : 1,
            }}
            aria-label="Gravar"
          >
            <Microphone size={26} weight="fill" />
          </button>
        ) : (
          <button
            type="button"
            onClick={stop}
            data-testid="btn-stop-recording"
            className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold animate-pulse"
            style={{ background: "#ff6b6b", boxShadow: "0 6px 20px rgba(255,107,107,0.5)" }}
            aria-label="Parar"
          >
            <Stop size={22} weight="fill" />
          </button>
        )}
      </div>

      {permissionError && (
        <div className="mt-3 text-[#ff8f8f] text-xs" data-testid="voice-permission-error">
          {permissionError}
        </div>
      )}

      {transcription && (
        <div className="mt-3 pt-3 border-t border-[rgba(243,229,171,0.15)]" data-testid="voice-transcription">
          <div className="tmf-mono text-[9px] tracking-[0.3em] text-[#d4af37] mb-1">
            TRANSCRIÇÃO
          </div>
          <div className="text-[#f3e5ab] text-sm italic leading-relaxed">"{transcription}"</div>
        </div>
      )}
    </div>
  );
}
