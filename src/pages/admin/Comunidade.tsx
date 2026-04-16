import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/hooks/useAdmin";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

interface Post {
  id: string;
  conteudo: string;
  tipo: string;
  user_id: string;
  created_at: string;
}

const AdminComunidade = () => {
  const { logAction } = useAdmin();
  const [posts, setPosts] = useState<Post[]>([]);
  const [confirm, setConfirm] = useState<{ post: Post } | null>(null);

  const fetchPosts = async () => {
    const { data } = await supabase.from("posts").select("*").order("created_at", { ascending: false });
    if (data) setPosts(data);
  };

  useEffect(() => { fetchPosts(); }, []);

  const deletePost = async (post: Post) => {
    await supabase.from("posts").delete().eq("id", post.id);
    await logAction("Apagar post", { postId: post.id });
    toast({ title: "Post apagado" });
    setConfirm(null);
    fetchPosts();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold">Gestão da Comunidade</h1>
      <div className="rounded-lg border bg-card overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Conteúdo</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="max-w-xs truncate">{p.conteudo}</TableCell>
                <TableCell><Badge variant="outline">{p.tipo}</Badge></TableCell>
                <TableCell className="text-sm text-muted-foreground">{new Date(p.created_at).toLocaleDateString("pt-BR")}</TableCell>
                <TableCell>
                  <Button size="sm" variant="destructive" onClick={() => setConfirm({ post: p })}>Apagar</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!confirm} onOpenChange={() => setConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apagar post</DialogTitle>
            <DialogDescription>Tem certeza que deseja apagar este post? Esta ação não pode ser desfeita.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirm(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={() => confirm && deletePost(confirm.post)}>Apagar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminComunidade;
