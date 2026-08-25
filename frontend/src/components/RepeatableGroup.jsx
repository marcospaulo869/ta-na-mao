import React from "react";
import { Plus, Trash } from "@phosphor-icons/react";

export default function RepeatableGroup({
  items,
  onChange,
  render,
  addLabel,
  emptyLabel = "Nenhum item adicionado.",
  factory,
  testid,
}) {
  const add = () => onChange([...(items || []), factory()]);
  const update = (idx, patch) => {
    const next = [...items];
    next[idx] = { ...next[idx], ...patch };
    onChange(next);
  };
  const remove = (idx) => {
    const next = items.filter((_, i) => i !== idx);
    onChange(next);
  };

  return (
    <div className="space-y-3" data-testid={testid}>
      {(!items || items.length === 0) && (
        <div className="tmf-mono text-[11px] text-[#a3a39a] tracking-wider py-2">
          {emptyLabel}
        </div>
      )}
      {items?.map((item, idx) => (
        <div
          key={item.id || idx}
          className="border border-[rgba(243,229,171,0.15)] p-4 bg-[rgba(10,10,8,0.5)] relative"
          data-testid={`${testid}-item-${idx}`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="tmf-mono text-[10px] tracking-[0.3em] text-[#d4af37]">
              #{String(idx + 1).padStart(2, "0")}
            </span>
            <button
              type="button"
              onClick={() => remove(idx)}
              data-testid={`${testid}-remove-${idx}`}
              className="text-[#a3a39a] hover:text-[#ff6b6b] transition-colors"
              aria-label="Remover"
            >
              <Trash size={16} weight="bold" />
            </button>
          </div>
          {render(item, (patch) => update(idx, patch), idx)}
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="tmf-btn-secondary flex items-center gap-2 justify-center w-full"
        data-testid={`${testid}-add`}
      >
        <Plus size={14} weight="bold" />
        {addLabel}
      </button>
    </div>
  );
}
