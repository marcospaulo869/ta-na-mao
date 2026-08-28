import React, { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Image as ImageIcon,
  Link as LinkIcon,
  Trash,
  Plus,
  X,
} from "@phosphor-icons/react";
import { createClientRef, deleteClientRef, listClientRefs } from "@/lib/api";

const MAX_IMG_BYTES = 4 * 1024 * 1024; // 4 MB original — will be resized

async function fileToResizedDataURL(file, maxSize = 1600, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, w, h);
        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(dataUrl);
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function ClientReferences({ projectId }) {
  const [refs, setRefs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [urlCaption, setUrlCaption] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [lightbox, setLightbox] = useState(null);
  const fileRef = useRef(null);

  const load = useCallback(() => {
    setLoading(true);
    listClientRefs(projectId)
      .then(setRefs)
      .catch(() => setRefs([]))
      .finally(() => setLoading(false));
  }, [projectId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_IMG_BYTES) {
      toast.warning("Imagem grande — vai ser reduzida antes de enviar.");
    }
    setBusy(true);
    try {
      const dataUrl = await fileToResizedDataURL(file);
      await createClientRef(projectId, {
        kind: "image",
        data: dataUrl,
        mime: "image/jpeg",
      });
      toast.success("Referência anexada");
      load();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Erro ao enviar imagem");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleUrl = async () => {
    if (!urlInput.trim()) return;
    setBusy(true);
    try {
      await createClientRef(projectId, {
        kind: "url",
        data: urlInput.trim(),
        caption: urlCaption.trim() || null,
      });
      toast.success("Link anexado");
      setUrlInput("");
      setUrlCaption("");
      setShowUrlInput(false);
      load();
    } catch (err) {
      toast.error("Erro ao anexar link");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (refId) => {
    if (!window.confirm("Remover essa referência?")) return;
    try {
      await deleteClientRef(projectId, refId);
      toast.success("Removido");
      load();
    } catch {
      toast.error("Erro ao remover");
    }
  };

  return (
    <div className="tmf-card tmf-corner-marks space-y-4" data-testid="section-references">
      <div className="flex items-center justify-between">
        <div>
          <div className="tmf-mono text-[10px] tracking-[0.35em] text-[#d4af37]">
            REFERÊNCIAS DO CLIENTE
          </div>
          <div className="text-xs text-[#a3a39a] mt-1">
            Fotos, imagens de IA ou links que o cliente mandou para inspirar o projeto
          </div>
        </div>
        <div className="tmf-mono text-[10px] tracking-widest text-[#a3a39a]">
          {refs.length}
        </div>
      </div>

      {/* Grid */}
      {refs.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {refs.map((r) => (
            <div
              key={r.id}
              className="relative border border-[rgba(212,175,55,0.25)] bg-black/30 overflow-hidden group aspect-square"
              data-testid={`ref-${r.id}`}
            >
              {r.kind === "image" ? (
                <img
                  src={r.data}
                  alt={r.caption || "Referência"}
                  className="w-full h-full object-cover cursor-zoom-in"
                  onClick={() => setLightbox(r)}
                />
              ) : (
                <a
                  href={r.data}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full h-full flex flex-col items-center justify-center gap-2 p-3 text-center hover:bg-[rgba(212,175,55,0.08)]"
                >
                  <LinkIcon size={28} weight="duotone" className="text-[#d4af37]" />
                  <div className="text-[10px] text-[#f3e5ab] truncate w-full">
                    {r.caption || r.data.replace(/^https?:\/\//, "").slice(0, 40)}
                  </div>
                </a>
              )}
              <button
                onClick={() => handleDelete(r.id)}
                className="absolute top-1 right-1 w-6 h-6 bg-black/70 border border-[rgba(255,77,77,0.4)] text-[#ff6b6b] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                data-testid={`btn-del-ref-${r.id}`}
                aria-label="Remover"
              >
                <Trash size={12} weight="bold" />
              </button>
            </div>
          ))}
        </div>
      )}

      {loading && (
        <div className="text-center text-xs text-[#7a7a70] py-4">Carregando...</div>
      )}

      {!loading && refs.length === 0 && (
        <div className="text-center text-xs text-[#7a7a70] py-4">
          Nenhuma referência ainda. Anexe abaixo.
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-[rgba(212,175,55,0.15)]">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleFile}
          className="hidden"
          data-testid="input-file-ref"
        />
        <button
          onClick={() => fileRef.current?.click()}
          disabled={busy}
          className="tmf-btn-secondary flex-1 inline-flex items-center justify-center gap-2"
          data-testid="btn-add-image"
        >
          <ImageIcon size={14} weight="bold" />
          {busy ? "Enviando..." : "Anexar imagem"}
        </button>
        <button
          onClick={() => setShowUrlInput((v) => !v)}
          disabled={busy}
          className="tmf-btn-secondary flex-1 inline-flex items-center justify-center gap-2"
          data-testid="btn-add-url"
        >
          <LinkIcon size={14} weight="bold" />
          Colar link
        </button>
      </div>

      {showUrlInput && (
        <div className="space-y-2 p-3 border border-[rgba(212,175,55,0.25)] bg-black/30">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://pinterest.com/... ou https://chat.openai.com/..."
            className="tmf-input"
            data-testid="input-ref-url"
          />
          <input
            type="text"
            value={urlCaption}
            onChange={(e) => setUrlCaption(e.target.value)}
            placeholder="Descrição opcional"
            className="tmf-input"
            data-testid="input-ref-caption"
          />
          <div className="flex gap-2">
            <button
              onClick={handleUrl}
              disabled={busy || !urlInput.trim()}
              className="tmf-btn flex-1 inline-flex items-center justify-center gap-2"
              data-testid="btn-save-url"
            >
              <Plus size={14} weight="bold" /> Adicionar
            </button>
            <button
              onClick={() => {
                setShowUrlInput(false);
                setUrlInput("");
                setUrlCaption("");
              }}
              className="tmf-btn-secondary px-3"
            >
              <X size={14} weight="bold" />
            </button>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
          data-testid="ref-lightbox"
        >
          <img
            src={lightbox.data}
            alt="Referência ampliada"
            className="max-w-full max-h-full object-contain"
          />
          <button
            className="absolute top-4 right-4 w-10 h-10 bg-black/60 border border-[#d4af37] text-[#d4af37] flex items-center justify-center"
            onClick={() => setLightbox(null)}
          >
            <X size={20} weight="bold" />
          </button>
        </div>
      )}
    </div>
  );
}
