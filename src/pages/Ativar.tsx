import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, KeyRound, Check } from "lucide-react";

const Ativar = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [codigo, setCodigo] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<{ plano: string; expira: string } | null>(null);

  const ativar = async () => {
    if (!user || !codigo.trim()) return;
    setLoading(true);
    try {
      const code = codigo.trim().toUpperCase();
      const { data: codeRow, error: fetchErr } = await supabase
        .from("activation_codes")
        .select("*")
        .eq("codigo", code)
        .maybeSingle();

      if (fetchErr) throw fetchErr;
      if (!codeRow) {
        toast({ title: "Código inválido", description: "Verifique e tente novamente.", variant: "destructive" });
        return;
      }
      if (codeRow.usado) {
        toast({ title: "Código já utilizado", variant: "destructive" });
        return;
      }

      const expiraEm = new Date(Date.now() + (codeRow.dias ?? 30) * 24 * 60 * 60 * 1000).toISOString();

      // Mark code as used
      const { error: claimErr } = await supabase
        .from("activation_codes")
        .update({ usado: true, used_by: user.id, used_at: new Date().toISOString() })
        .eq("id", codeRow.id);
      if (claimErr) throw claimErr;

      // Update profile
      const { error: profErr } = await supabase
        .from("profiles")
        .update({ plano: codeRow.plano, status: "ativo", expira_em: expiraEm })
        .eq("user_id", user.id);
      if (profErr) throw profErr;

      setSuccess({ plano: codeRow.plano, expira: new Date(expiraEm).toLocaleDateString("pt-BR") });
    } catch (e) {
      toast({ title: "Erro", description: (e as Error).message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-6 text-center animate-fade-in">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/15">
          <Check className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-xl font-bold">Plano {success.plano.toUpperCase()} ativado! 🎉</h2>
        <p className="text-sm text-muted-foreground">Válido até <b>{success.expira}</b></p>
        <Button onClick={() => navigate("/")} className="w-full max-w-xs">Começar a treinar</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 px-4 py-4 pb-24 animate-fade-in">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-muted-foreground">
        <ArrowLeft className="h-4 w-4" /> Voltar
      </button>
      <h1 className="text-2xl font-bold">Ativar código</h1>
      <p className="text-sm text-muted-foreground">Cole o código que recebeu por WhatsApp para ativar seu plano.</p>

      <Card><CardContent className="space-y-4 p-4">
        <div className="flex items-center justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/15">
            <KeyRound className="h-7 w-7 text-primary" />
          </div>
        </div>
        <Input
          value={codigo}
          onChange={(e) => setCodigo(e.target.value.toUpperCase())}
          placeholder="PLUS-XXXXXX"
          className="h-14 text-center text-lg font-bold tracking-widest"
        />
        <Button onClick={ativar} disabled={loading || !codigo} className="w-full">
          {loading ? "A validar..." : "Ativar plano"}
        </Button>
      </CardContent></Card>

      <Button onClick={() => navigate("/pagamento")} variant="outline" className="w-full">
        Ainda não pagou? Enviar comprovativo
      </Button>
    </div>
  );
};

export default Ativar;
