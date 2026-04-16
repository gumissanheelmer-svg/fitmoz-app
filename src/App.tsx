import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import AppLayout from "./components/AppLayout";
import AdminLayout from "./components/admin/AdminLayout";
import Index from "./pages/Index";
import Coach from "./pages/Coach";
import Treinos from "./pages/Treinos";
import Receitas from "./pages/Receitas";
import Comunidade from "./pages/Comunidade";
import Progresso from "./pages/Progresso";
import Perfil from "./pages/Perfil";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/admin/Dashboard";
import Usuarios from "./pages/admin/Usuarios";
import AdminComunidade from "./pages/admin/Comunidade";
import Denuncias from "./pages/admin/Denuncias";
import Logs from "./pages/admin/Logs";
import Config from "./pages/admin/Config";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();

  if (loading || adminLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const AuthRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  if (loading || (user && adminLoading)) return null;
  if (user && isAdmin) return <Navigate to="/admin" replace />;
  if (user) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<AuthRoute><Auth /></AuthRoute>} />
            <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route path="/" element={<Index />} />
              <Route path="/treinos" element={<Treinos />} />
              <Route path="/receitas" element={<Receitas />} />
              <Route path="/comunidade" element={<Comunidade />} />
              <Route path="/progresso" element={<Progresso />} />
              <Route path="/perfil" element={<Perfil />} />
            </Route>
            <Route element={<AdminRoute><AdminLayout /></AdminRoute>}>
              <Route path="/admin" element={<Dashboard />} />
              <Route path="/admin/usuarios" element={<Usuarios />} />
              <Route path="/admin/comunidade" element={<AdminComunidade />} />
              <Route path="/admin/denuncias" element={<Denuncias />} />
              <Route path="/admin/logs" element={<Logs />} />
              <Route path="/admin/config" element={<Config />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
