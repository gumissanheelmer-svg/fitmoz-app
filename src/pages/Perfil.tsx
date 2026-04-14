import { Crown, Star, ChevronRight, LogOut, Settings, Shield, Calendar } from "lucide-react";
import { usePlan } from "@/hooks/usePlan";

const Perfil = () => {
  const { plan, setPlan, status, expiresAt } = usePlan();

  return (
    <div className="animate-fade-in space-y-6 p-5">
      <div className="pt-2">
        <h1 className="text-2xl font-extrabold text-foreground">Perfil</h1>
      </div>

      {/* User Card */}
      <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
          A
        </div>
        <div>
          <p className="font-bold text-foreground">Atleta FitMoz</p>
          <p className="text-sm text-muted-foreground">atleta@fitmoz.co.mz</p>
        </div>
      </div>

      {/* Plan Card */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="mb-3 flex items-center gap-2">
          {plan === "pro" ? (
            <Crown className="h-5 w-5 text-primary" />
          ) : (
            <Star className="h-5 w-5 text-primary" />
          )}
          <span className="text-sm font-semibold text-muted-foreground">Plano Atual</span>
        </div>
        <p className="text-2xl font-extrabold uppercase text-foreground">{plan}</p>
        <p className="text-sm text-muted-foreground">
          {plan === "plus" ? "97 MZN/mês" : "147 MZN/mês"} · Status:{" "}
          <span className="font-semibold text-primary">{status}</span>
        </p>
        <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" />
          <span>Expira em: {expiresAt}</span>
        </div>

        {plan === "plus" && (
          <button
            onClick={() => setPlan("pro")}
            className="mt-4 w-full rounded-xl bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground transition-transform active:scale-[0.98]"
          >
            Atualizar para PRO — 147 MZN
          </button>
        )}
      </div>

      {/* PRO Benefits */}
      {plan === "plus" && (
        <div className="rounded-xl bg-secondary p-4">
          <p className="mb-2 text-sm font-bold text-secondary-foreground">O que você ganha com PRO:</p>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            <li>✅ Tudo do PLUS</li>
            <li>🤖 Coach IA personalizado</li>
            <li>👥 Acesso à comunidade</li>
            <li>🔔 Notificações motivacionais</li>
          </ul>
        </div>
      )}

      {/* Menu Items */}
      <div className="space-y-1">
        {[
          { icon: Settings, label: "Configurações" },
          { icon: Shield, label: "Privacidade" },
          { icon: LogOut, label: "Sair" },
        ].map(({ icon: Icon, label }) => (
          <button
            key={label}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-left transition-colors hover:bg-muted"
          >
            <Icon className="h-5 w-5 text-muted-foreground" />
            <span className="flex-1 font-medium text-foreground">{label}</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default Perfil;
