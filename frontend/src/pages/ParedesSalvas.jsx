import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AppShell from "@/components/AppShell";
import { toast } from "sonner";
import {
  DownloadSimple,
  PencilSimple,
  Trash,
  Ruler,
  DoorOpen,
  Package,
  Plus,
} from "@phosphor-icons/react";
import { deleteWall, exportWallUrl, listWalls } from "@/lib/api";

export default function ParedesSalvas() {
  const navigate = useNavigate();
  const [walls, setWalls] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    listWalls()
      .then(setWalls)
      .catch((e) => toast.error("Erro ao carregar", { description: e?.message }))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id, nome) => {
    if (!window.confirm(`Excluir ${nome}? Esta ação não pode ser desfeita.`)) return;
    try {
      await deleteWall(id);
      toast.success(`${nome} excluída`);
      setWalls((ws) => ws.filter((w) => w.id !== id));
    } catch (e) {
      toast.error("Erro ao excluir");
    }
  };

  const handleExport = (w) => {
    window.open(exportWallUrl(w.id), "_blank");
    toast.success("Exportando JSON", {
      description: "Arquivo pronto para importar no plugin do SketchUp.",
    });
  };

  return (
    <AppShell
      title="Paredes salvas"
      subtitle="Cada parede é exportável em JSON e será lida pelo plugin do SketchUp."
      back="/"
      actions={
        <Link to="/parede/nova" data-testid="btn-nova-parede-lista" className="tmf-btn-secondary inline-flex items-center gap-2">
          <Plus size={14} weight="bold" />
          Nova parede
        </Link>
      }
    >
      {loading && (
        <div className="tmf-mono text-[11px] tracking-widest text-[#a3a39a]">
          CARREGANDO...
        </div>
      )}

      {!loading && walls.length === 0 && (
        <div className="tmf-card text-center py-12 tmf-corner-marks" data-testid="empty-walls">
          <Package size={48} weight="duotone" className="text-[#d4af37] mx-auto" />
          <h3 className="tmf-heading text-xl font-bold mt-4 text-white">
            Nenhuma parede salva ainda
          </h3>
          <p className="text-[#a3a39a] mt-2 max-w-md mx-auto text-sm">
            Comece criando sua primeira parede. As medidas ficam guardadas na nuvem para você
            baixar depois no SketchUp.
          </p>
          <Link
            to="/parede/nova"
            data-testid="btn-criar-primeira"
            className="tmf-btn mt-6 inline-flex max-w-xs mx-auto"
          >
            <div className="flex items-center gap-2">
              <Plus size={18} weight="bold" />
              <span>Criar primeira parede</span>
            </div>
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-testid="walls-grid">
        {walls.map((w) => (
          <div key={w.id} className="tmf-card tmf-corner-marks" data-testid={`wall-card-${w.id}`}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="tmf-mono text-[10px] tracking-[0.35em] text-[#d4af37]">
                  #{String(w.numero).padStart(2, "0")}
                </div>
                <h3 className="tmf-heading uppercase text-xl font-black text-white leading-tight mt-1">
                  {w.nome}
                </h3>
              </div>
              <span className="tmf-tag">SALVA</span>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-3 mb-4">
              <MiniStat
                icon={Ruler}
                label="Pé direito"
                value={`${w.altura_pe_direito} cm`}
              />
              <MiniStat
                icon={Ruler}
                label="Largura"
                value={`${w.largura_total} cm`}
              />
              <MiniStat
                icon={DoorOpen}
                label="Aberturas"
                value={`${w.portas.length + w.janelas.length}`}
              />
              <MiniStat
                icon={Package}
                label="Instalações"
                value={
                  w.tomadas.length +
                  w.interruptores.length +
                  w.saidas_agua.length +
                  w.saidas_esgoto.length +
                  w.saidas_gas.length +
                  w.registros_agua.length
                }
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                className="tmf-btn-secondary flex items-center gap-2 flex-1"
                onClick={() => handleExport(w)}
                data-testid={`btn-export-${w.id}`}
              >
                <DownloadSimple size={14} weight="bold" />
                Exportar SketchUp
              </button>
              <button
                className="tmf-btn-secondary flex items-center gap-2"
                onClick={() => navigate(`/parede/${w.id}`)}
                data-testid={`btn-edit-${w.id}`}
                aria-label="Editar"
              >
                <PencilSimple size={14} weight="bold" />
              </button>
              <button
                className="tmf-btn-danger flex items-center gap-2"
                onClick={() => handleDelete(w.id, w.nome)}
                data-testid={`btn-delete-${w.id}`}
                aria-label="Excluir"
              >
                <Trash size={14} weight="bold" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}

function MiniStat({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-2 py-1.5 px-2 border border-[rgba(243,229,171,0.12)] bg-[rgba(10,10,8,0.4)]">
      <Icon size={16} weight="duotone" className="text-[#d4af37] flex-shrink-0" />
      <div className="min-w-0">
        <div className="tmf-mono text-[9px] tracking-widest text-[#a3a39a] uppercase truncate">
          {label}
        </div>
        <div className="tmf-mono text-[13px] text-white truncate">{value}</div>
      </div>
    </div>
  );
}
