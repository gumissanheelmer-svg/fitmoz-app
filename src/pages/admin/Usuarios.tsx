import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/hooks/useAdmin";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type PlanStatus = Database["public"]["Enums"]["plan_status"];
type AppPlan = Database["public"]["Enums"]["app_plan"];

const statusColor: Record<string, string> = {
  ativo: "bg-primary text-primary-foreground",
  teste: "bg-warning text-warning-foreground",
  expirado: "bg-muted text-muted-foreground",
  pendente: "bg-destructive/80 text-destructive-foreground",
  rejeitado: "bg-destructive text-destructive-foreground",
};

const Usuarios = () => {
  const { logAction } = useAdmin();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [confirm, setConfirm] = useState<{ action: string; user: Profile; exec: () => Promise<void> } | null>(null);

  const fetchProfiles = useCallback(async () => {
    const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    if (data) setProfiles(data);
  }, []);

  useEffect(() => { fetchProfiles(); }, [fetchProfiles]);

  const updateUser = async (userId: string, updates: { status?: PlanStatus; plano?: AppPlan }, actionLabel: string) => {
    await supabase.from("profiles").update(updates).eq("user_id", userId);
    await logAction(actionLabel, { userId, ...updates });
    toast({ title: "Sucesso", description: `${actionLabel} realizado.` });
    fetchProfiles();
    setConfirm(null);
  };

  const confirmAction = (action: string, user: Profile, exec: () => Promise<void>) => {
    setConfirm({ action, user, exec });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold">Gestão de Usuários</h1>
      <div className="rounded-lg border bg-card overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Plano</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Registro</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {profiles.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.nome || "—"}</TableCell>
                <TableCell>{p.email || "—"}</TableCell>
                <TableCell><Badge variant="outline" className="uppercase">{p.plano}</Badge></TableCell>
                <TableCell><Badge className={statusColor[p.status] || ""}>{p.status}</Badge></TableCell>
                <TableCell className="text-sm text-muted-foreground">{new Date(p.created_at).toLocaleDateString("pt-BR")}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {p.status === "pendente" && (
                      <>
                        <Button size="sm" variant="default" onClick={() => confirmAction("Aprovar conta", p, () => updateUser(p.user_id, { status: "ativo" }, "Aprovar conta"))}>Aprovar</Button>
                        <Button size="sm" variant="destructive" onClick={() => confirmAction("Rejeitar conta", p, () => updateUser(p.user_id, { status: "rejeitado" }, "Rejeitar conta"))}>Rejeitar</Button>
                      </>
                    )}
                    {p.status === "ativo" && (
                      <Button size="sm" variant="destructive" onClick={() => confirmAction("Bloquear usuário", p, () => updateUser(p.user_id, { status: "rejeitado" }, "Bloquear usuário"))}>Bloquear</Button>
                    )}
                    {p.plano === "plus" && (
                      <Button size="sm" variant="outline" onClick={() => confirmAction("Promover para PRO", p, () => updateUser(p.user_id, { plano: "pro" }, "Promover para PRO"))}>→ PRO</Button>
                    )}
                    {p.plano === "pro" && (
                      <Button size="sm" variant="outline" onClick={() => confirmAction("Rebaixar para PLUS", p, () => updateUser(p.user_id, { plano: "plus" }, "Rebaixar para PLUS"))}>→ PLUS</Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!confirm} onOpenChange={() => setConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar ação</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja <strong>{confirm?.action}</strong> para o usuário <strong>{confirm?.user.nome || confirm?.user.email}</strong>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirm(null)}>Cancelar</Button>
            <Button onClick={() => confirm?.exec()}>Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Usuarios;
