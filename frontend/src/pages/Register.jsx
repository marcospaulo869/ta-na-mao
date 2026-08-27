import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { UserPlus } from "@phosphor-icons/react";
import { useAuth, formatApiErrorDetail } from "@/context/AuthContext";
import {
  AuthShell,
  BrandHeader,
  GoogleSignInButton,
  AuthDivider,
} from "@/components/AuthUI";
import { PasswordInput } from "@/components/PasswordInput";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await register(name, email, password);
      toast.success("Conta criada com sucesso!");
      navigate("/");
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail) || err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell>
      <BrandHeader subtitle="CRIAR CONTA · GRÁTIS ATÉ 10 PAREDES" />
      <div className="tmf-card tmf-corner-marks" data-testid="register-card">
        <GoogleSignInButton label="Cadastrar com Google" testid="btn-google-register" />
        <AuthDivider />
        <form onSubmit={handleSubmit} className="space-y-4" data-testid="register-form">
          <div>
            <label className="tmf-label">Nome</label>
            <input
              type="text"
              required
              minLength={2}
              autoFocus
              className="tmf-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome"
              data-testid="input-name"
            />
          </div>
          <div>
            <label className="tmf-label">E-mail</label>
            <input
              type="email"
              required
              autoComplete="username"
              className="tmf-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@email.com"
              data-testid="input-email"
            />
          </div>
          <div>
            <label className="tmf-label">Senha (mínimo 6 caracteres)</label>
            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              testid="input-password"
            />
          </div>
          <button
            type="submit"
            disabled={busy}
            className="tmf-btn"
            style={busy ? { opacity: 0.6 } : {}}
            data-testid="btn-submit-register"
          >
            <div className="flex items-center gap-2">
              <UserPlus size={18} weight="bold" />
              <span>{busy ? "CRIANDO..." : "Criar conta"}</span>
            </div>
          </button>
        </form>
        <div className="text-center mt-5 text-sm text-[#a3a39a]">
          Já tem conta?{" "}
          <Link to="/login" data-testid="link-login" className="text-[#d4af37] hover:underline">
            Entrar
          </Link>
        </div>
      </div>
    </AuthShell>
  );
}
