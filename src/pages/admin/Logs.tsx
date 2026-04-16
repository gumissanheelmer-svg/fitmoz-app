import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Log {
  id: string;
  admin_id: string;
  action: string;
  details: Record<string, unknown> | null;
  created_at: string;
}

const Logs = () => {
  const [logs, setLogs] = useState<Log[]>([]);

  useEffect(() => {
    supabase.from("admin_logs").select("*").order("created_at", { ascending: false }).limit(100)
      .then(({ data }) => { if (data) setLogs(data as Log[]); });
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold">Logs do Sistema</h1>
      <div className="rounded-lg border bg-card overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ação</TableHead>
              <TableHead>Detalhes</TableHead>
              <TableHead>Data</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.length === 0 ? (
              <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-8">Nenhum log registrado</TableCell></TableRow>
            ) : logs.map((l) => (
              <TableRow key={l.id}>
                <TableCell className="font-medium">{l.action}</TableCell>
                <TableCell className="text-sm text-muted-foreground max-w-xs truncate">{l.details ? JSON.stringify(l.details) : "—"}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{new Date(l.created_at).toLocaleString("pt-BR")}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Logs;
