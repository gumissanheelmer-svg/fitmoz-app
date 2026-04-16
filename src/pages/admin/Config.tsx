import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Config = () => (
  <div className="space-y-6 animate-fade-in">
    <h1 className="text-2xl font-bold">Configurações</h1>

    <Card>
      <CardHeader><CardTitle>Planos e Preços</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span>Plano PLUS</span>
          <Badge variant="outline" className="text-lg font-bold">97 MZN</Badge>
        </div>
        <div className="flex items-center justify-between">
          <span>Plano PRO</span>
          <Badge variant="outline" className="text-lg font-bold">147 MZN</Badge>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader><CardTitle>Período de Teste</CardTitle></CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Novos usuários recebem <strong>3 dias</strong> de teste gratuito.</p>
      </CardContent>
    </Card>

    <Card>
      <CardHeader><CardTitle>Funcionalidades</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        {["Comunidade", "Coach IA", "Notificações"].map((f) => (
          <div key={f} className="flex items-center justify-between">
            <span>{f}</span>
            <Badge className="bg-primary text-primary-foreground">Ativo</Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  </div>
);

export default Config;
