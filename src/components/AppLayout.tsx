import { Outlet } from "react-router-dom";
import BottomNav from "./BottomNav";

const AppLayout = () => (
  <div className="mx-auto min-h-screen max-w-lg bg-background pb-20">
    <Outlet />
    <footer className="px-5 pb-24 pt-8 text-center">
      <p className="text-xs font-semibold text-muted-foreground">
        FitMoz • Transformando vidas 🔥
      </p>
      <p className="mt-1 text-[10px] text-muted-foreground/70">
        © FitMoz 2026 • Todos os direitos reservados
      </p>
    </footer>
    <BottomNav />
  </div>
);

export default AppLayout;
