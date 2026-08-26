import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import AppShell from "@/components/AppShell";
import Section from "@/components/Section";
import { Field, SideSelect, UnitToggle, UnitProvider } from "@/components/Field";
import RepeatableGroup from "@/components/RepeatableGroup";
import VoiceRecorder from "@/components/VoiceRecorder";
import { toast } from "sonner";
import { CheckCircle, FloppyDisk, Crown, FolderSimple } from "@phosphor-icons/react";
import { createWall, getWall, listProjects, updateWall } from "@/lib/api";

const uid = () =>
  (window.crypto?.randomUUID?.() || `id_${Math.random().toString(36).slice(2)}`);

const emptyWall = () => ({
  nome: "",
  project_id: null,
  altura_pe_direito: 280,
  largura_total: 400,
  altura_rodape: 8,
  espessura_rodape: 1.5,
  colunas: [],
  vigas: [],
  portas: [],
  janelas: [],
  tomadas: [],
  interruptores: [],
  saidas_agua: [],
  saidas_esgoto: [],
  saidas_gas: [],
  registros_agua: [],
  foto_parede_id: null,
  foto_piso_id: null,
});

export default function CriarParede() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const [wall, setWall] = useState(() => ({
    ...emptyWall(),
    project_id: location.state?.defaultProjectId || null,
  }));
  const [saving, setSaving] = useState(false);
  const [projects, setProjects] = useState([]);
  const [unit, setUnit] = useState(() => localStorage.getItem("tmf_unit") || "cm");
  const isEdit = Boolean(id);

  const changeUnit = (u) => {
    setUnit(u);
    localStorage.setItem("tmf_unit", u);
  };

  useEffect(() => {
    listProjects().then(setProjects).catch(() => {});
  }, []);

  useEffect(() => {
    if (id) {
      getWall(id)
        .then((w) => setWall({ ...emptyWall(), ...w }))
        .catch(() => toast.error("Parede não encontrada"));
    }
  }, [id]);

  const patch = (p) => setWall((w) => ({ ...w, ...p }));
  const bind = (key) => (val) => patch({ [key]: val });

  const mergeFromVoice = (parsed) => {
    setWall((w) => {
      const next = { ...w };
      // Scalar fields overwrite
      ["altura_pe_direito", "largura_total", "altura_rodape", "espessura_rodape"].forEach((k) => {
        if (parsed[k] != null) next[k] = parsed[k];
      });
      // Array fields append (with a fresh id per item)
      const arrays = [
        "colunas", "vigas", "portas", "janelas",
        "tomadas", "interruptores", "saidas_agua",
        "saidas_esgoto", "saidas_gas", "registros_agua",
      ];
      arrays.forEach((k) => {
        if (Array.isArray(parsed[k]) && parsed[k].length) {
          next[k] = [
            ...(w[k] || []),
            ...parsed[k].map((item) => ({ id: uid(), ...item })),
          ];
        }
      });
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (isEdit) {
        await updateWall(id, wall);
        toast.success("Parede atualizada!");
      } else {
        const created = await createWall(wall);
        toast.success(`${created.nome} salva com sucesso!`);
      }
      if (wall.project_id) {
        navigate(`/projeto/${wall.project_id}`);
      } else {
        navigate("/paredes");
      }
    } catch (e) {
      if (e.response?.status === 402) {
        toast.error(e.response.data.detail, {
          duration: 6000,
          action: {
            label: "Assinar PRO",
            onClick: () => navigate("/precos"),
          },
        });
      } else {
        toast.error("Erro ao salvar", { description: e?.message || "" });
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell
      title={isEdit ? "Editar Parede" : "Nova Parede"}
      subtitle="Preencha as medidas do ambiente. Deixe em branco o que não se aplica."
      back={isEdit ? "/paredes" : "/"}
    >
      <div className="space-y-4 tmf-fade-in" data-testid="criar-parede-form">
        <UnitProvider unit={unit} onChange={changeUnit}>
        {/* Nome opcional */}
        <div className="tmf-card">
          <label className="tmf-label">Nome do ambiente (opcional)</label>
          <input
            className="tmf-input"
            placeholder="Ex: Sala, Cozinha, Quarto 01..."
            value={wall.nome || ""}
            onChange={(e) => patch({ nome: e.target.value })}
            data-testid="input-nome-parede"
          />
          <div className="tmf-mono text-[10px] text-[#a3a39a] mt-1 tracking-wider">
            SE VAZIO, SERÁ NUMERADA AUTOMATICAMENTE (PAREDE 01, 02...)
          </div>

          {/* Project selector */}
          <div className="mt-4 pt-4 border-t border-[rgba(243,229,171,0.12)]">
            <label className="tmf-label flex items-center gap-2">
              <FolderSimple size={12} weight="fill" className="text-[#d4af37]" />
              Projeto (opcional)
            </label>
            <select
              className="tmf-input bg-transparent"
              value={wall.project_id || ""}
              onChange={(e) => patch({ project_id: e.target.value || null })}
              data-testid="select-project"
              style={{ colorScheme: "dark" }}
            >
              <option value="" style={{ background: "#12120f", color: "#fff" }}>
                — sem projeto —
              </option>
              {/* Placeholder for preselected project while list is loading */}
              {wall.project_id && !projects.some((p) => p.id === wall.project_id) && (
                <option
                  value={wall.project_id}
                  style={{ background: "#12120f", color: "#fff" }}
                >
                  carregando projeto...
                </option>
              )}
              {projects.map((p) => (
                <option key={p.id} value={p.id} style={{ background: "#12120f", color: "#fff" }}>
                  {p.nome}
                  {p.cliente_nome ? ` · ${p.cliente_nome}` : ""}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Voice AI dictation */}
        <VoiceRecorder onParsed={mergeFromVoice} currentWall={wall} />

        {/* Unit toggle (cm/mm) */}
        <UnitToggle unit={unit} onChange={changeUnit} />

        {/* Estrutura */}
        <Section title="Estrutura da parede" tag="Campos 1–6" defaultOpen testid="section-estrutura">
          <Field unit={unit}
            label="Altura pé direito"
            value={wall.altura_pe_direito}
            onChange={bind("altura_pe_direito")}
            testid="input-altura-pe-direito"
          />
          <Field unit={unit}
            label="Largura total da parede"
            value={wall.largura_total}
            onChange={bind("largura_total")}
            testid="input-largura-total"
          />
          <Field unit={unit}
            label="Altura do rodapé"
            value={wall.altura_rodape}
            onChange={bind("altura_rodape")}
            testid="input-altura-rodape"
          />
          <Field unit={unit}
            label="Espessura do rodapé"
            value={wall.espessura_rodape}
            onChange={bind("espessura_rodape")}
            testid="input-espessura-rodape"
          />

          <div className="pt-2">
            <div className="tmf-label mb-2">Colunas</div>
            <RepeatableGroup
              items={wall.colunas}
              onChange={bind("colunas")}
              testid="grp-colunas"
              addLabel="Adicionar coluna"
              emptyLabel="Nenhuma coluna."
              factory={() => ({ id: uid(), largura: 15, profundidade: 15 })}
              render={(item, upd) => (
                <div className="grid grid-cols-2 gap-3">
                  <Field unit={unit}
                    label="Largura"
                    value={item.largura}
                    onChange={(v) => upd({ largura: v })}
                    testid="input-coluna-largura"
                  />
                  <Field unit={unit}
                    label="Profundidade"
                    value={item.profundidade}
                    onChange={(v) => upd({ profundidade: v })}
                    testid="input-coluna-profundidade"
                  />
                </div>
              )}
            />
          </div>

          <div className="pt-2">
            <div className="tmf-label mb-2">Vigas</div>
            <RepeatableGroup
              items={wall.vigas}
              onChange={bind("vigas")}
              testid="grp-vigas"
              addLabel="Adicionar viga"
              emptyLabel="Nenhuma viga."
              factory={() => ({ id: uid(), altura: 20, largura: 15 })}
              render={(item, upd) => (
                <div className="grid grid-cols-2 gap-3">
                  <Field unit={unit}
                    label="Altura"
                    value={item.altura}
                    onChange={(v) => upd({ altura: v })}
                    testid="input-viga-altura"
                  />
                  <Field unit={unit}
                    label="Largura"
                    value={item.largura}
                    onChange={(v) => upd({ largura: v })}
                    testid="input-viga-largura"
                  />
                </div>
              )}
            />
          </div>
        </Section>

        {/* Aberturas */}
        <Section title="Aberturas — Portas e janelas" tag="Campos 7–13" testid="section-aberturas">
          <div>
            <div className="tmf-label mb-2">Portas</div>
            <RepeatableGroup
              items={wall.portas}
              onChange={bind("portas")}
              testid="grp-portas"
              addLabel="Adicionar porta"
              emptyLabel="Nenhuma porta."
              factory={() => ({ id: uid(), largura_vao: 80, altura_vao: 210, largura_vista: 5, espessura_vista: 1.5 })}
              render={(item, upd) => (
                <div className="grid grid-cols-2 gap-3">
                  <Field unit={unit}
                    label="Largura interna vão"
                    value={item.largura_vao}
                    onChange={(v) => upd({ largura_vao: v })}
                    testid="input-porta-largura-vao"
                  />
                  <Field unit={unit}
                    label="Altura interna vão"
                    value={item.altura_vao}
                    onChange={(v) => upd({ altura_vao: v })}
                    testid="input-porta-altura-vao"
                  />
                  <Field unit={unit}
                    label="Largura vista"
                    value={item.largura_vista}
                    onChange={(v) => upd({ largura_vista: v })}
                    testid="input-porta-largura-vista"
                  />
                  <Field unit={unit}
                    label="Espessura vista"
                    value={item.espessura_vista}
                    onChange={(v) => upd({ espessura_vista: v })}
                    testid="input-porta-espessura-vista"
                  />
                </div>
              )}
            />
          </div>

          <div className="pt-2">
            <div className="tmf-label mb-2">Janelas</div>
            <RepeatableGroup
              items={wall.janelas}
              onChange={bind("janelas")}
              testid="grp-janelas"
              addLabel="Adicionar janela"
              emptyLabel="Nenhuma janela."
              factory={() => ({ id: uid(), largura_vista: 5, largura_vao: 120, altura_vao: 100 })}
              render={(item, upd) => (
                <div className="grid grid-cols-2 gap-3">
                  <Field unit={unit}
                    label="Largura vista"
                    value={item.largura_vista}
                    onChange={(v) => upd({ largura_vista: v })}
                    testid="input-janela-largura-vista"
                  />
                  <Field unit={unit}
                    label="Largura interna vão"
                    value={item.largura_vao}
                    onChange={(v) => upd({ largura_vao: v })}
                    testid="input-janela-largura-vao"
                  />
                  <Field unit={unit}
                    label="Altura interna vão"
                    value={item.altura_vao}
                    onChange={(v) => upd({ altura_vao: v })}
                    testid="input-janela-altura-vao"
                  />
                </div>
              )}
            />
          </div>
        </Section>

        {/* Elétrica */}
        <Section title="Instalações elétricas" tag="Campos 14–17" testid="section-eletrica">
          <PontosParede
            label="Tomadas"
            items={wall.tomadas}
            onChange={bind("tomadas")}
            testid="grp-tomadas"
            factoryAltura={30}
          />
          <PontosParede
            label="Interruptores de luz"
            items={wall.interruptores}
            onChange={bind("interruptores")}
            testid="grp-interruptores"
            factoryAltura={110}
          />
        </Section>

        {/* Hidráulica + Gás */}
        <Section title="Hidráulica, esgoto e gás" tag="Campos 18–24" testid="section-hidraulica">
          <PontosParede
            label="Saídas de água"
            items={wall.saidas_agua}
            onChange={bind("saidas_agua")}
            testid="grp-saidas-agua"
            factoryAltura={90}
          />
          <PontosParede
            label="Saídas de esgoto"
            items={wall.saidas_esgoto}
            onChange={bind("saidas_esgoto")}
            testid="grp-saidas-esgoto"
            factoryAltura={20}
          />
          <PontosParede
            label="Saídas de gás"
            items={wall.saidas_gas}
            onChange={bind("saidas_gas")}
            testid="grp-saidas-gas"
            factoryAltura={40}
            showAltura={false}
          />
          <PontosParede
            label="Registros de água"
            items={wall.registros_agua}
            onChange={bind("registros_agua")}
            testid="grp-registros-agua"
            factoryAltura={120}
          />
        </Section>

        {/* Save */}
        <div className="sticky bottom-3 pt-4 z-20">
          <button
            className="tmf-btn tmf-corner-marks"
            onClick={handleSave}
            disabled={saving}
            style={saving ? { opacity: 0.6 } : {}}
            data-testid="btn-salvar-tudo"
          >
            <div className="flex items-center gap-3">
              {saving ? (
                <FloppyDisk size={22} weight="fill" />
              ) : (
                <CheckCircle size={22} weight="fill" />
              )}
              <span>{saving ? "SALVANDO..." : "Salvar tudo"}</span>
            </div>
            <span className="tmf-mono text-[10px] tracking-[0.3em] opacity-70">
              CAMPO 25
            </span>
          </button>
        </div>
        </UnitProvider>
      </div>
    </AppShell>
  );
}

function PontosParede({ label, items, onChange, testid, factoryAltura, showAltura = true }) {
  return (
    <div className="pt-2">
      <div className="tmf-label mb-2">{label}</div>
      <RepeatableGroup
        items={items}
        onChange={onChange}
        testid={testid}
        addLabel={`Adicionar ${label.toLowerCase().replace(/s$/, "")}`}
        emptyLabel={`Sem ${label.toLowerCase()}.`}
        factory={() => ({
          id: uid(),
          distancia_centro: 50,
          lado: "direito",
          altura_piso: showAltura ? factoryAltura : null,
        })}
        render={(item, upd) => (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field unit={unit}
                label="Distância do centro"
                value={item.distancia_centro}
                onChange={(v) => upd({ distancia_centro: v })}
                testid="input-ponto-distancia"
              />
              {showAltura && (
                <Field unit={unit}
                  label="Altura em relação ao piso"
                  value={item.altura_piso}
                  onChange={(v) => upd({ altura_piso: v })}
                  testid="input-ponto-altura"
                />
              )}
            </div>
            <SideSelect
              value={item.lado}
              onChange={(v) => upd({ lado: v })}
              testid="btn-ponto-lado"
            />
          </div>
        )}
      />
    </div>
  );
}
