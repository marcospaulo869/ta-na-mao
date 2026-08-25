import React, { useState } from "react";
import { CaretDown, CaretUp } from "@phosphor-icons/react";

export default function Section({ title, tag, children, defaultOpen = false, testid }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-[rgba(243,229,171,0.18)] bg-[rgba(18,18,15,0.6)]" data-testid={testid}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-[rgba(212,175,55,0.04)] transition-colors"
        data-testid={`${testid}-toggle`}
      >
        <div className="flex items-center gap-3 text-left">
          {tag && <span className="tmf-tag">{tag}</span>}
          <span className="tmf-heading uppercase text-white font-bold tracking-wide">
            {title}
          </span>
        </div>
        {open ? (
          <CaretUp size={18} weight="bold" className="text-[#d4af37]" />
        ) : (
          <CaretDown size={18} weight="bold" className="text-[#d4af37]" />
        )}
      </button>
      {open && <div className="px-5 pb-5 pt-2 space-y-4">{children}</div>}
    </div>
  );
}
