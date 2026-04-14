import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export const useProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<{
    nome: string;
    email: string | null;
    dias_treinados: number;
    streak: number;
    avatar_url: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("nome, email, dias_treinados, streak, avatar_url")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        setProfile(data);
        setLoading(false);
      });
  }, [user]);

  return { profile, loading };
};
