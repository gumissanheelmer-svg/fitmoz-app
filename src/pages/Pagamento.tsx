import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Upload, Check } from "lucide-react";

type Plan = "plus" | "pro";
const PRICE: Record<Plan, number> = { plus: 97, pro: 147 };

const Pagamento = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [plano, setPlano] = useState<Plan>("plus");
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [metodo, setMetodo] = useState("M-Pesa");
  const [referencia, setReferencia] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async () => {
    if (!user) return;
    if (!nome || !telefone) {
      toast({ title: "Preencha nome e telefone", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      let comprovativo_url: string | null = null;
      if (file) {
        const ext = file.name.split(".").pop();
        const path = `${user.id}/${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage.from("comprovativos").upload(path, file);
        if (upErr) throw upErr;
        comprovativo_url = supabase.storage.from("comprovativos").getPublicUrl(path).data.publicUrl;
      }
      const { error } = await supabase.from("payments").insert({
        user_id: user.id,
        nome,
        telefone,
        plano,
        valor: PRICE[plano],
        metodo,
        referencia: referencia || null,
        comprovativo_url,
        origem: "app",
        status: "pendente",
      });
      if (error) throw error;
      setDone(true);
    } catch (e) {
      toast({ title: "Erro", description: (e as Error).message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-6 text-center animate-fade-in">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/15">
          <Check className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-xl font-bold">Pedido enviado!</h2>
        <p className="text-sm text-muted-foreground max-w-sm">
          Assim que confirmarmos seu pagamento, enviaremos o código de ativação no WhatsApp <b>{telefone}</b>.
        </p>
        <Button onClick={() => navigate("/ativar")} variant="outline">Já tenho um código</Button>
        <Button onClick={() => navigate("/perfil")} className="w-full max-w-xs">Voltar ao perfil</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 px-4 py-4 pb-24 animate-fade-in">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-muted-foreground">
        <ArrowLeft className="h-4 w-4" /> Voltar
      </button>
      <h1 className="text-2xl font-bold">Ativar plano</h1>
      <p className="text-sm text-muted-foreground">Faça o pagamento e envie o comprovativo. Você receberá o código por WhatsApp.</p>

      <Card><CardContent className="space-y-4 p-4">
        <div className="space-y-2">
          <Label>Plano</Label>
          <Select value={plano} onValueChange={(v) => setPlano(v as Plan)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="plus">PLUS — 97 MZN / mês</SelectItem>
              <SelectItem value="pro">PRO — 147 MZN / mês</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-xl bg-secondary p-3 text-sm">
          <p className="font-semibold">Como pagar:</p>
          <p className="text-muted-foreground">M-Pesa / eMola: <b>84 000 0000</b></p>
          <p className="text-muted-foreground">Valor: <b>{PRICE[plano]} MZN</b></p>
        </div>

        <div className="space-y-2">
          <Label>Seu nome</Label>
          <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome completo" />
        </div>

        <div className="space-y-2">
          <Label>Telefone (WhatsApp)</Label>
          <Input value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="258 84 000 0000" />
        </div>

        <div className="space-y-2">
          <Label>Método</Label>
          <Select value={metodo} onValueChange={setMetodo}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="M-Pesa">M-Pesa</SelectItem>
              <SelectItem value="eMola">eMola</SelectItem>
              <SelectItem value="Transferência">Transferência</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Referência da transação (opcional)</Label>
          <Input value={referencia} onChange={(e) => setReferencia(e.target.value)} placeholder="Ex: MP240417.1234" />
        </div>

        <div className="space-y-2">
          <Label>Comprovativo (foto)</Label>
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border p-4 text-sm text-muted-foreground hover:border-primary">
            <Upload className="h-4 w-4" />
            {file ? file.name : "Toque para anexar"}
            <input type="file" accept="image/*" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          </label>
        </div>
      </CardContent></Card>

      <Button onClick={submit} disabled={loading} className="w-full">
        {loading ? "A enviar..." : "Enviar pedido"}
      </Button>
      <Button onClick={() => navigate("/ativar")} variant="outline" className="w-full">Já tenho um código</Button>
    </div>
  );
};

export default Pagamento;
