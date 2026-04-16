import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export type Plan = "plus" | "pro";
export type PlanStatus = "ativo" | "teste" | "expirado" | "pendente" | "rejeitado";

export const usePlan = () => {
  const { user } = useAuth();
  const [plan, setPlanState] = useState<Plan>("plus");
  const [status, setStatus] = useState<PlanStatus>("teste");
  const [expiresAt, setExpiresAt] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("profiles")
      .select("plano, status, expira_em")
      .eq("user_id", user.id)
      .single();

    if (data) {
      setPlanState(data.plano);
      setStatus(data.status);
      setExpiresAt(data.expira_em ? new Date(data.expira_em).toLocaleDateString("pt-BR") : "");
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const setPlan = useCallback(async (p: Plan) => {
    if (!user) return;
    await supabase
      .from("profiles")
      .update({ plano: p, status: "ativo" as const })
      .eq("user_id", user.id);
    setPlanState(p);
    setStatus("ativo");
  }, [user]);

  const isPro = plan === "pro";

  return { plan, setPlan, isPro, status, expiresAt, loading };
};
