import { Flame, Trophy, Calendar, TrendingUp } from "lucide-react";

const stats = [
  { icon: Calendar, label: "Dias Treinados", value: "12", color: "text-primary" },
  { icon: Trophy, label: "Streak Atual", value: "3 dias", color: "text-primary" },
  { icon: Flame, label: "Calorias Queimadas", value: "3.400", color: "text-primary" },
  { icon: TrendingUp, label: "Treinos no Mês", value: "8", color: "text-primary" },
];

const weekDays = ["S", "T", "Q", "Q", "S", "S", "D"];
const trainedDays = [true, true, true, false, false, false, false];

const Progresso = () => (
  <div className="animate-fade-in space-y-6 p-5">
    <div className="pt-2">
      <h1 className="text-2xl font-extrabold text-foreground">Progresso</h1>
      <p className="text-sm text-muted-foreground">Acompanhe sua evolução</p>
    </div>

    {/* Week Overview */}
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="mb-3 text-sm font-semibold text-muted-foreground">Esta Semana</p>
      <div className="flex justify-between">
        {weekDays.map((day, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5">
            <span className="text-xs font-medium text-muted-foreground">{day}</span>
            <div
              className={`h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold ${
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

    {/* Stats Grid */}
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

export default Progresso;
