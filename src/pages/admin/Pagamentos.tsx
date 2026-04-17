import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAdmin } from "@/hooks/useAdmin";
import { toast } from "@/hooks/use-toast";
import { Check, X, Copy, Send, Plus, ExternalLink } from "lucide-react";

type Status = "pendente" | "confirmado" | "rejeitado";
type Plan = "plus" | "pro";
type Source = "app" | "whatsapp" | "manual";

interface Payment {
  id: string;
  user_id: string | null;
  nome: string;
  telefone: string;
  plano: Plan;
  valor: number;
  metodo: string | null;
  comprovativo_url: string | null;
  referencia: string | null;
  status: Status;
  origem: Source;
  observacao: string | null;
  created_at: string;
}

const PLAN_PRICE: Record<Plan, number> = { plus: 97, pro: 147 };

const genCode = (plano: Plan) => {
  const rnd = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `${plano.toUpperCase()}-${rnd}`;
};

const statusBadge = (s: Status) => {
  const map: Record<Status, string> = {
    pendente: "bg-warning/15 text-warning border-warning/30",
    confirmado: "bg-primary/15 text-primary border-primary/30",
    rejeitado: "bg-destructive/15 text-destructive border-destructive/30",
  };
  return map[s];
};

const Pagamentos = () => {
  const { logAction } = useAdmin();
  const [items, setItems] = useState<Payment[]>([]);
  const [filter, setFilter] = useState<"all" | Status>("pendente");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [confirmTarget, setConfirmTarget] = useState<Payment | null>(null);
  const [generatedCode, setGeneratedCode] = useState<{ codigo: string; payment: Payment } | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ nome: "", telefone: "", plano: "plus" as Plan, valor: "97", metodo: "M-Pesa", referencia: "" });

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("payments").select("*").order("created_at", { ascending: false });
    setItems((data ?? []) as Payment[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const ch = supabase
      .channel("payments-admin")
      .on("postgres_changes", { event: "*", schema: "public", table: "payments" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const filtered = items.filter((p) => {
    if (filter !== "all" && p.status !== filter) return false;
    if (search && !`${p.nome} ${p.telefone} ${p.referencia ?? ""}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleConfirm = async (p: Payment) => {
    const codigo = genCode(p.plano);

    // 1. Insert activation code
    const { error: codeErr } = await supabase.from("activation_codes").insert({
      codigo,
      plano: p.plano,
      dias: 30,
      payment_id: p.id,
      usado: false,
    });
    if (codeErr) {
      toast({ title: "Erro ao gerar código", description: codeErr.message, variant: "destructive" });
      return;
    }

    // 2. Update payment
    const { error: payErr } = await supabase
      .from("payments")
      .update({ status: "confirmado", confirmed_at: new Date().toISOString() })
      .eq("id", p.id);
    if (payErr) {
      toast({ title: "Erro ao confirmar pagamento", description: payErr.message, variant: "destructive" });
      return;
    }

    // 3. Notify bot
    const { data: notifyData, error: notifyErr } = await supabase.functions.invoke("notify-bot", {
      body: { telefone: p.telefone, codigo, plano: p.plano, nome: p.nome },
    });

    await logAction("confirm_payment", { payment_id: p.id, codigo, plano: p.plano });

    if (notifyErr || (notifyData && notifyData.sent === false)) {
      toast({
        title: "Pagamento confirmado",
        description: notifyData?.reason === "webhook_not_configured"
          ? "Webhook do bot não configurado — copie e envie o código manualmente."
          : "Código gerado, mas falha ao enviar pelo bot. Envie manualmente.",
      });
    } else {
      toast({ title: "Pagamento confirmado", description: "Código enviado ao usuário via WhatsApp." });
    }

    setGeneratedCode({ codigo, payment: p });
    setConfirmTarget(null);
    load();
  };

  const handleReject = async (p: Payment) => {
    const { error } = await supabase
      .from("payments")
      .update({ status: "rejeitado", confirmed_at: new Date().toISOString() })
      .eq("id", p.id);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
      return;
    }
    await logAction("reject_payment", { payment_id: p.id });
    toast({ title: "Pagamento rejeitado" });
    load();
  };

  const handleCreateManual = async () => {
    if (!form.nome || !form.telefone) {
      toast({ title: "Preencha nome e telefone", variant: "destructive" });
      return;
    }
    const { error } = await supabase.from("payments").insert({
      nome: form.nome,
      telefone: form.telefone,
      plano: form.plano,
      valor: Number(form.valor) || PLAN_PRICE[form.plano],
      metodo: form.metodo,
      referencia: form.referencia || null,
      origem: "manual",
      status: "pendente",
    });
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Pedido criado" });
    setCreateOpen(false);
    setForm({ nome: "", telefone: "", plano: "plus", valor: "97", metodo: "M-Pesa", referencia: "" });
    load();
  };

  const resendBot = async (codigo: string, p: Payment) => {
    const { data, error } = await supabase.functions.invoke("notify-bot", {
      body: { telefone: p.telefone, codigo, plano: p.plano, nome: p.nome },
    });
    if (error || data?.sent === false) {
      toast({ title: "Falha ao reenviar", description: data?.reason ?? error?.message, variant: "destructive" });
    } else {
      toast({ title: "Reenviado pelo bot" });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pagamentos</h1>
          <p className="text-sm text-muted-foreground">Gerir pedidos e ativar planos via bot WhatsApp</p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Novo pedido manual
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
          <TabsList>
            <TabsTrigger value="pendente">Pendentes ({items.filter((i) => i.status === "pendente").length})</TabsTrigger>
            <TabsTrigger value="confirmado">Confirmados</TabsTrigger>
            <TabsTrigger value="rejeitado">Rejeitados</TabsTrigger>
            <TabsTrigger value="all">Todos</TabsTrigger>
          </TabsList>
        </Tabs>
        <Input
          placeholder="Buscar por nome, telefone ou referência..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">A carregar...</p>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="py-10 text-center text-muted-foreground">Nenhum pagamento.</CardContent></Card>
      ) : (
        <div className="grid gap-3">
          {filtered.map((p) => (
            <Card key={p.id}>
              <CardContent className="flex flex-wrap items-start justify-between gap-4 p-4">
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-foreground">{p.nome}</p>
                    <Badge variant="outline" className={statusBadge(p.status)}>{p.status}</Badge>
                    <Badge variant="outline" className="border-primary/30 text-primary">{p.plano.toUpperCase()}</Badge>
                    <Badge variant="outline">{p.origem}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">📱 {p.telefone} • {p.valor} MZN • {p.metodo ?? "—"}</p>
                  {p.referencia && <p className="text-xs text-muted-foreground">Ref: {p.referencia}</p>}
                  <p className="text-xs text-muted-foreground">{new Date(p.created_at).toLocaleString("pt-BR")}</p>
                  {p.comprovativo_url && (
                    <a href={p.comprovativo_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                      <ExternalLink className="h-3 w-3" /> Ver comprovativo
                    </a>
                  )}
                </div>
                {p.status === "pendente" && (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => setConfirmTarget(p)} className="gap-1">
                      <Check className="h-4 w-4" /> Confirmar
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleReject(p)} className="gap-1">
                      <X className="h-4 w-4" /> Rejeitar
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Confirm dialog */}
      <Dialog open={!!confirmTarget} onOpenChange={(o) => !o && setConfirmTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar pagamento</DialogTitle>
            <DialogDescription>
              Será gerado um código de ativação de 30 dias para o plano <b>{confirmTarget?.plano.toUpperCase()}</b> e enviado para <b>{confirmTarget?.telefone}</b> via bot WhatsApp.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmTarget(null)}>Cancelar</Button>
            <Button onClick={() => confirmTarget && handleConfirm(confirmTarget)}>Gerar e enviar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Generated code dialog */}
      <Dialog open={!!generatedCode} onOpenChange={(o) => !o && setGeneratedCode(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Código gerado</DialogTitle>
            <DialogDescription>Use o botão abaixo para copiar ou reenviar pelo bot.</DialogDescription>
          </DialogHeader>
          <div className="rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 p-4 text-center">
            <p className="text-2xl font-bold tracking-wider text-primary">{generatedCode?.codigo}</p>
          </div>
          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button variant="outline" className="gap-2" onClick={() => {
              navigator.clipboard.writeText(generatedCode?.codigo ?? "");
              toast({ title: "Código copiado" });
            }}>
              <Copy className="h-4 w-4" /> Copiar
            </Button>
            <Button className="gap-2" onClick={() => generatedCode && resendBot(generatedCode.codigo, generatedCode.payment)}>
              <Send className="h-4 w-4" /> Reenviar pelo bot
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manual create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo pedido manual</DialogTitle>
            <DialogDescription>Registar um pagamento recebido fora do app.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Nome" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
            <Input placeholder="Telefone (ex: 258840000000)" value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <Select value={form.plano} onValueChange={(v) => setForm({ ...form, plano: v as Plan, valor: String(PLAN_PRICE[v as Plan]) })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="plus">PLUS — 97 MZN</SelectItem>
                  <SelectItem value="pro">PRO — 147 MZN</SelectItem>
                </SelectContent>
              </Select>
              <Input type="number" placeholder="Valor" value={form.valor} onChange={(e) => setForm({ ...form, valor: e.target.value })} />
            </div>
            <Select value={form.metodo} onValueChange={(v) => setForm({ ...form, metodo: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="M-Pesa">M-Pesa</SelectItem>
                <SelectItem value="eMola">eMola</SelectItem>
                <SelectItem value="Transferência">Transferência</SelectItem>
                <SelectItem value="Outro">Outro</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Referência da transação (opcional)" value={form.referencia} onChange={(e) => setForm({ ...form, referencia: e.target.value })} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreateManual}>Criar pedido</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Pagamentos;
