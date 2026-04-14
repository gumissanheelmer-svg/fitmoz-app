import { useState } from "react";
import { Leaf, ChevronRight } from "lucide-react";

const categories = ["Emagrecimento", "Ganho de Massa"] as const;

const recipes = [
  { id: 1, categoria: "Emagrecimento", titulo: "Salada Proteica", descricao: "Frango grelhado com folhas e legumes — 320 kcal" },
  { id: 2, categoria: "Emagrecimento", titulo: "Smoothie Verde", descricao: "Espinafre, banana e aveia — 180 kcal" },
  { id: 3, categoria: "Emagrecimento", titulo: "Sopa Detox", descricao: "Legumes variados com gengibre — 150 kcal" },
  { id: 4, categoria: "Ganho de Massa", titulo: "Bowl Energético", descricao: "Aveia, whey, banana e pasta de amendoim — 550 kcal" },
  { id: 5, categoria: "Ganho de Massa", titulo: "Frango com Batata Doce", descricao: "Clássico fitness — 480 kcal" },
  { id: 6, categoria: "Ganho de Massa", titulo: "Panqueca Proteica", descricao: "Aveia, ovos e banana — 400 kcal" },
];

const Receitas = () => {
  const [selected, setSelected] = useState<(typeof categories)[number]>("Emagrecimento");
  const filtered = recipes.filter((r) => r.categoria === selected);

  return (
    <div className="animate-fade-in space-y-5 p-5">
      <div className="pt-2">
        <h1 className="text-2xl font-extrabold text-foreground">Receitas</h1>
        <p className="text-sm text-muted-foreground">Alimente sua transformação</p>
      </div>

      <div className="flex gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelected(cat)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              selected === cat
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((r) => (
          <div
            key={r.id}
            className="animate-slide-up flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:bg-muted"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-secondary">
              <Leaf className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-foreground">{r.titulo}</p>
              <p className="text-sm text-muted-foreground">{r.descricao}</p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Receitas;
