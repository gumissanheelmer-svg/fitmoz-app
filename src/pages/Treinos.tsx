import { useState } from "react";
import { Clock, ChevronRight } from "lucide-react";

const levels = ["Iniciante", "Intermediário", "Avançado"] as const;

const workouts = [
  { id: 1, nivel: "Iniciante", titulo: "Queima Rápida", descricao: "Treino cardio para iniciantes", duracao: "15 min" },
  { id: 2, nivel: "Iniciante", titulo: "Core Básico", descricao: "Fortalecimento do abdômen", duracao: "10 min" },
  { id: 3, nivel: "Intermediário", titulo: "Full Body", descricao: "Treino completo de corpo inteiro", duracao: "25 min" },
  { id: 4, nivel: "Intermediário", titulo: "HIIT Intenso", descricao: "Intervalos de alta intensidade", duracao: "20 min" },
  { id: 5, nivel: "Avançado", titulo: "Beast Mode", descricao: "Treino extremo para queima máxima", duracao: "35 min" },
  { id: 6, nivel: "Avançado", titulo: "Tabata Pro", descricao: "Protocolo Tabata avançado", duracao: "30 min" },
];

const Treinos = () => {
  const [selected, setSelected] = useState<(typeof levels)[number]>("Iniciante");
  const filtered = workouts.filter((w) => w.nivel === selected);

  return (
    <div className="animate-fade-in space-y-5 p-5">
      <div className="pt-2">
        <h1 className="text-2xl font-extrabold text-foreground">Treinos</h1>
        <p className="text-sm text-muted-foreground">Escolha seu nível e comece agora</p>
      </div>

      {/* Level Tabs */}
      <div className="flex gap-2">
        {levels.map((level) => (
          <button
            key={level}
            onClick={() => setSelected(level)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              selected === level
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground"
            }`}
          >
            {level}
          </button>
        ))}
      </div>

      {/* Workout List */}
      <div className="space-y-3">
        {filtered.map((w) => (
          <div
            key={w.id}
            className="animate-slide-up flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:bg-muted"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-secondary">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-foreground">{w.titulo}</p>
              <p className="text-sm text-muted-foreground">{w.descricao}</p>
              <p className="mt-1 text-xs font-semibold text-primary">{w.duracao}</p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Treinos;
