import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Passport from "./pages/Passport";
import Cadastro from "./pages/Cadastro";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import PanelLayout from "./components/layout/PanelLayout";
import Dashboard from "./pages/panel/Dashboard";
import Praticantes from "./pages/panel/Praticantes";
import NovoPraticante from "./pages/panel/NovoPraticante";
import NovaConquista from "./pages/panel/NovaConquista";
import EditarPraticante from "./pages/panel/EditarPraticante";
import Creditos from "./pages/panel/Creditos";
import Configuracoes from "./pages/panel/Configuracoes";
import NotFound from "./pages/NotFound";
import TermosDeUso from "./pages/TermosDeUso";
import Privacidade from "./pages/Privacidade";
import Sobre from "./pages/Sobre";
import Contato from "./pages/Contato";
import { VerificarRedirect } from "./components/VerificarRedirect";
import { AdminProtectedRoute } from "./components/AdminProtectedRoute";
import DashLayout from "./components/layout/DashLayout";
import DashDashboard from "./pages/dash/Dashboard";
import Organizacoes from "./pages/dash/Organizacoes";
import OrganizacaoDetalhe from "./pages/dash/OrganizacaoDetalhe";
import Atletas from "./pages/dash/Atletas";
import AtletaDetalhe from "./pages/dash/AtletaDetalhe";
import Graduacoes from "./pages/dash/Graduacoes";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/p/:id" element={<Passport />} />
            <Route path="/cadastro" element={<Cadastro />} />
            <Route path="/login" element={<Login />} />
            <Route path="/recuperar-senha" element={<ResetPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/painel" element={<ProtectedRoute><PanelLayout /></ProtectedRoute>}>
              <Route index element={<Dashboard />} />
              <Route path="praticantes" element={<Praticantes />} />
              <Route path="praticantes/novo" element={<NovoPraticante />} />
              <Route path="praticantes/:id/editar" element={<EditarPraticante />} />
              <Route path="conquistas/nova" element={<NovaConquista />} />
              <Route path="creditos" element={<Creditos />} />
              <Route path="configuracoes" element={<Configuracoes />} />
            </Route>
            <Route path="/dash" element={<AdminProtectedRoute><DashLayout /></AdminProtectedRoute>}>
              <Route index element={<DashDashboard />} />
              <Route path="organizacoes" element={<Organizacoes />} />
              <Route path="organizacoes/:id" element={<OrganizacaoDetalhe />} />
              <Route path="atletas" element={<Atletas />} />
              <Route path="atletas/:id" element={<AtletaDetalhe />} />
              <Route path="graduacoes" element={<Graduacoes />} />
            </Route>
            <Route path="/termos" element={<TermosDeUso />} />
            <Route path="/privacidade" element={<Privacidade />} />
            <Route path="/sobre" element={<Sobre />} />
            <Route path="/contato" element={<Contato />} />
            <Route path="/verificar" element={<VerificarRedirect />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
