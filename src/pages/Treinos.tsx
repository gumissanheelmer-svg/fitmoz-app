import { useState } from "react";
import { Lock, Clock, Dumbbell, ArrowLeft, Calendar, Sparkles } from "lucide-react";
import { useWorkouts, useWeeklyPlans, useTips, type Workout } from "@/hooks/useContent";
import { usePlan } from "@/hooks/usePlan";
import UpgradeDialog from "@/components/UpgradeDialog";

const FOCOS = [
  { id: "todos", label: "Todos", emoji: "💪" },
  { id: "barriga", label: "Barriga", emoji: "🔥" },
  { id: "gluteo", label: "Glúteo", emoji: "🍑" },
  { id: "pernas", label: "Pernas", emoji: "🦵" },
  { id: "corpo_todo", label: "Corpo todo", emoji: "💃" },
  { id: "cardio", label: "Cardio", emoji: "🏃‍♀️" },
] as const;

const TreinosPage = () => {
  const { workouts, loading } = useWorkouts();
  const { plans } = useWeeklyPlans();
  const tips = useTips();
  const { isPro } = usePlan();
  const [tab, setTab] = useState<"treinos" | "plano">("treinos");
  const [foco, setFoco] = useState<string>("todos");
  const [selected, setSelected] = useState<Workout | null>(null);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const filtered = workouts.filter((w) => foco === "todos" || w.foco === foco);
  const tip = tips[Math.floor(Date.now() / 86400000) % Math.max(tips.length, 1)];

  const open = (w: Workout) => {
    if (w.min_plan === "pro" && !isPro) {
      setShowUpgrade(true);
      return;
    }
    setSelected(w);
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (selected) {
    return (
      <div className="animate-fade-in pb-6">
        <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-card px-4 py-3">
          <button onClick={() => setSelected(null)} className="rounded-full p-1 hover:bg-muted">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="font-bold text-foreground">{selected.nome}</h1>
        </div>
        <div className="p-4 space-y-5">
          <div className="rounded-2xl bg-gradient-to-br from-primary to-primary/70 p-6 text-center text-primary-foreground">
            <div className="text-5xl mb-2">{selected.emoji}</div>
            <div className="flex justify-center gap-4 text-xs mt-2">
              <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{selected.duracao_min} min</span>
              <span className="flex items-center gap-1"><Dumbbell className="h-3 w-3" />{selected.series} séries</span>
              <span className="capitalize">• {selected.nivel}</span>
            </div>
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground mb-2">Exercícios</h2>
            <div className="space-y-2">
              {selected.exercicios.map((ex, idx) => (
                <div key={idx} className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">{idx + 1}</span>
                    <span className="text-sm font-medium text-foreground">{ex.nome}</span>
                  </div>
                  <span className="text-xs font-semibold text-primary">{ex.reps || ex.tempo}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-center">
            <p className="text-sm font-medium text-foreground">💡 Faça {selected.series} séries completas com 30s de descanso entre elas</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in pb-6">
      <div className="bg-card px-4 py-4 border-b border-border">
        <h1 className="text-xl font-bold text-foreground">Treinos 💪</h1>
        {tip && (
          <div className="mt-3 flex items-start gap-2 rounded-xl bg-primary/5 p-3">
            <Sparkles className="h-4 w-4 shrink-0 text-primary mt-0.5" />
            <p className="text-xs text-foreground">{tip.texto} {tip.emoji}</p>
          </div>
        )}
        <div className="mt-3 flex gap-2">
          <button
            onClick={() => setTab("treinos")}
            className={`flex-1 rounded-full py-2 text-xs font-semibold ${tab === "treinos" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}
          >
            Treinos
          </button>
          <button
            onClick={() => setTab("plano")}
            className={`flex-1 rounded-full py-2 text-xs font-semibold ${tab === "plano" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}
          >
            Plano 7 Dias
          </button>
        </div>
      </div>

      {tab === "treinos" ? (
        <>
          <div className="flex gap-2 overflow-x-auto px-4 py-3">
            {FOCOS.map((f) => (
              <button
                key={f.id}
                onClick={() => setFoco(f.id)}
                className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-medium ${
                  foco === f.id ? "bg-primary text-primary-foreground" : "bg-card text-foreground border border-border"
                }`}
              >
                <span>{f.emoji}</span>{f.label}
              </button>
            ))}
          </div>
          <div className="space-y-3 px-4">
            {filtered.map((w) => {
              const locked = w.min_plan === "pro" && !isPro;
              return (
                <button
                  key={w.id}
                  onClick={() => open(w)}
                  className="relative flex w-full items-center gap-4 rounded-2xl border border-border bg-card p-4 text-left transition-transform hover:scale-[1.01]"
                >
                  <div className="text-3xl">{w.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground">{w.nome}</p>
                    <div className="mt-1 flex gap-3 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{w.duracao_min} min</span>
                      <span className="capitalize">{w.nivel}</span>
                    </div>
                  </div>
                  {locked && (
                    <div className="flex items-center gap-1 rounded-full bg-primary px-2 py-1 text-[10px] font-bold text-primary-foreground">
                      <Lock className="h-2.5 w-2.5" />PRO
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </>
      ) : (
        <div className="px-4 py-3 space-y-4">
          {plans.map((p) => (
            <div key={p.id} className="rounded-2xl border border-border bg-card overflow-hidden">
              <div className="bg-gradient-to-br from-primary to-primary/70 p-4 text-primary-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  <h2 className="font-bold">{p.nome}</h2>
                </div>
                <p className="text-xs mt-1 opacity-90">{p.descricao}</p>
              </div>
              <div className="divide-y divide-border">
                {p.dias.map((d) => (
                  <div key={d.dia} className="p-4">
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{d.dia}</span>
                      <h3 className="text-sm font-bold text-foreground">{d.titulo}</h3>
                    </div>
                    <div className="mt-2 ml-9 space-y-1 text-xs text-foreground">
                      <p><span className="font-semibold text-primary">🏋️ Treino:</span> {d.treino}</p>
                      <p><span className="font-semibold text-primary">☀️ Manhã:</span> {d.receita_manha}</p>
                      <p><span className="font-semibold text-primary">🌤️ Almoço:</span> {d.receita_almoco}</p>
                      <p><span className="font-semibold text-primary">🌙 Jantar:</span> {d.receita_jantar}</p>
                      <p className="mt-2 italic text-muted-foreground">{d.dica}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <UpgradeDialog
        open={showUpgrade}
        onOpenChange={setShowUpgrade}
        message="Este treino é exclusivo PRO. Desbloqueie treinos intermediários e avançados."
      />
    </div>
  );
};

export default TreinosPage;
