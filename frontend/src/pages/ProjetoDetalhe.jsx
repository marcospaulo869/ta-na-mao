import React, { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import {
  FilePdf,
  Plus,
  ArrowRight,
  Trash,
  PencilSimple,
  Wall as WallIcon,
  DownloadSimple,
  Link as LinkIcon,
  User,
  Phone,
  MapPin,
  WhatsappLogo,
  FloppyDisk,
} from "@phosphor-icons/react";
import AppShell from "@/components/AppShell";
import {
  attachWall,
  deleteWall,
  detachWall,
  exportWallUrl,
  getProject,
  listWalls,
  projectPdfUrl,
  updateProject,
} from "@/lib/api";

export default function ProjetoDetalhe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [walls, setWalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [availableWalls, setAvailableWalls] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [meta, setMeta] = useState({});

  const load = useCallback(() => {
    setLoading(true);
    getProject(id)
      .then((d) => {
        setProject(d.project);
        setWalls(d.walls);
        setMeta({
          nome: d.project.nome,
          cliente_nome: d.project.cliente_nome || "",
          cliente_telefone: d.project.cliente_telefone || "",
          endereco: d.project.endereco || "",
          observacoes: d.project.observacoes || "",
        });
      })
      .catch(() => toast.error("Projeto não encontrado"))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(load, [load]);

  const openAddDialog = async () => {
    try {
      const all = await listWalls();
      setAvailableWalls(all.filter((w) => !w.project_id));
      setAddOpen(true);
    } catch (e) {
      toast.error("Erro ao listar paredes disponíveis");
    }
  };

  const handleAttach = async (wallId) => {
    try {
      await attachWall(id, wallId);
      toast.success("Parede vinculada!");
      setAddOpen(false);
      load();
    } catch {
      toast.error("Erro ao vincular");
    }
  };

  const handleDetach = async (wallId) => {
    try {
      await detachWall(id, wallId);
      toast.success("Parede removida do projeto");
      load();
    } catch {
      toast.error("Erro");
    }
  };

  const handleDeleteWall = async (wallId, nome) => {
    if (!window.confirm(`Excluir ${nome}? Esta ação não pode ser desfeita.`)) return;
    try {
      await deleteWall(wallId);
      toast.success("Parede excluída");
      load();
    } catch {
      toast.error("Erro ao excluir");
    }
  };

  const handleSaveMeta = async () => {
    try {
      const p = await updateProject(id, meta);
      setProject(p);
      setEditMode(false);
      toast.success("Projeto atualizado");
    } catch {
      toast.error("Erro ao atualizar");
    }
  };

  const handleWhatsApp = () => {
    if (!project?.cliente_telefone) {
      toast.error("Cadastre o telefone do cliente para usar o WhatsApp");
      return;
    }
    const phone = project.cliente_telefone.replace(/\D/g, "");
    const pdfLink = projectPdfUrl(id);
    const msg =
      `Olá ${project.cliente_nome || ""}, segue o relatório do projeto "${project.nome}" ` +
      `feito pela Madeira Forte 🌳✨\n\nAcesse o PDF: ${pdfLink}`;
    const wa = `https://wa.me/55${phone}?text=${encodeURIComponent(msg)}`;
    window.open(wa, "_blank");
  };

  if (loading) {
    return (
      <AppShell title="Carregando..." back="/projetos">
        <div className="tmf-mono text-[11px] tracking-widest text-[#a3a39a]">CARREGANDO...</div>
      </AppShell>
    );
  }

  if (!project) return null;

  return (
    <AppShell title={project.nome} subtitle="Ambientes do projeto" back="/projetos">
      {/* Meta card */}
      <div className="tmf-card tmf-corner-marks mb-6" data-testid="project-meta-card">
        {!editMode ? (
          <>
            <div className="flex items-start justify-between mb-3">
              <span className="tmf-tag">CLIENTE</span>
              <button
                onClick={() => setEditMode(true)}
                data-testid="btn-edit-project"
                className="text-[#a3a39a] hover:text-[#d4af37] transition-colors"
                aria-label="Editar"
              >
                <PencilSimple size={16} weight="bold" />
              </button>
            </div>
            <div className="space-y-2 text-sm text-[#f3e5ab]">
              {project.cliente_nome && (
                <div className="flex items-center gap-2">
                  <User size={14} weight="duotone" className="text-[#d4af37]" />
                  <span>{project.cliente_nome}</span>
                </div>
              )}
              {project.cliente_telefone && (
                <div className="flex items-center gap-2">
                  <Phone size={14} weight="duotone" className="text-[#d4af37]" />
                  <span>{project.cliente_telefone}</span>
                </div>
              )}
              {project.endereco && (
                <div className="flex items-center gap-2">
                  <MapPin size={14} weight="duotone" className="text-[#d4af37]" />
                  <span>{project.endereco}</span>
                </div>
              )}
              {project.observacoes && (
                <div className="text-[#a3a39a] text-xs mt-2 pt-2 border-t border-[rgba(243,229,171,0.1)]">
                  {project.observacoes}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="space-y-3" data-testid="project-edit-form">
            <input
              className="tmf-input"
              value={meta.nome}
              onChange={(e) => setMeta({ ...meta, nome: e.target.value })}
              placeholder="Nome do projeto"
            />
            <input
              className="tmf-input"
              value={meta.cliente_nome}
              onChange={(e) => setMeta({ ...meta, cliente_nome: e.target.value })}
              placeholder="Cliente"
            />
            <input
              className="tmf-input"
              value={meta.cliente_telefone}
              onChange={(e) => setMeta({ ...meta, cliente_telefone: e.target.value })}
              placeholder="Telefone"
            />
            <input
              className="tmf-input"
              value={meta.endereco}
              onChange={(e) => setMeta({ ...meta, endereco: e.target.value })}
              placeholder="Endereço"
            />
            <textarea
              className="tmf-input"
              rows={2}
              value={meta.observacoes}
              onChange={(e) => setMeta({ ...meta, observacoes: e.target.value })}
              placeholder="Observações"
            />
            <div className="flex gap-2">
              <button
                onClick={handleSaveMeta}
                className="tmf-btn-secondary flex-1 flex items-center justify-center gap-2"
                data-testid="btn-save-project-meta"
              >
                <FloppyDisk size={14} /> Salvar
              </button>
              <button onClick={() => setEditMode(false)} className="tmf-btn-secondary">
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-6">
        <a
          href={projectPdfUrl(id)}
          target="_blank"
          rel="noreferrer"
          className="tmf-btn-secondary flex items-center gap-2 justify-center"
          data-testid="btn-download-project-pdf"
        >
          <FilePdf size={14} weight="fill" />
          Baixar PDF
        </a>
        <button
          onClick={handleWhatsApp}
          className="tmf-btn-secondary flex items-center gap-2 justify-center"
          data-testid="btn-whatsapp-project"
        >
          <WhatsappLogo size={14} weight="fill" />
          Enviar WhatsApp
        </button>
        <button
          onClick={() =>
            navigate(`/parede/nova`, { state: { defaultProjectId: id } })
          }
          className="tmf-btn-secondary flex items-center gap-2 justify-center"
          data-testid="btn-new-wall-in-project"
        >
          <Plus size={14} weight="bold" />
          Nova parede
        </button>
      </div>

      {/* Walls list */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="tmf-heading text-lg text-white uppercase tracking-wide">
          Paredes ({walls.length})
        </h3>
        <button
          onClick={openAddDialog}
          className="tmf-btn-secondary flex items-center gap-2 text-xs"
          data-testid="btn-attach-existing"
        >
          <LinkIcon size={12} weight="bold" />
          Vincular existente
        </button>
      </div>

      {walls.length === 0 ? (
        <div className="tmf-card text-center py-8" data-testid="empty-project-walls">
          <WallIcon size={40} weight="duotone" className="text-[#d4af37] mx-auto" />
          <p className="text-[#a3a39a] mt-3 text-sm">
            Nenhuma parede neste projeto ainda. Clique em "Nova parede" acima.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3" data-testid="project-walls-grid">
          {walls.map((w) => (
            <div
              key={w.id}
              className="border border-[rgba(243,229,171,0.15)] bg-[rgba(18,18,15,0.6)] p-4"
              data-testid={`project-wall-${w.id}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="tmf-mono text-[9px] tracking-[0.3em] text-[#d4af37]">
                    #{String(w.numero).padStart(2, "0")}
                  </div>
                  <div className="tmf-heading text-white uppercase mt-1 truncate">{w.nome}</div>
                </div>
              </div>
              <div className="tmf-mono text-[10px] text-[#a3a39a] mb-3">
                {w.altura_pe_direito}×{w.largura_total}cm · {w.portas.length + w.janelas.length} abert
              </div>
              <div className="flex gap-1.5 flex-wrap">
                <button
                  onClick={() => navigate(`/parede/${w.id}`)}
                  className="tmf-btn-secondary text-xs flex-1 flex items-center gap-1 justify-center"
                  data-testid={`btn-edit-wall-${w.id}`}
                >
                  <PencilSimple size={11} weight="bold" /> Editar
                </button>
                <a
                  href={exportWallUrl(w.id)}
                  className="tmf-btn-secondary text-xs flex items-center gap-1"
                  data-testid={`btn-export-wall-${w.id}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <DownloadSimple size={11} weight="bold" />
                </a>
                <button
                  onClick={() => handleDetach(w.id)}
                  className="tmf-btn-secondary text-xs flex items-center gap-1"
                  data-testid={`btn-detach-wall-${w.id}`}
                  title="Remover do projeto (não exclui)"
                >
                  <LinkIcon size={11} weight="bold" />
                </button>
                <button
                  onClick={() => handleDeleteWall(w.id, w.nome)}
                  className="tmf-btn-danger text-xs"
                  data-testid={`btn-delete-wall-${w.id}`}
                >
                  <Trash size={11} weight="bold" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Attach existing modal */}
      {addOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center px-4"
          onClick={() => setAddOpen(false)}
          data-testid="attach-modal"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#12120f] border border-[rgba(243,229,171,0.3)] p-5 max-w-md w-full max-h-[80vh] overflow-y-auto tmf-corner-marks"
          >
            <h3 className="tmf-heading text-lg text-white uppercase mb-4">
              Vincular parede existente
            </h3>
            {availableWalls.length === 0 ? (
              <p className="text-[#a3a39a] text-sm text-center py-6">
                Nenhuma parede solta encontrada. Crie novas paredes ou desvincule de outros
                projetos.
              </p>
            ) : (
              <div className="space-y-2">
                {availableWalls.map((w) => (
                  <button
                    key={w.id}
                    onClick={() => handleAttach(w.id)}
                    data-testid={`btn-attach-${w.id}`}
                    className="w-full text-left p-3 border border-[rgba(243,229,171,0.15)] hover:border-[#d4af37] hover:bg-[rgba(212,175,55,0.05)] transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-white">{w.nome}</div>
                        <div className="tmf-mono text-[10px] text-[#a3a39a] mt-1">
                          {w.altura_pe_direito}×{w.largura_total}cm
                        </div>
                      </div>
                      <Plus size={16} className="text-[#d4af37]" weight="bold" />
                    </div>
                  </button>
                ))}
              </div>
            )}
            <button
              onClick={() => setAddOpen(false)}
              className="tmf-btn-secondary w-full mt-4"
              data-testid="btn-close-attach-modal"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </AppShell>
  );
}
