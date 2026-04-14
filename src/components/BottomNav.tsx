import { Home, Dumbbell, UtensilsCrossed, BarChart3, User } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const navItems = [
  { path: "/", icon: Home, label: "Home" },
  { path: "/treinos", icon: Dumbbell, label: "Treinos" },
  { path: "/receitas", icon: UtensilsCrossed, label: "Receitas" },
  { path: "/progresso", icon: BarChart3, label: "Progresso" },
  { path: "/perfil", icon: User, label: "Perfil" },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background">
      <div className="mx-auto flex max-w-lg items-center justify-around py-2">
        {navItems.map(({ path, icon: Icon, label }) => {
          const active = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
