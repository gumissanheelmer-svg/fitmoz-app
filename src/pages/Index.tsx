import { Play, Users, Flame, Trophy, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { usePlan } from "@/hooks/usePlan";
import { useProfile } from "@/hooks/useProfile";
import { useState } from "react";
import UpgradeDialog from "@/components/UpgradeDialog";

const HomePage = () => {
  const navigate = useNavigate();
  const { isPro } = usePlan();
  const { profile, loading } = useProfile();
  const [showUpgrade, setShowUpgrade] = useState(false);

  const diasTreinados = profile?.dias_treinados ?? 0;
  const streak = profile?.streak ?? 0;
  const nome = profile?.nome || "Atleta";
  const currentDay = diasTreinados > 0 ? Math.min(diasTreinados, 30) : 1;
  const totalDays = 30;
  const progress = (currentDay / totalDays) * 100;

  const handleShare = () => {
    if (isPro) {
      navigate("/comunidade");
    } else {
      setShowUpgrade(true);
    }
  };

  return (
    <div className="animate-fade-in space-y-6 p-5">
      {/* Header */}
      <div className="pt-2">
        <p className="text-sm font-medium text-muted-foreground">
          Olá, {loading ? "..." : nome} 💪
        </p>
        <h1 className="text-2xl font-extrabold text-foreground">FitMoz</h1>
      </div>

      {/* Progress Card */}
      <div className="fitness-gradient animate-slide-up rounded-2xl p-6 text-primary-foreground">
        <div className="mb-1 flex items-center gap-2">
          <Flame className="h-5 w-5" />
          <span className="text-sm font-semibold opacity-90">Desafio 30 Dias</span>
        </div>
        <p className="mb-4 text-3xl font-extrabold">
          Dia {currentDay}
          <span className="text-lg font-semibold opacity-80">/{totalDays}</span>
        </p>
        <Progress value={progress} className="h-2.5 bg-primary-foreground/20 [&>div]:bg-primary-foreground" />
        <p className="mt-2 text-xs font-medium opacity-80">{Math.round(progress)}% completo</p>
      </div>

      {/* Start Workout Button */}
      <button
        onClick={() => navigate("/treinos")}
        className="flex w-full items-center justify-center gap-3 rounded-2xl bg-primary px-6 py-5 text-lg font-bold text-primary-foreground shadow-lg transition-transform active:scale-[0.98]"
      >
        <Play className="h-6 w-6" fill="currentColor" />
        COMEÇAR TREINO
      </button>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: Flame, label: "Calorias", value: String(diasTreinados * 150) },
          { icon: Trophy, label: "Streak", value: `${streak} dias` },
          { icon: Zap, label: "Treinos", value: String(diasTreinados) },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="animate-slide-up rounded-xl bg-secondary p-4 text-center">
            <Icon className="mx-auto mb-1 h-5 w-5 text-primary" />
            <p className="text-lg font-bold text-foreground">{value}</p>
            <p className="text-xs font-medium text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      {/* Share Card */}
      <button
        onClick={handleShare}
        className="flex w-full items-center gap-4 rounded-xl border border-border bg-card p-4 text-left transition-colors hover:bg-muted"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
          <Users className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="font-bold text-foreground">Compartilhar com a comunidade</p>
          <p className="text-sm text-muted-foreground">Mostre sua evolução aos amigos</p>
        </div>
      </button>

      <UpgradeDialog
        open={showUpgrade}
        onOpenChange={setShowUpgrade}
        message="Compartilhe seu progresso e interaja com a comunidade."
      />
    </div>
  );
};

export default HomePage;
