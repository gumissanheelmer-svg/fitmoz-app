import { useState } from "react";
import { Heart, MessageCircle, Plus, Send, Lock } from "lucide-react";
import { usePlan } from "@/hooks/usePlan";
import UpgradeDialog from "@/components/UpgradeDialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type PostType = "livre" | "progresso" | "pergunta";

interface Comment {
  id: number;
  user: string;
  text: string;
  time: string;
}

interface Post {
  id: number;
  user: string;
  avatar: string;
  time: string;
  content: string;
  type: PostType;
  likes: number;
  liked: boolean;
  comments: Comment[];
}

const initialPosts: Post[] = [
  {
    id: 1, user: "Maria F.", avatar: "M", time: "há 2h",
    content: "Acabei de completar o Dia 5 do desafio! 🔥 450 calorias queimadas. Nunca me senti tão bem!",
    type: "progresso", likes: 12, liked: false,
    comments: [
      { id: 1, user: "João P.", text: "Parabéns! Continue assim 💪", time: "há 1h" },
    ],
  },
  {
    id: 2, user: "Carlos A.", avatar: "C", time: "há 5h",
    content: "Qual o melhor treino para perder barriga em casa? Estou no nível iniciante.",
    type: "pergunta", likes: 8, liked: false,
    comments: [
      { id: 2, user: "Ana R.", text: "HIIT funciona muito bem! Comecei com 15 min/dia.", time: "há 3h" },
    ],
  },
  {
    id: 3, user: "Luísa M.", avatar: "L", time: "há 1d",
    content: "Dia 10 concluído ✅ Já consigo ver diferença no espelho! A consistência é tudo.",
    type: "progresso", likes: 24, liked: false, comments: [],
  },
];

const typeLabels: Record<PostType, string> = {
  livre: "Post",
  progresso: "📊 Progresso",
  pergunta: "❓ Pergunta",
};

const Comunidade = () => {
  const { isPro } = usePlan();
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [showCreate, setShowCreate] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [newPostType, setNewPostType] = useState<PostType>("livre");
  const [newPostContent, setNewPostContent] = useState("");
  const [commentInputs, setCommentInputs] = useState<Record<number, string>>({});
  const [expandedComments, setExpandedComments] = useState<Set<number>>(new Set());

  const handleLike = (postId: number) => {
    if (!isPro) { setShowUpgrade(true); return; }
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 }
          : p
      )
    );
  };

  const handleComment = (postId: number) => {
    if (!isPro) { setShowUpgrade(true); return; }
    const text = commentInputs[postId]?.trim();
    if (!text) return;
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              comments: [
                ...p.comments,
                { id: Date.now(), user: "Você", text, time: "agora" },
              ],
            }
          : p
      )
    );
    setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
  };

  const handleCreatePost = () => {
    if (!newPostContent.trim()) return;
    const post: Post = {
      id: Date.now(),
      user: "Atleta FitMoz",
      avatar: "A",
      time: "agora",
      content: newPostContent,
      type: newPostType,
      likes: 0,
      liked: false,
      comments: [],
    };
    setPosts((prev) => [post, ...prev]);
    setNewPostContent("");
    setNewPostType("livre");
    setShowCreate(false);
  };

  const toggleComments = (postId: number) => {
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

      {/* Feed */}
      <div className="space-y-4">
        {posts.map((post) => (
          <div key={post.id} className="animate-slide-up rounded-xl border border-border bg-card p-4">
            {/* Header */}
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                {post.avatar}
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-foreground">{post.user}</p>
                <p className="text-xs text-muted-foreground">{post.time}</p>
              </div>
              <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
                {typeLabels[post.type]}
              </span>
            </div>

            {/* Content */}
            <p className="mb-3 text-sm leading-relaxed text-foreground">{post.content}</p>

            {/* Actions */}
            <div className="flex items-center gap-4 border-t border-border pt-3">
              <button
                onClick={() => handleLike(post.id)}
                className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                  post.liked ? "text-destructive" : "text-muted-foreground"
                }`}
              >
                <Heart className="h-4 w-4" fill={post.liked ? "currentColor" : "none"} />
                {post.likes}
              </button>
              <button
                onClick={() => toggleComments(post.id)}
                className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors"
              >
                <MessageCircle className="h-4 w-4" />
                {post.comments.length}
              </button>
            </div>

            {/* Comments */}
            {expandedComments.has(post.id) && (
              <div className="mt-3 space-y-2 border-t border-border pt-3">
                {post.comments.map((c) => (
                  <div key={c.id} className="rounded-lg bg-muted p-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-foreground">{c.user}</span>
                      <span className="text-xs text-muted-foreground">{c.time}</span>
                    </div>
                    <p className="mt-0.5 text-sm text-foreground">{c.text}</p>
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

      {/* Create Post Dialog */}
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
                      setNewPostContent("🔥 Dia 3/30 concluído! 450 calorias queimadas hoje.");
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
