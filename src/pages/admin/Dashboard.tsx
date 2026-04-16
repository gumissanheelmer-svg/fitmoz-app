import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, Clock, Crown, Zap, DollarSign, UserPlus } from "lucide-react";

interface Stats {
  total: number;
  ativos: number;
  teste: number;
  plus: number;
  pro: number;
  pendentes: number;
  novosHoje: number;
}

const Dashboard = () => {
  const [stats, setStats] = useState<Stats>({ total: 0, ativos: 0, teste: 0, plus: 0, pro: 0, pendentes: 0, novosHoje: 0 });

  useEffect(() => {
    const fetch = async () => {
      const { data: profiles } = await supabase.from("profiles").select("plano, status, created_at");
      if (!profiles) return;
      const today = new Date().toISOString().split("T")[0];
      setStats({
        total: profiles.length,
        ativos: profiles.filter((p) => p.status === "ativo").length,
        teste: profiles.filter((p) => p.status === "teste").length,
        plus: profiles.filter((p) => p.plano === "plus").length,
        pro: profiles.filter((p) => p.plano === "pro").length,
        pendentes: profiles.filter((p) => p.status === "pendente").length,
        novosHoje: profiles.filter((p) => p.created_at.startsWith(today)).length,
      });
    };
    fetch();
  }, []);

  const receita = stats.plus * 97 + stats.pro * 147;

  const cards = [
    { label: "Total Usuários", value: stats.total, icon: Users, color: "text-foreground" },
    { label: "Ativos", value: stats.ativos, icon: UserCheck, color: "text-primary" },
    { label: "Em Teste", value: stats.teste, icon: Clock, color: "text-warning" },
    { label: "Pendentes", value: stats.pendentes, icon: Clock, color: "text-destructive" },
    { label: "Plano PLUS", value: stats.plus, icon: Zap, color: "text-primary" },
    { label: "Plano PRO", value: stats.pro, icon: Crown, color: "text-primary" },
    { label: "Receita Estimada", value: `${receita} MZN`, icon: DollarSign, color: "text-primary" },
    { label: "Novos Hoje", value: stats.novosHoje, icon: UserPlus, color: "text-primary" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{c.label}</CardTitle>
              <c.icon className={`h-5 w-5 ${c.color}`} />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{c.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
