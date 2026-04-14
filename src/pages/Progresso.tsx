import { Flame, Trophy, Calendar, TrendingUp } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";

const weekDays = ["S", "T", "Q", "Q", "S", "S", "D"];

const Progresso = () => {
  const { profile, loading } = useProfile();

  const dias = profile?.dias_treinados ?? 0;
  const streak = profile?.streak ?? 0;

  // Simple mock: mark first `streak` days of the week as trained
  const trainedDays = weekDays.map((_, i) => i < streak);

  const stats = [
    { icon: Calendar, label: "Dias Treinados", value: String(dias) },
    { icon: Trophy, label: "Streak Atual", value: `${streak} dias` },
    { icon: Flame, label: "Calorias Queimadas", value: String(dias * 280) },
    { icon: TrendingUp, label: "Treinos no Mês", value: String(Math.min(dias, 30)) },
  ];

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6 p-5">
      <div className="pt-2">
        <h1 className="text-2xl font-extrabold text-foreground">Progresso</h1>
        <p className="text-sm text-muted-foreground">Acompanhe sua evolução</p>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <p className="mb-3 text-sm font-semibold text-muted-foreground">Esta Semana</p>
        <div className="flex justify-between">
          {weekDays.map((day, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">{day}</span>
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${
                  trainedDays[i]
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {trainedDays[i] ? "✓" : ""}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {stats.map(({ icon: Icon, label, value }) => (
          <div key={label} className="animate-slide-up rounded-xl border border-border bg-card p-4">
            <Icon className="mb-2 h-6 w-6 text-primary" />
            <p className="text-2xl font-extrabold text-foreground">{value}</p>
            <p className="text-xs font-medium text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Progresso;
