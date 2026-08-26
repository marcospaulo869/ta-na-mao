import React, { createContext, useContext } from "react";
import { CaretUp, CaretDown } from "@phosphor-icons/react";

/** Context so every Field can render its own tiny cm/mm toggle bound to the
 *  same global unit state managed by the parent form. */
const UnitContext = createContext(null);
export function UnitProvider({ unit, onChange, children }) {
  return (
    <UnitContext.Provider value={{ unit, onChange }}>
      {children}
    </UnitContext.Provider>
  );
}
function useUnitCtx() {
  return useContext(UnitContext);
}

/**
 * Field — numeric input with big +/- triangle buttons.
 *
 * The wall data is ALWAYS stored in cm (backend contract).
 * When unit="mm", we display value*10 and store input/10.
 */
export function Field({
  label,
  value,
  onChange,
  unit = "cm",
  fixedUnit,
  step,
  testid,
  placeholder,
}) {
  const activeUnit = fixedUnit || unit;
  const factor = fixedUnit ? 1 : activeUnit === "mm" ? 10 : 1;
  const displayStep =
    step ?? (fixedUnit ? 1 : activeUnit === "mm" ? 10 : 1);

  const display =
    value === "" || value == null || Number.isNaN(value)
      ? ""
      : Number((Number(value) * factor).toFixed(activeUnit === "mm" ? 0 : fixedUnit ? 0 : 2));

  const commitDisplay = (raw) => {
    if (raw === "" || raw == null || Number.isNaN(Number(raw))) {
      onChange("");
      return;
    }
    onChange(Number(raw) / factor);
  };

  const bump = (delta) => {
    const current =
      value === "" || value == null || Number.isNaN(value) ? 0 : Number(value);
    const next = Math.max(0, current + (delta / factor) * displayStep);
    onChange(Number(next.toFixed(2)));
  };

  return (
    <div>
      <label className="tmf-label">{label}</label>
      <div className="flex items-end gap-2">
        <input
          type="number"
          inputMode="decimal"
          step={displayStep}
          min="0"
          className="tmf-input no-spinner flex-1"
          value={display}
          onChange={(e) => commitDisplay(e.target.value)}
          placeholder={placeholder}
          data-testid={testid}
        />
        <div className="flex flex-col items-center flex-shrink-0">
          {fixedUnit ? (
            <span
              className="tmf-mono text-[10px] text-[#d4af37] tracking-widest font-bold leading-none mb-1 h-[19px] flex items-center"
              data-testid={testid ? `${testid}-unit` : undefined}
            >
              {fixedUnit}
            </span>
          ) : (
            <InlineUnitToggle fallbackUnit={unit} testid={testid} />
          )}
          <div className="flex gap-2">
            <TriangleButton
              direction="down"
              onClick={() => bump(-1)}
              testid={testid ? `${testid}-minus` : undefined}
              aria-label="Diminuir"
            />
            <TriangleButton
              direction="up"
              onClick={() => bump(1)}
              testid={testid ? `${testid}-plus` : undefined}
              aria-label="Aumentar"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function TriangleButton({ direction, onClick, testid, ...rest }) {
  const Icon = direction === "up" ? CaretUp : CaretDown;
  return (
    <button
      type="button"
      onClick={onClick}
      data-testid={testid}
      {...rest}
      className="w-11 h-11 flex items-center justify-center flex-shrink-0 border transition-colors active:scale-95"
      style={{
        borderColor: "rgba(212,175,55,0.5)",
        background: "linear-gradient(135deg, rgba(243,229,171,0.12), rgba(212,175,55,0.04))",
      }}
    >
      <Icon size={22} weight="fill" className="text-[#d4af37]" />
    </button>
  );
}

/** Mini cm/mm toggle rendered right above the +/- triangles on every field.
 *  Uses the shared UnitContext when available so all fields stay in sync. */
function InlineUnitToggle({ fallbackUnit, testid }) {
  const ctx = useUnitCtx();
  const unit = ctx ? ctx.unit : fallbackUnit;
  const onChange = ctx ? ctx.onChange : null;
  return (
    <div
      className="flex mb-1.5 border border-[rgba(212,175,55,0.35)] rounded-sm overflow-hidden"
      data-testid={testid ? `${testid}-unit-toggle` : undefined}
    >
      {["cm", "mm"].map((u) => {
        const active = unit === u;
        const clickable = Boolean(onChange) && !active;
        return (
          <button
            key={u}
            type="button"
            tabIndex={-1}
            onClick={clickable ? () => onChange(u) : undefined}
            data-testid={testid ? `${testid}-unit-${u}` : undefined}
            className={`px-2 py-[3px] tmf-mono text-[10px] font-bold uppercase tracking-widest leading-none transition-colors ${
              active
                ? "bg-[#d4af37] text-black"
                : "bg-transparent text-[#a3a39a] hover:text-white"
            }`}
          >
            {u}
          </button>
        );
      })}
    </div>
  );
}


export function SideSelect({ value, onChange, testid }) {
  return (
    <div>
      <label className="tmf-label">Lado de referência</label>
      <div className="flex gap-2">
        {["direito", "esquerdo"].map((side) => (
          <button
            key={side}
            type="button"
            data-testid={`${testid}-${side}`}
            onClick={() => onChange(side)}
            className={`flex-1 py-2 px-3 border tmf-mono text-[11px] uppercase tracking-widest transition-colors ${
              value === side
                ? "bg-[rgba(212,175,55,0.15)] border-[#d4af37] text-[#f3e5ab]"
                : "border-[rgba(243,229,171,0.2)] text-[#a3a39a] hover:border-[#f3e5ab] hover:text-white"
            }`}
          >
            {side === "direito" ? "Direito" : "Esquerdo"}
          </button>
        ))}
      </div>
    </div>
  );
}

/** UnitToggle — big cm/mm switch used at the top of the wall form. */
export function UnitToggle({ unit, onChange, testid = "unit-toggle" }) {
  return (
    <div
      className="flex items-center gap-3 justify-between border border-[rgba(212,175,55,0.25)] p-3 bg-[rgba(212,175,55,0.04)]"
      data-testid={testid}
    >
      <div>
        <div className="tmf-mono text-[10px] tracking-[0.3em] text-[#d4af37]">
          UNIDADE DAS MEDIDAS
        </div>
        <div className="text-[#a3a39a] text-xs mt-1">
          Todas as medidas serão exibidas em <strong className="text-[#f3e5ab]">{unit}</strong>.
        </div>
      </div>
      <div className="flex" role="tablist">
        {["cm", "mm"].map((u) => (
          <button
            key={u}
            type="button"
            onClick={() => onChange(u)}
            data-testid={`${testid}-${u}`}
            className={`px-5 py-2 tmf-mono text-xs font-bold uppercase tracking-widest transition-colors border ${
              unit === u
                ? "bg-[#d4af37] text-black border-[#d4af37]"
                : "bg-transparent text-[#a3a39a] border-[rgba(212,175,55,0.35)] hover:text-white"
            }`}
          >
            {u}
          </button>
        ))}
      </div>
    </div>
  );
}
