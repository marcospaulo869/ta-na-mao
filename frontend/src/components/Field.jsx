import React from "react";

export function Field({ label, value, onChange, suffix = "cm", testid, placeholder }) {
  return (
    <div>
      <label className="tmf-label">{label}</label>
      <div className="flex items-baseline gap-2">
        <input
          type="number"
          step="0.1"
          className="tmf-input no-spinner flex-1"
          value={value ?? ""}
          onChange={(e) =>
            onChange(e.target.value === "" ? "" : parseFloat(e.target.value))
          }
          placeholder={placeholder}
          data-testid={testid}
        />
        <span className="tmf-mono text-[10px] text-[#a3a39a] tracking-widest">
          {suffix}
        </span>
      </div>
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
