import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface UpgradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  message?: string;
}

const UpgradeDialog = ({ open, onOpenChange, message }: UpgradeDialogProps) => {
  const navigate = useNavigate();

  const handleUpgrade = () => {
    onOpenChange(false);
    navigate("/pagamento");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="mx-4 max-w-sm rounded-2xl">
        <DialogHeader className="items-center text-center">
          <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-secondary">
            <Lock className="h-7 w-7 text-primary" />
          </div>
          <DialogTitle className="text-xl">Disponível no plano PRO</DialogTitle>
          <DialogDescription className="text-sm">
            {message || "Compartilhe seu progresso e interaja com a comunidade."}
          </DialogDescription>
        </DialogHeader>
        <button
          onClick={handleUpgrade}
          className="mt-2 w-full rounded-xl bg-primary px-6 py-4 text-base font-bold text-primary-foreground transition-transform active:scale-[0.98]"
        >
          Atualizar para PRO — 147 MZN
        </button>
      </DialogContent>
    </Dialog>
  );
};

export default UpgradeDialog;
