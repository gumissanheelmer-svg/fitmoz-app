import { useState } from "react";
import { Search, Lock, ArrowLeft } from "lucide-react";
import { useRecipes, type Recipe } from "@/hooks/useContent";
import { usePlan } from "@/hooks/usePlan";
import UpgradeDialog from "@/components/UpgradeDialog";

const CATEGORIAS = [
  { id: "todos", label: "Todos", emoji: "🍽️" },
  { id: "sopa_detox", label: "Sopas Detox", emoji: "🍲" },
  { id: "cha", label: "Chás", emoji: "🍵" },
  { id: "salada", label: "Saladas", emoji: "🥗" },
  { id: "refeicao_leve", label: "Refeições", emoji: "🥑" },
  { id: "suco", label: "Sucos", emoji: "🥤" },
] as const;

const ReceitasPage = () => {
  const { recipes, loading } = useRecipes();
  const { isPro } = usePlan();
  const [cat, setCat] = useState<string>("todos");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Recipe | null>(null);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const filtered = recipes.filter(
    (r) =>
      (cat === "todos" || r.categoria === cat) &&
      r.nome.toLowerCase().includes(search.toLowerCase())
  );

  const open = (r: Recipe) => {
    if (r.min_plan === "pro" && !isPro) {
      setShowUpgrade(true);
      return;
    }
    setSelected(r);
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
          <div className="rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 p-6 text-center">
            <div className="text-5xl mb-2">{selected.emoji}</div>
            <p className="text-xs font-semibold uppercase text-primary">{selected.objetivo}</p>
          </div>
          <Section title="🥕 Ingredientes">
            <ul className="space-y-1.5 text-sm text-foreground">
              {selected.ingredientes.map((i, idx) => (
                <li key={idx} className="flex gap-2"><span className="text-primary">•</span>{i}</li>
              ))}
            </ul>
          </Section>
          <Section title="👩‍🍳 Modo de preparo">
            <ol className="space-y-2 text-sm text-foreground">
              {selected.modo_preparo.map((p, idx) => (
                <li key={idx} className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{idx + 1}</span>
                  {p}
                </li>
              ))}
            </ol>
          </Section>
          <Section title="⏰ Quando consumir"><p className="text-sm text-foreground">{selected.quando_consumir}</p></Section>
          <Section title="✨ Benefícios"><p className="text-sm text-foreground">{selected.beneficios}</p></Section>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in pb-6">
      <div className="bg-card px-4 py-4 border-b border-border">
        <h1 className="text-xl font-bold text-foreground">Receitas Fit 🥗</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Receitas simples para emagrecer</p>
        <div className="relative mt-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar receita..."
            className="w-full rounded-full border border-border bg-background py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto px-4 py-3">
        {CATEGORIAS.map((c) => (
          <button
            key={c.id}
            onClick={() => setCat(c.id)}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
              cat === c.id ? "bg-primary text-primary-foreground" : "bg-card text-foreground border border-border"
            }`}
          >
            <span>{c.emoji}</span>{c.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 px-4">
        {filtered.map((r) => {
          const locked = r.min_plan === "pro" && !isPro;
          return (
            <button
              key={r.id}
              onClick={() => open(r)}
              className="relative flex flex-col items-center rounded-2xl border border-border bg-card p-4 text-center transition-transform hover:scale-[1.02]"
            >
              {locked && (
                <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-primary/90 px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
                  <Lock className="h-2.5 w-2.5" />PRO
                </div>
              )}
              <div className="text-4xl mb-2">{r.emoji}</div>
              <p className="text-sm font-semibold text-foreground line-clamp-2">{r.nome}</p>
              <p className="text-[10px] text-muted-foreground mt-1 line-clamp-1">{r.objetivo}</p>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-sm text-muted-foreground mt-12">Nenhuma receita encontrada</p>
      )}

      <UpgradeDialog
        open={showUpgrade}
        onOpenChange={setShowUpgrade}
        message="Esta receita é exclusiva para assinantes PRO. Desbloqueie todas as receitas avançadas."
      />
    </div>
  );
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div>
    <h2 className="text-sm font-bold text-foreground mb-2">{title}</h2>
    <div className="rounded-xl border border-border bg-card p-4">{children}</div>
  </div>
);

export default ReceitasPage;
