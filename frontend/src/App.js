import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import Home from "@/pages/Home";
import CapturarFoto from "@/pages/CapturarFoto";
import CriarParede from "@/pages/CriarParede";
import ParedesSalvas from "@/pages/ParedesSalvas";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/foto/:tipo" element={<CapturarFoto />} />
          <Route path="/parede/nova" element={<CriarParede />} />
          <Route path="/parede/:id" element={<CriarParede />} />
          <Route path="/paredes" element={<ParedesSalvas />} />
        </Routes>
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
