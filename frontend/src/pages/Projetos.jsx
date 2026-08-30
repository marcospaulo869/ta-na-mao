import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  FolderSimple,
  Plus,
  ArrowRight,
  Trash,
  PencilSimple,
  User,
  Phone,
  MapPin,
} from "@phosphor-icons/react";
import AppShell from "@/components/AppShell";
import { createProject, deleteProject, listProjects } from "@/lib/api";

export default function Projetos() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    nome: "",
    tipo: "residencial",
    cliente_nome: "",
    cliente_telefone: "",
    endereco: "",
    empresa_nome: "",
    cnpj: "",
    ramo: "",
    socios: "",
    data_inauguracao: "",
  });
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    listProjects()
      .then(setProjects)
      .catch((e) => toast.error(e?.message || "Erro ao carregar"))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.nome.trim()) {
      toast.error("Dê um nome ao projeto");
      return;
    }
    setSaving(true);
    try {
      const p = await createProject(form);
      toast.success(`Projeto "${p.nome}" criado!`);
      setShowForm(false);
      setForm({ nome: "", cliente_nome: "", cliente_telefone: "", endereco: "" });
      navigate(`/projeto/${p.id}`);
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Erro ao criar projeto");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (p) => {
    if (!window.confirm(`Excluir "${p.nome}"? As paredes serão mantidas mas ficarão sem projeto.`)) return;
    try {
      await deleteProject(p.id);
      toast.success("Projeto excluído");
      setProjects((ps) => ps.filter((x) => x.id !== p.id));
    } catch (e) {
      toast.error("Erro ao excluir");
    }
  };

  return (
    <AppShell
      title="Projetos"
      subtitle="Agrupe várias paredes por cliente/ambiente. Um PDF completo em 1 clique."
      back="/"
      actions={
        <button
          onClick={() => setShowForm((s) => !s)}
          data-testid="btn-toggle-new-project"
          className="tmf-btn-secondary inline-flex items-center gap-2"
        >
          <Plus size={14} weight="bold" />
          {showForm ? "Fechar" : "Novo projeto"}
        </button>
      }
    >
      {showForm && (
        <div className="tmf-card tmf-corner-marks mb-6 tmf-fade-in" data-testid="new-project-form">
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="tmf-label">Nome do projeto *</label>
              <input
                className="tmf-input"
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                placeholder="Ex: Casa Silva, Reforma Cozinha..."
                autoFocus
                data-testid="input-project-nome"
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="tmf-label">Cliente</label>
                <input
                  className="tmf-input"
                  value={form.cliente_nome}
                  onChange={(e) => setForm({ ...form, cliente_nome: e.target.value })}
                  placeholder="Nome do cliente"
                  data-testid="input-project-cliente"
                />
              </div>
              <div>
                <label className="tmf-label">Telefone / WhatsApp</label>
                <input
                  className="tmf-input"
                  value={form.cliente_telefone}
                  onChange={(e) => setForm({ ...form, cliente_telefone: e.target.value })}
                  placeholder="(51) 99999-9999"
                  data-testid="input-project-telefone"
                />
              </div>
            </div>
            <div>
              <label className="tmf-label">Endereço</label>
              <input
                className="tmf-input"
                value={form.endereco}
                onChange={(e) => setForm({ ...form, endereco: e.target.value })}
                placeholder="Rua, número, bairro, cidade"
                data-testid="input-project-endereco"
              />
            </div>
            <button type="submit" className="tmf-btn" disabled={saving} data-testid="btn-save-project">
              <div className="flex items-center gap-2">
                <FolderSimple size={18} weight="fill" />
                <span>{saving ? "CRIANDO..." : "Criar projeto"}</span>
              </div>
            </button>
          </form>
        </div>
      )}

      {loading && (
        <div className="tmf-mono text-[11px] tracking-widest text-[#a3a39a]">CARREGANDO...</div>
      )}

      {!loading && projects.length === 0 && !showForm && (
        <div className="tmf-card tmf-corner-marks text-center py-12" data-testid="empty-projects">
          <FolderSimple size={48} weight="duotone" className="text-[#d4af37] mx-auto" />
          <h3 className="tmf-heading text-xl mt-4 text-white">Ainda sem projetos</h3>
          <p className="text-[#a3a39a] mt-2 max-w-md mx-auto text-sm">
            Crie um projeto para agrupar todas as paredes de um cliente e gerar um PDF único
            com todas as medidas.
          </p>
          <button
            onClick={() => setShowForm(true)}
            data-testid="btn-create-first-project"
            className="tmf-btn mt-6 max-w-xs mx-auto"
          >
            <div className="flex items-center gap-2">
              <Plus size={18} weight="bold" />
              <span>Criar primeiro projeto</span>
            </div>
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-testid="projects-grid">
        {projects.map((p) => (
          <div key={p.id} className="tmf-card tmf-corner-marks" data-testid={`project-card-${p.id}`}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <div className="tmf-mono text-[10px] tracking-[0.3em] text-[#d4af37]">PROJETO</div>
                <h3 className="tmf-heading text-xl text-white mt-1 truncate">{p.nome}</h3>
              </div>
              <button
                onClick={() => handleDelete(p)}
                data-testid={`btn-delete-project-${p.id}`}
                className="text-[#a3a39a] hover:text-[#ff6b6b] transition-colors ml-2"
                aria-label="Excluir"
              >
                <Trash size={16} weight="bold" />
              </button>
            </div>
            <div className="space-y-1.5 text-sm text-[#a3a39a] mb-4">
              {p.cliente_nome && (
                <div className="flex items-center gap-2">
                  <User size={13} weight="duotone" className="text-[#d4af37]" />
                  <span className="truncate">{p.cliente_nome}</span>
                </div>
              )}
              {p.cliente_telefone && (
                <div className="flex items-center gap-2">
                  <Phone size={13} weight="duotone" className="text-[#d4af37]" />
                  <span className="truncate">{p.cliente_telefone}</span>
                </div>
              )}
              {p.endereco && (
                <div className="flex items-center gap-2">
                  <MapPin size={13} weight="duotone" className="text-[#d4af37]" />
                  <span className="truncate">{p.endereco}</span>
                </div>
              )}
            </div>
            <Link
              to={`/projeto/${p.id}`}
              className="tmf-btn-secondary flex items-center gap-2 justify-center"
              data-testid={`btn-open-project-${p.id}`}
            >
              <span>Abrir projeto</span>
              <ArrowRight size={14} weight="bold" />
            </Link>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
