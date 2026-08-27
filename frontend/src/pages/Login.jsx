import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { SignIn } from "@phosphor-icons/react";
import { useAuth, formatApiErrorDetail } from "@/context/AuthContext";
import {
  AuthShell,
  BrandHeader,
  GoogleSignInButton,
  AuthDivider,
} from "@/components/AuthUI";
import { PasswordInput } from "@/components/PasswordInput";

const REMEMBER_KEY = "tmf.rememberEmail";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [busy, setBusy] = useState(false);

  // Pre-fill the email if user chose to remember it before
  useEffect(() => {
    try {
      const saved = localStorage.getItem(REMEMBER_KEY);
      if (saved) {
        setEmail(saved);
        setRemember(true);
      }
    } catch {}
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await login(email, password);
      try {
        if (remember) localStorage.setItem(REMEMBER_KEY, email);
        else localStorage.removeItem(REMEMBER_KEY);
      } catch {}
      toast.success("Bem-vindo(a) de volta!");
      navigate("/");
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail) || err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell>
      <BrandHeader subtitle="ENTRAR NA SUA CONTA" />
      <div className="tmf-card tmf-corner-marks" data-testid="login-card">
        <GoogleSignInButton label="Entrar com Google" testid="btn-google-login" />
        <AuthDivider />
        <form onSubmit={handleSubmit} className="space-y-4" data-testid="login-form">
          <div>
            <label className="tmf-label">E-mail</label>
            <input
              type="email"
              required
              autoFocus
              autoComplete="username"
              className="tmf-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@email.com"
              data-testid="input-email"
            />
          </div>
          <div>
            <label className="tmf-label">Senha</label>
            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              testid="input-password"
            />
          </div>

          <label
            className="flex items-center gap-2 text-sm text-[#a3a39a] cursor-pointer select-none"
            data-testid="label-remember"
          >
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="w-4 h-4 accent-[#d4af37] cursor-pointer"
              data-testid="checkbox-remember"
            />
            <span>
              Lembrar meu e-mail neste celular
              <span className="block text-[10px] tracking-widest text-[#7a7a70] uppercase">
                Login mais rápido da próxima vez
              </span>
            </span>
          </label>

          <button
            type="submit"
            disabled={busy}
            className="tmf-btn"
            style={busy ? { opacity: 0.6 } : {}}
            data-testid="btn-submit-login"
          >
            <div className="flex items-center gap-2">
              <SignIn size={18} weight="bold" />
              <span>{busy ? "ENTRANDO..." : "Entrar"}</span>
            </div>
          </button>
        </form>
        <div className="text-center mt-5 text-sm text-[#a3a39a]">
          Ainda não tem conta?{" "}
          <Link to="/cadastro" data-testid="link-cadastro" className="text-[#d4af37] hover:underline">
            Cadastre-se grátis
          </Link>
        </div>
      </div>
    </AuthShell>
  );
}
