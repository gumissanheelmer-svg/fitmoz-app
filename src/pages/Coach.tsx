import { useState, useRef, useEffect } from "react";
import { Send, Bot, Dumbbell, UtensilsCrossed, Sparkles, Lock } from "lucide-react";
import { usePlan } from "@/hooks/usePlan";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import UpgradeDialog from "@/components/UpgradeDialog";
import ReactMarkdown from "react-markdown";

type Msg = { role: "user" | "assistant"; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/coach-ai`;

const quickActions = [
  { label: "Treino de hoje", icon: Dumbbell, message: "Qual treino devo fazer hoje?" },
  { label: "O que comer", icon: UtensilsCrossed, message: "O que devo comer para emagrecer?" },
  { label: "Motivação", icon: Sparkles, message: "Estou sem motivação hoje" },
];

const CoachPage = () => {
  const { isPro, loading: planLoading } = usePlan();
  const { profile } = useProfile();
  const { session } = useAuth();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    if (!isPro) {
      setShowUpgrade(true);
      return;
    }

    const userMsg: Msg = { role: "user", content: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    let assistantSoFar = "";

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({ messages: [...messages, userMsg] }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        if (err.error === "plan_required") {
          setShowUpgrade(true);
          setMessages((prev) => prev.slice(0, -1));
          setIsLoading(false);
          return;
        }
        throw new Error(err.error || "Erro ao enviar mensagem");
      }

      const reader = resp.body!.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantSoFar += content;
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant") {
                  return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
                }
                return [...prev, { role: "assistant", content: assistantSoFar }];
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }
    } catch (e) {
      console.error(e);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Desculpe, tive um problema. Tente novamente 😅" },
      ]);
    }

    setIsLoading(false);
  };

  if (planLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border bg-card px-4 py-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
          <Bot className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-foreground">Coach FitMoz</h1>
          <p className="text-xs text-muted-foreground">
            {isPro ? "Online • Pronto para ajudar" : "🔒 Disponível no plano PRO"}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full space-y-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Bot className="h-8 w-8 text-primary" />
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">
                Olá{profile?.nome ? `, ${profile.nome}` : ""}! 👋
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Sou seu coach de fitness. Como posso ajudar?
              </p>
            </div>

            {!isPro ? (
              <button
                onClick={() => setShowUpgrade(true)}
                className="flex items-center gap-2 rounded-xl bg-primary/10 px-6 py-3 text-sm font-medium text-primary"
              >
                <Lock className="h-4 w-4" />
                Desbloquear Coach AI - Plano PRO
              </button>
            ) : (
              <div className="flex flex-wrap justify-center gap-2">
                {quickActions.map(({ label, icon: Icon, message }) => (
                  <button
                    key={label}
                    onClick={() => sendMessage(message)}
                    className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-xs font-medium text-foreground transition-colors hover:bg-muted"
                  >
                    <Icon className="h-3.5 w-3.5 text-primary" />
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground rounded-br-md"
                  : "bg-secondary text-foreground rounded-bl-md"
              }`}
            >
              {msg.role === "assistant" ? (
                <div className="prose prose-sm max-w-none dark:prose-invert [&>p]:m-0">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              ) : (
                msg.content
              )}
            </div>
          </div>
        ))}

        {isLoading && messages[messages.length - 1]?.role === "user" && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-md bg-secondary px-4 py-3">
              <div className="flex gap-1">
                <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50" style={{ animationDelay: "0ms" }} />
                <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50" style={{ animationDelay: "150ms" }} />
                <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions (when messages exist) */}
      {isPro && messages.length > 0 && !isLoading && (
        <div className="flex gap-2 overflow-x-auto px-4 pb-2">
          {quickActions.map(({ label, icon: Icon, message }) => (
            <button
              key={label}
              onClick={() => sendMessage(message)}
              className="flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
            >
              <Icon className="h-3 w-3 text-primary" />
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="border-t border-border bg-card p-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(input);
          }}
          className="flex items-center gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isPro ? "Pergunte ao coach..." : "🔒 Disponível no plano PRO"}
            disabled={!isPro || isLoading}
            className="flex-1 rounded-full border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading || !isPro}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>

      <UpgradeDialog
        open={showUpgrade}
        onOpenChange={setShowUpgrade}
        message="O Coach AI é exclusivo para assinantes do plano PRO. Tenha acesso a um treinador virtual personalizado 24/7."
      />
    </div>
  );
};

export default CoachPage;
