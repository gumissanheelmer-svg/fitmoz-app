import { useState, useEffect } from "react";
import { Heart, MessageCircle, Plus, Send, Lock } from "lucide-react";
import { usePlan } from "@/hooks/usePlan";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import UpgradeDialog from "@/components/UpgradeDialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

type PostType = "livre" | "progresso" | "pergunta";

interface Comment {
  id: string;
  user_id: string;
  texto: string;
  created_at: string;
  profile_nome?: string;
}

interface Post {
  id: string;
  user_id: string;
  conteudo: string;
  tipo: PostType;
  created_at: string;
  profile_nome?: string;
  likes_count: number;
  liked: boolean;
  comments: Comment[];
}

const typeLabels: Record<PostType, string> = {
  livre: "Post",
  progresso: "📊 Progresso",
  pergunta: "❓ Pergunta",
};

const timeAgo = (date: string) => {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "agora";
  if (mins < 60) return `há ${mins}min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `há ${hours}h`;
  return `há ${Math.floor(hours / 24)}d`;
};

const Comunidade = () => {
  const { isPro } = usePlan();
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [newPostType, setNewPostType] = useState<PostType>("livre");
  const [newPostContent, setNewPostContent] = useState("");
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());

  const fetchPosts = async () => {
    const { data: postsData } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (!postsData) { setLoading(false); return; }

    const postIds = postsData.map((p) => p.id);
    const userIds = [...new Set(postsData.map((p) => p.user_id))];

    const [{ data: likesData }, { data: commentsData }, { data: profilesData }] = await Promise.all([
      supabase.from("likes").select("post_id, user_id").in("post_id", postIds),
      supabase.from("comments").select("*").in("post_id", postIds).order("created_at", { ascending: true }),
      supabase.from("profiles").select("user_id, nome").in("user_id", userIds),
    ]);

    const commentUserIds = [...new Set((commentsData || []).map((c) => c.user_id))];
    let commentProfiles: Record<string, string> = {};
    if (commentUserIds.length > 0) {
      const { data: cpData } = await supabase.from("profiles").select("user_id, nome").in("user_id", commentUserIds);
      commentProfiles = Object.fromEntries((cpData || []).map((p) => [p.user_id, p.nome]));
    }

    const profileMap = Object.fromEntries((profilesData || []).map((p) => [p.user_id, p.nome]));

    const enriched: Post[] = postsData.map((p) => ({
      id: p.id,
      user_id: p.user_id,
      conteudo: p.conteudo,
      tipo: p.tipo,
      created_at: p.created_at,
      profile_nome: profileMap[p.user_id] || "Atleta",
      likes_count: (likesData || []).filter((l) => l.post_id === p.id).length,
      liked: !!(likesData || []).find((l) => l.post_id === p.id && l.user_id === user?.id),
      comments: (commentsData || [])
        .filter((c) => c.post_id === p.id)
        .map((c) => ({ ...c, profile_nome: commentProfiles[c.user_id] || "Atleta" })),
    }));

    setPosts(enriched);
    setLoading(false);
  };

  useEffect(() => {
    fetchPosts();
  }, [user]);

  const handleLike = async (postId: string) => {
    if (!isPro) { setShowUpgrade(true); return; }
    if (!user) return;

    const post = posts.find((p) => p.id === postId);
    if (!post) return;

    if (post.liked) {
      await supabase.from("likes").delete().eq("post_id", postId).eq("user_id", user.id);
    } else {
      await supabase.from("likes").insert({ post_id: postId, user_id: user.id });
    }

    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, liked: !p.liked, likes_count: p.liked ? p.likes_count - 1 : p.likes_count + 1 }
          : p
      )
    );
  };

  const handleComment = async (postId: string) => {
    if (!isPro) { setShowUpgrade(true); return; }
    if (!user) return;
    const text = commentInputs[postId]?.trim();
    if (!text) return;

    const { data, error } = await supabase
      .from("comments")
      .insert({ post_id: postId, user_id: user.id, texto: text })
      .select()
      .single();

    if (error) { toast.error("Erro ao comentar"); return; }

    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, comments: [...p.comments, { ...data, profile_nome: "Você" }] }
          : p
      )
    );
    setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim() || !user) return;

    const { error } = await supabase.from("posts").insert({
      user_id: user.id,
      conteudo: newPostContent,
      tipo: newPostType,
    });

    if (error) { toast.error("Erro ao publicar"); return; }

    setNewPostContent("");
    setNewPostType("livre");
    setShowCreate(false);
    fetchPosts();
    toast.success("Publicado! 🎉");
  };

  const toggleComments = (postId: string) => {
    setExpandedComments((prev) => {
      const next = new Set(prev);
      next.has(postId) ? next.delete(postId) : next.add(postId);
      return next;
    });
  };

  const handlePublishClick = () => {
    if (!isPro) { setShowUpgrade(true); return; }
    setShowCreate(true);
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-5 p-5">
      <div className="flex items-center justify-between pt-2">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">Comunidade</h1>
          <p className="text-sm text-muted-foreground">Conecte-se com outros atletas</p>
        </div>
        <button
          onClick={handlePublishClick}
          className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground transition-transform active:scale-[0.97]"
        >
          <Plus className="h-4 w-4" />
          Publicar
        </button>
      </div>

      {!isPro && (
        <div className="flex items-center gap-3 rounded-xl border border-border bg-secondary/50 p-4">
          <Lock className="h-5 w-5 text-muted-foreground" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">Modo visualização</p>
            <p className="text-xs text-muted-foreground">Atualize para PRO para publicar e interagir</p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {posts.length === 0 && (
          <p className="py-10 text-center text-sm text-muted-foreground">Nenhuma publicação ainda. Seja o primeiro!</p>
        )}
        {posts.map((post) => (
          <div key={post.id} className="animate-slide-up rounded-xl border border-border bg-card p-4">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                {(post.profile_nome || "A")[0].toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-foreground">{post.profile_nome}</p>
                <p className="text-xs text-muted-foreground">{timeAgo(post.created_at)}</p>
              </div>
              <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
                {typeLabels[post.tipo]}
              </span>
            </div>

            <p className="mb-3 text-sm leading-relaxed text-foreground">{post.conteudo}</p>

            <div className="flex items-center gap-4 border-t border-border pt-3">
              <button
                onClick={() => handleLike(post.id)}
                className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                  post.liked ? "text-destructive" : "text-muted-foreground"
                }`}
              >
                <Heart className="h-4 w-4" fill={post.liked ? "currentColor" : "none"} />
                {post.likes_count}
              </button>
              <button
                onClick={() => toggleComments(post.id)}
                className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors"
              >
                <MessageCircle className="h-4 w-4" />
                {post.comments.length}
              </button>
            </div>

            {expandedComments.has(post.id) && (
              <div className="mt-3 space-y-2 border-t border-border pt-3">
                {post.comments.map((c) => (
                  <div key={c.id} className="rounded-lg bg-muted p-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-foreground">{c.profile_nome}</span>
                      <span className="text-xs text-muted-foreground">{timeAgo(c.created_at)}</span>
                    </div>
                    <p className="mt-0.5 text-sm text-foreground">{c.texto}</p>
                  </div>
                ))}
                {isPro && (
                  <div className="flex gap-2">
                    <input
                      value={commentInputs[post.id] || ""}
                      onChange={(e) =>
                        setCommentInputs((prev) => ({ ...prev, [post.id]: e.target.value }))
                      }
                      onKeyDown={(e) => e.key === "Enter" && handleComment(post.id)}
                      placeholder="Escreva um comentário..."
                      className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                    <button
                      onClick={() => handleComment(post.id)}
                      className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="mx-4 max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle>Criar publicação</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              {(["livre", "progresso", "pergunta"] as PostType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setNewPostType(t);
                    if (t === "progresso") {
                      setNewPostContent("🔥 Treino concluído! Mais um dia de evolução.");
                    } else {
                      setNewPostContent("");
                    }
                  }}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                    newPostType === t
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  {typeLabels[t]}
                </button>
              ))}
            </div>
            <textarea
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              placeholder={
                newPostType === "pergunta"
                  ? "Qual é a sua dúvida?"
                  : "O que você quer compartilhar?"
              }
              rows={4}
              className="w-full resize-none rounded-xl border border-input bg-background p-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              onClick={handleCreatePost}
              disabled={!newPostContent.trim()}
              className="w-full rounded-xl bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground transition-transform active:scale-[0.98] disabled:opacity-50"
            >
              Publicar
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <UpgradeDialog
        open={showUpgrade}
        onOpenChange={setShowUpgrade}
        message="Compartilhe seu progresso e interaja com a comunidade. Atualize para PRO!"
      />
    </div>
  );
};

export default Comunidade;
