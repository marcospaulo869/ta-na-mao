import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Microphone, Circle } from "@phosphor-icons/react";
import { api } from "@/lib/api";

/**
 * FieldMicButton — micro-mic next to each Field's cm/mm toggle.
 * Press-and-hold to record, release to send (WhatsApp-style).
 * Auto-stops after MAX_RECORDING_MS so it never gets stuck.
 *
 * Props:
 *   - onValue(number): called with the extracted numeric value in cm (or degrees).
 *   - unit: "cm" | "mm" | "°"  — passed as context to the AI.
 *   - testid: base testid for tests.
 */

const MAX_RECORDING_MS = 8000; // hard cap so the mic never keeps listening forever
const MIN_RECORDING_MS = 350;  // avoid accidental taps

export function FieldMicButton({ onValue, unit = "cm", testid }) {
  const [state, setState] = useState("idle"); // idle | recording | sending
  const chunksRef = useRef([]);
  const recRef = useRef(null);
  const streamRef = useRef(null);
  const startedAtRef = useRef(0);
  const autoStopRef = useRef(null);
  const cancelledRef = useRef(false);

  const cleanup = () => {
    if (autoStopRef.current) {
      clearTimeout(autoStopRef.current);
      autoStopRef.current = null;
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    recRef.current = null;
  };

  useEffect(() => () => cleanup(), []);

  const startRecording = async () => {
    if (state !== "idle") return;
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      toast.error("Seu navegador não suporta gravação. Use o botão grande de voz no topo.");
      return;
    }
    cancelledRef.current = false;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "";
      const opts = mime ? { mimeType: mime } : {};
      const rec = new MediaRecorder(stream, opts);
      chunksRef.current = [];
      rec.ondataavailable = (ev) => ev.data.size && chunksRef.current.push(ev.data);
      rec.onstop = handleStop;
      rec.onerror = () => {
        toast.error("Erro na gravação. Tente novamente.");
        cleanup();
        setState("idle");
      };
      rec.start();
      recRef.current = rec;
      startedAtRef.current = Date.now();
      setState("recording");
      // Safety net — auto-stop after MAX_RECORDING_MS
      autoStopRef.current = setTimeout(() => {
        if (recRef.current?.state === "recording") {
          recRef.current.stop();
          toast.info("Gravação encerrada após 8s. Solte antes.");
        }
      }, MAX_RECORDING_MS);
    } catch {
      toast.error("Permita o microfone nas configurações do navegador.");
      cleanup();
      setState("idle");
    }
  };

  const stopRecording = (cancel = false) => {
    cancelledRef.current = cancel;
    if (recRef.current?.state === "recording") {
      // Enforce MIN duration — if too short, mark as cancel
      const dur = Date.now() - startedAtRef.current;
      if (dur < MIN_RECORDING_MS) cancelledRef.current = true;
      recRef.current.stop();
    } else {
      cleanup();
      setState("idle");
    }
  };

  const handleStop = async () => {
    if (autoStopRef.current) {
      clearTimeout(autoStopRef.current);
      autoStopRef.current = null;
    }
    const blob = new Blob(chunksRef.current, { type: "audio/webm" });
    cleanup();

    if (cancelledRef.current) {
      setState("idle");
      return;
    }
    if (blob.size < 800) {
      toast.error("Muito curto — segure por 1 a 2 segundos e fale a medida.");
      setState("idle");
      return;
    }

    setState("sending");
    try {
      const fd = new FormData();
      fd.append("audio", blob, "num.webm");
      fd.append("context", `Campo em ${unit}`);
      const { data } = await api.post("/voice/parse-number", fd, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 25000,
      });
      if (data.value == null) {
        toast.warning('Não entendi — tente dizer "dois metros e sessenta" ou "80".');
      } else {
        onValue(Number(data.value));
        toast.success(`✓ ${data.value} ${unit === "°" ? "°" : "cm"}`);
      }
    } catch (e) {
      toast.error(e.response?.data?.detail || "Erro ao processar. Tente de novo.");
    } finally {
      setState("idle");
    }
  };

  // Pointer handlers — press-and-hold (WhatsApp style).
  // Only cancel on real pointer cancel (browser interrupt). Finger slipping off
  // still counts as release-to-send because the target is a tiny 28px button.
  const onDown = (e) => {
    e.preventDefault();
    startRecording();
  };
  const onUp = (e) => {
    e.preventDefault();
    if (state === "recording") stopRecording(false);
  };
  const onCancel = () => {
    if (state === "recording") stopRecording(true);
  };

  const label =
    state === "recording"
      ? "Solte para enviar"
      : state === "sending"
      ? "Processando..."
      : "Segure para ditar";

  return (
    <button
      type="button"
      tabIndex={-1}
      aria-label={label}
      title={label}
      onPointerDown={onDown}
      onPointerUp={onUp}
      onPointerCancel={onCancel}
      onContextMenu={(e) => e.preventDefault()}
      disabled={state === "sending"}
      data-testid={testid ? `${testid}-mic` : "field-mic"}
      className={`inline-flex items-center justify-center transition-all select-none touch-none ${
        state === "recording"
          ? "bg-[#ff4d4d] border-[#ff4d4d] text-white scale-110"
          : state === "sending"
          ? "border-[rgba(212,175,55,0.35)] bg-[rgba(212,175,55,0.15)] text-[#d4af37] opacity-70"
          : "border-[rgba(212,175,55,0.35)] bg-transparent text-[#d4af37] active:bg-[rgba(212,175,55,0.25)]"
      } border`}
      style={{
        width: 28,
        height: 28,
        borderRadius: 4,
        boxShadow: state === "recording" ? "0 0 12px rgba(255,77,77,0.7)" : "none",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      {state === "recording" ? (
        <Circle size={11} weight="fill" className="animate-pulse" />
      ) : state === "sending" ? (
        <span
          className="inline-block w-3 h-3 border-2 border-[#d4af37] border-t-transparent rounded-full animate-spin"
          aria-hidden="true"
        />
      ) : (
        <Microphone size={13} weight="fill" />
      )}
    </button>
  );
}
