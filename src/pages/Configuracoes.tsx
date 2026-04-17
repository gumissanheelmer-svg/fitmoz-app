import { ArrowLeft, Bell, Moon, Globe, Volume2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

type Settings = {
  notifications: boolean;
  darkMode: boolean;
  sounds: boolean;
  language: "pt" | "en";
};

const DEFAULTS: Settings = {
  notifications: true,
  darkMode: false,
  sounds: true,
  language: "pt",
};

const STORAGE_KEY = "fitmoz:settings";

const Configuracoes = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<Settings>(DEFAULTS);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        setSettings({ ...DEFAULTS, ...JSON.parse(raw) });
      } catch {
        // ignore
      }
    }
  }, []);

  const update = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    const next = { ...settings, [key]: value };
    setSettings(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));

    if (key === "darkMode") {
      document.documentElement.classList.toggle("dark", value as boolean);
    }
    toast.success("Preferência salva");
  };

  useEffect(() => {
    document.documentElement.classList.toggle("dark", settings.darkMode);
  }, [settings.darkMode]);

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
        <h1 className="text-2xl font-extrabold text-foreground">Configurações</h1>
      </div>

      <section className="rounded-xl border border-border bg-card">
        <Row
          icon={<Bell className="h-5 w-5 text-primary" />}
          title="Notificações"
          desc="Receber lembretes de treino e dicas"
        >
          <Switch
            checked={settings.notifications}
            onCheckedChange={(v) => update("notifications", v)}
          />
        </Row>
        <Divider />
        <Row
          icon={<Moon className="h-5 w-5 text-primary" />}
          title="Modo escuro"
          desc="Tema escuro para a interface"
        >
          <Switch
            checked={settings.darkMode}
            onCheckedChange={(v) => update("darkMode", v)}
          />
        </Row>
        <Divider />
        <Row
          icon={<Volume2 className="h-5 w-5 text-primary" />}
          title="Sons"
          desc="Efeitos sonoros do app"
        >
          <Switch
            checked={settings.sounds}
            onCheckedChange={(v) => update("sounds", v)}
          />
        </Row>
        <Divider />
        <Row
          icon={<Globe className="h-5 w-5 text-primary" />}
          title="Idioma"
          desc="Idioma de exibição"
        >
          <select
            value={settings.language}
            onChange={(e) => update("language", e.target.value as Settings["language"])}
            className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-medium"
          >
            <option value="pt">Português</option>
            <option value="en">English</option>
          </select>
        </Row>
      </section>

      <p className="text-center text-xs text-muted-foreground">
        Versão 1.0.0 · FitMoz
      </p>
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

export default Configuracoes;
