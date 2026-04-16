import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/hooks/useAdmin";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";

interface Report {
  id: string;
  post_id: string;
  reporter_id: string;
  motivo: string;
  status: string;
  created_at: string;
}

const statusColor: Record<string, string> = {
  pendente: "bg-destructive/80 text-destructive-foreground",
  resolvido: "bg-primary text-primary-foreground",
  ignorado: "bg-muted text-muted-foreground",
};

const Denuncias = () => {
  const { logAction } = useAdmin();
  const [reports, setReports] = useState<Report[]>([]);

  const fetchReports = async () => {
    const { data } = await supabase.from("reports").select("*").order("created_at", { ascending: false });
    if (data) setReports(data);
  };

  useEffect(() => { fetchReports(); }, []);

  const updateReport = async (id: string, status: "resolvido" | "ignorado") => {
    await supabase.from("reports").update({ status }).eq("id", id);
    await logAction(`Denúncia ${status}`, { reportId: id });
    toast({ title: `Denúncia marcada como ${status}` });
    fetchReports();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold">Denúncias</h1>
      <div className="rounded-lg border bg-card overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Motivo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reports.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">Nenhuma denúncia</TableCell></TableRow>
            ) : reports.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{r.motivo}</TableCell>
                <TableCell><Badge className={statusColor[r.status] || ""}>{r.status}</Badge></TableCell>
                <TableCell className="text-sm text-muted-foreground">{new Date(r.created_at).toLocaleDateString("pt-BR")}</TableCell>
                <TableCell>
                  {r.status === "pendente" && (
                    <div className="flex gap-1">
                      <Button size="sm" onClick={() => updateReport(r.id, "resolvido")}>Resolver</Button>
                      <Button size="sm" variant="outline" onClick={() => updateReport(r.id, "ignorado")}>Ignorar</Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Denuncias;
