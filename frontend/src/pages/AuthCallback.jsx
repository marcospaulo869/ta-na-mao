import React, { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

export default function AuthCallback() {
  const location = useLocation();
  const navigate = useNavigate();
  const { googleExchange } = useAuth();
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    const hash = location.hash || "";
    const match = hash.match(/session_id=([^&]+)/);
    if (!match) {
      navigate("/login", { replace: true });
      return;
    }
    const sessionId = decodeURIComponent(match[1]);

    (async () => {
      try {
        const user = await googleExchange(sessionId);
        // Clean the hash from URL
        window.history.replaceState({}, document.title, "/");
        toast.success(`Bem-vindo(a), ${user.name}!`);
        navigate("/", { replace: true });
      } catch (e) {
        toast.error("Erro ao autenticar com Google");
        navigate("/login", { replace: true });
      }
    })();
  }, [location, googleExchange, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a08]">
      <div className="text-center">
        <div className="tmf-mono text-[10px] tracking-[0.35em] text-[#d4af37]">
          AUTENTICANDO...
        </div>
      </div>
    </div>
  );
}
