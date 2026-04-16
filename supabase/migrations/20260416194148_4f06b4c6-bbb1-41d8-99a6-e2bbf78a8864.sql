
-- Categories enums
CREATE TYPE public.recipe_category AS ENUM ('sopa_detox', 'cha', 'refeicao_leve', 'salada', 'suco');
CREATE TYPE public.workout_focus AS ENUM ('barriga', 'gluteo', 'pernas', 'corpo_todo', 'cardio');

-- Recipes
CREATE TABLE public.recipes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  categoria recipe_category NOT NULL,
  objetivo TEXT NOT NULL,
  ingredientes TEXT[] NOT NULL DEFAULT '{}',
  modo_preparo TEXT[] NOT NULL DEFAULT '{}',
  quando_consumir TEXT NOT NULL,
  beneficios TEXT NOT NULL,
  min_plan app_plan NOT NULL DEFAULT 'plus',
  emoji TEXT NOT NULL DEFAULT '🥗',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Recipes are viewable by everyone" ON public.recipes FOR SELECT USING (true);
CREATE POLICY "Only admins can manage recipes" ON public.recipes FOR ALL USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Workouts
CREATE TABLE public.workouts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  nivel TEXT NOT NULL DEFAULT 'iniciante',
  duracao_min INT NOT NULL,
  foco workout_focus NOT NULL,
  series INT NOT NULL DEFAULT 3,
  exercicios JSONB NOT NULL DEFAULT '[]'::jsonb,
  min_plan app_plan NOT NULL DEFAULT 'plus',
  emoji TEXT NOT NULL DEFAULT '💪',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Workouts are viewable by everyone" ON public.workouts FOR SELECT USING (true);
CREATE POLICY "Only admins can manage workouts" ON public.workouts FOR ALL USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Weekly plans
CREATE TABLE public.weekly_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT NOT NULL,
  nivel TEXT NOT NULL DEFAULT 'iniciante',
  min_plan app_plan NOT NULL DEFAULT 'plus',
  dias JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.weekly_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Plans are viewable by everyone" ON public.weekly_plans FOR SELECT USING (true);
CREATE POLICY "Only admins can manage plans" ON public.weekly_plans FOR ALL USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Motivational tips
CREATE TABLE public.motivational_tips (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  texto TEXT NOT NULL,
  emoji TEXT NOT NULL DEFAULT '🔥',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.motivational_tips ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tips are viewable by everyone" ON public.motivational_tips FOR SELECT USING (true);
CREATE POLICY "Only admins can manage tips" ON public.motivational_tips FOR ALL USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
