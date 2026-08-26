import "@/App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Home from "@/pages/Home";
import CapturarFoto from "@/pages/CapturarFoto";
import CriarParede from "@/pages/CriarParede";
import ParedesSalvas from "@/pages/ParedesSalvas";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import AuthCallback from "@/pages/AuthCallback";
import Precos from "@/pages/Precos";
import { PagamentoSucesso, PagamentoCancelado } from "@/pages/Pagamento";
import Projetos from "@/pages/Projetos";
import ProjetoDetalhe from "@/pages/ProjetoDetalhe";
import Landing from "@/pages/Landing";
import { Privacidade, Termos } from "@/pages/Legal";
import { useAuth } from "@/context/AuthContext";

// Root component: shows Landing for anonymous users, Home for authenticated
function RootRoute() {
  const { user } = useAuth();
  if (user === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a08]">
        <div className="tmf-mono text-[10px] tracking-[0.35em] text-[#d4af37]">
          CARREGANDO...
        </div>
      </div>
    );
  }
  return user ? <Home /> : <Landing />;
}

function AppRouter() {
  const location = useLocation();
  // Detect OAuth callback synchronously during render
  if (location.hash?.includes("session_id=")) {
    return <AuthCallback />;
  }
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<Register />} />
      <Route path="/precos" element={<Precos />} />
      <Route path="/pagamento/sucesso" element={<PagamentoSucesso />} />
      <Route path="/pagamento/cancelado" element={<PagamentoCancelado />} />

      <Route path="/lp" element={<Landing />} />
      <Route path="/privacidade" element={<Privacidade />} />
      <Route path="/termos" element={<Termos />} />
      <Route path="/" element={<RootRoute />} />
      <Route
        path="/foto/:tipo"
        element={
          <ProtectedRoute>
            <CapturarFoto />
          </ProtectedRoute>
        }
      />
      <Route
        path="/parede/nova"
        element={
          <ProtectedRoute>
            <CriarParede />
          </ProtectedRoute>
        }
      />
      <Route
        path="/parede/:id"
        element={
          <ProtectedRoute>
            <CriarParede />
          </ProtectedRoute>
        }
      />
      <Route
        path="/paredes"
        element={
          <ProtectedRoute>
            <ParedesSalvas />
          </ProtectedRoute>
        }
      />
      <Route
        path="/projetos"
        element={
          <ProtectedRoute>
            <Projetos />
          </ProtectedRoute>
        }
      />
      <Route
        path="/projeto/:id"
        element={
          <ProtectedRoute>
            <ProjetoDetalhe />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AuthProvider>
          <AppRouter />
        </AuthProvider>
      </BrowserRouter>
      <Toaster
        theme="dark"
        position="top-center"
        toastOptions={{
          style: {
            background: "#12120f",
            border: "1px solid rgba(243, 229, 171, 0.3)",
            color: "#fff",
            fontFamily: "Outfit, sans-serif",
            borderRadius: 0,
          },
        }}
      />
    </div>
  );
}

export default App;
