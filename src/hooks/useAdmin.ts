import { useAuth } from "./useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

export const useAdmin = () => {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { setLoading(false); return; }
    supabase.rpc("has_role", { _user_id: user.id, _role: "admin" })
      .then(({ data }) => {
        setIsAdmin(!!data);
        setLoading(false);
      });
  }, [user, authLoading]);

  const logAction = async (action: string, details?: Record<string, unknown>) => {
    if (!user) return;
    await supabase.from("admin_logs").insert({ admin_id: user.id, action, details: details as any });
  };

  return { isAdmin, loading, logAction };
};
