import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import fitmozLogo from "@/assets/fitmoz-logo.png";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nome, setNome] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Bem-vindo de volta! 💪");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { nome },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        toast.success("Conta criada! Verifique seu e-mail para confirmar.");
      }
    } catch (err: any) {
      toast.error(err.message || "Erro ao processar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
      <div className="mb-8 flex flex-col items-center gap-2">
        <img
          src={fitmozLogo}
          alt="FitMoz — Seu app de treinos"
          className="h-32 w-32 object-contain"
        />
        <p className="text-sm text-muted-foreground">
          {isLogin ? "Entre na sua conta" : "Crie sua conta gratuita"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        {!isLogin && (
          <div className="relative">
            <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Seu nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required={!isLogin}
              className="w-full rounded-xl border border-input bg-background py-3.5 pl-11 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        )}

        <div className="relative">
          <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-xl border border-input bg-background py-3.5 pl-11 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="relative">
          <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full rounded-xl border border-input bg-background py-3.5 pl-11 pr-11 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-primary py-3.5 text-sm font-bold text-primary-foreground transition-transform active:scale-[0.98] disabled:opacity-50"
        >
          {loading ? "Processando..." : isLogin ? "Entrar" : "Criar Conta"}
        </button>
      </form>

      <button
        onClick={() => setIsLogin(!isLogin)}
        className="mt-6 text-sm text-muted-foreground"
      >
        {isLogin ? (
          <>Não tem conta? <span className="font-semibold text-primary">Criar conta</span></>
        ) : (
          <>Já tem conta? <span className="font-semibold text-primary">Entrar</span></>
        )}
      </button>
    </div>
  );
};

export default Auth;
