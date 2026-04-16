import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type Recipe = {
  id: string;
  nome: string;
  categoria: "sopa_detox" | "cha" | "refeicao_leve" | "salada" | "suco";
  objetivo: string;
  ingredientes: string[];
  modo_preparo: string[];
  quando_consumir: string;
  beneficios: string;
  min_plan: "plus" | "pro";
  emoji: string;
};

export type Exercise = { nome: string; reps?: string; tempo?: string };
export type Workout = {
  id: string;
  nome: string;
  nivel: string;
  duracao_min: number;
  foco: "barriga" | "gluteo" | "pernas" | "corpo_todo" | "cardio";
  series: number;
  exercicios: Exercise[];
  min_plan: "plus" | "pro";
  emoji: string;
};

export type WeeklyPlan = {
  id: string;
  nome: string;
  descricao: string;
  nivel: string;
  min_plan: "plus" | "pro";
  dias: Array<{
    dia: number;
    titulo: string;
    treino: string;
    receita_manha: string;
    receita_almoco: string;
    receita_jantar: string;
    dica: string;
  }>;
};

export const useRecipes = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    supabase.from("recipes").select("*").order("created_at").then(({ data }) => {
      setRecipes((data as Recipe[]) || []);
      setLoading(false);
    });
  }, []);
  return { recipes, loading };
};

export const useWorkouts = () => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    supabase.from("workouts").select("*").order("created_at").then(({ data }) => {
      setWorkouts((data as unknown as Workout[]) || []);
      setLoading(false);
    });
  }, []);
  return { workouts, loading };
};

export const useWeeklyPlans = () => {
  const [plans, setPlans] = useState<WeeklyPlan[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    supabase.from("weekly_plans").select("*").order("created_at").then(({ data }) => {
      setPlans((data as unknown as WeeklyPlan[]) || []);
      setLoading(false);
    });
  }, []);
  return { plans, loading };
};

export const useTips = () => {
  const [tips, setTips] = useState<{ id: string; texto: string; emoji: string }[]>([]);
  useEffect(() => {
    supabase.from("motivational_tips").select("*").then(({ data }) => {
      setTips(data || []);
    });
  }, []);
  return tips;
};
