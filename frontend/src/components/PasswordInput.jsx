import React, { useState } from "react";
import { Eye, EyeSlash } from "@phosphor-icons/react";

/**
 * Password input with:
 *  - visibility toggle (eye icon)
 *  - autoComplete so the mobile browser offers to save it
 *
 * Props:
 *  - value, onChange, minLength, required, placeholder, testid
 *  - autoComplete: "current-password" (login) or "new-password" (register)
 */
export function PasswordInput({
  value,
  onChange,
  minLength = 6,
  required = true,
  placeholder = "••••••••",
  autoComplete = "current-password",
  testid = "input-password",
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        type={visible ? "text" : "password"}
        required={required}
        minLength={minLength}
        className="tmf-input pr-11"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        data-testid={testid}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-[#a3a39a] hover:text-[#d4af37] transition-colors"
        aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
        title={visible ? "Ocultar senha" : "Mostrar senha"}
        data-testid={`${testid}-toggle`}
        tabIndex={-1}
      >
        {visible ? (
          <EyeSlash size={18} weight="duotone" />
        ) : (
          <Eye size={18} weight="duotone" />
        )}
      </button>
    </div>
  );
}
