import { ArrowLeft, Eye, Users, Trash2, Download, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type Privacy = {
  publicProfile: boolean;
  showProgress: boolean;
};

const DEFAULTS: Privacy = { publicProfile: true, showProgress: true };
const STORAGE_KEY = "fitmoz:privacy";

const Privacidade = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [privacy, setPrivacy] = useState<Privacy>(DEFAULTS);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        setPrivacy({ ...DEFAULTS, ...JSON.parse(raw) });
      } catch {
        // ignore
      }
    }
  }, []);

  const update = <K extends keyof Privacy>(key: K, value: Privacy[K]) => {
    const next = { ...privacy, [key]: value };
    setPrivacy(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    toast.success("Preferência atualizada");
  };

  const handleExport = async () => {
    if (!user) return;
    setExporting(true);
    try {
      const [profile, posts, messages] = await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", user.id).single(),
        supabase.from("posts").select("*").eq("user_id", user.id),
        supabase.from("chat_messages").select("*").eq("user_id", user.id),
      ]);

      const data = {
        exportedAt: new Date().toISOString(),
        profile: profile.data,
        posts: posts.data,
        chatMessages: messages.data,
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `fitmoz-meus-dados-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Dados exportados");
    } catch (e) {
      toast.error("Erro ao exportar dados");
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = async () => {
    if (!user) return;
    try {
      await supabase.from("posts").delete().eq("user_id", user.id);
      await supabase.from("chat_messages").delete().eq("user_id", user.id);
      await signOut();
      toast.success("Seus dados foram removidos");
      navigate("/auth");
    } catch {
      toast.error("Erro ao remover dados");
    }
  };

  return (
    <div className="animate-fade-in space-y-6 p-5">
      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={() => navigate(-1)}
          className="rounded-full p-2 hover:bg-muted"
          aria-label="Voltar"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-extrabold text-foreground">Privacidade</h1>
      </div>

      <section className="rounded-xl border border-border bg-card">
        <Row
          icon={<Eye className="h-5 w-5 text-primary" />}
          title="Perfil público"
          desc="Outros usuários podem ver seu perfil"
        >
          <Switch
            checked={privacy.publicProfile}
            onCheckedChange={(v) => update("publicProfile", v)}
          />
        </Row>
        <Divider />
        <Row
          icon={<Users className="h-5 w-5 text-primary" />}
          title="Mostrar progresso"
          desc="Exibir streak e dias treinados"
        >
          <Switch
            checked={privacy.showProgress}
            onCheckedChange={(v) => update("showProgress", v)}
          />
        </Row>
      </section>

      <section className="space-y-2">
        <p className="px-1 text-xs font-semibold uppercase text-muted-foreground">
          Seus dados
        </p>

        <button
          onClick={handleExport}
          disabled={exporting}
          className="flex w-full items-center gap-3 rounded-xl border border-border bg-card p-4 text-left transition-colors hover:bg-muted disabled:opacity-50"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Download className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-foreground">Exportar meus dados</p>
            <p className="text-xs text-muted-foreground">
              {exporting ? "Preparando…" : "Baixar arquivo JSON"}
            </p>
          </div>
        </button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button className="flex w-full items-center gap-3 rounded-xl border border-destructive/30 bg-card p-4 text-left transition-colors hover:bg-destructive/5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
                <Trash2 className="h-5 w-5 text-destructive" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-destructive">Remover meus dados</p>
                <p className="text-xs text-muted-foreground">
                  Apaga publicações e mensagens
                </p>
              </div>
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remover seus dados?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação apaga suas publicações e conversas com o coach. A sessão
                será encerrada. Não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Remover
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </section>

      <section className="flex items-start gap-3 rounded-xl bg-secondary p-4">
        <Shield className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        <p className="text-xs text-muted-foreground">
          Seus dados são protegidos e nunca compartilhados com terceiros. Veja
          nossa política de privacidade para mais detalhes.
        </p>
      </section>
    </div>
  );
};

const Row = ({
  icon,
  title,
  desc,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  children: React.ReactNode;
}) => (
  <div className="flex items-center gap-3 p-4">
    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
      {icon}
    </div>
    <div className="flex-1">
      <p className="font-semibold text-foreground">{title}</p>
      <p className="text-xs text-muted-foreground">{desc}</p>
    </div>
    {children}
  </div>
);

const Divider = () => <div className="mx-4 border-t border-border" />;

export default Privacidade;
