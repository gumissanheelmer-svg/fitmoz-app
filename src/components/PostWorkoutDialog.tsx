import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Flame } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePlan } from "@/hooks/usePlan";
import { useState } from "react";
import UpgradeDialog from "./UpgradeDialog";

interface PostWorkoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PostWorkoutDialog = ({ open, onOpenChange }: PostWorkoutDialogProps) => {
  const navigate = useNavigate();
  const { isPro } = usePlan();
  const [showUpgrade, setShowUpgrade] = useState(false);

  const handleShare = () => {
    onOpenChange(false);
    if (isPro) {
      navigate("/comunidade");
    } else {
      setShowUpgrade(true);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="mx-4 max-w-sm rounded-2xl">
          <DialogHeader className="items-center text-center">
            <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
              <Flame className="h-8 w-8 text-primary" />
            </div>
            <DialogTitle className="text-xl">🔥 UAU! Você completou seu treino!</DialogTitle>
            <DialogDescription>
              Compartilhe com a comunidade e inspire outros usuários.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-2 flex flex-col gap-3">
            <button
              onClick={handleShare}
              className="w-full rounded-xl bg-primary px-6 py-4 text-base font-bold text-primary-foreground transition-transform active:scale-[0.98]"
            >
              Compartilhar agora
            </button>
            <button
              onClick={() => onOpenChange(false)}
              className="w-full rounded-xl bg-secondary px-6 py-3.5 text-sm font-semibold text-secondary-foreground transition-colors"
            >
              Depois
            </button>
          </div>
        </DialogContent>
      </Dialog>
      <UpgradeDialog open={showUpgrade} onOpenChange={setShowUpgrade} />
    </>
  );
};

export default PostWorkoutDialog;
