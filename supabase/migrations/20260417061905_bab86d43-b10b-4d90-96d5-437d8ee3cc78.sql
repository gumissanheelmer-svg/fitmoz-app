-- Enums
CREATE TYPE public.payment_status AS ENUM ('pendente', 'confirmado', 'rejeitado');
CREATE TYPE public.payment_source AS ENUM ('app', 'whatsapp', 'manual');

-- Payments table
CREATE TABLE public.payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  nome TEXT NOT NULL,
  telefone TEXT NOT NULL,
  plano public.app_plan NOT NULL,
  valor NUMERIC NOT NULL,
  metodo TEXT,
  comprovativo_url TEXT,
  referencia TEXT,
  status public.payment_status NOT NULL DEFAULT 'pendente',
  origem public.payment_source NOT NULL DEFAULT 'app',
  observacao TEXT,
  confirmed_by UUID,
  confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create their payments"
  ON public.payments FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can view their payments"
  ON public.payments FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage payments"
  ON public.payments FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Activation codes
CREATE TABLE public.activation_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo TEXT NOT NULL UNIQUE,
  plano public.app_plan NOT NULL,
  dias INTEGER NOT NULL DEFAULT 30,
  usado BOOLEAN NOT NULL DEFAULT false,
  used_by UUID,
  used_at TIMESTAMPTZ,
  payment_id UUID REFERENCES public.payments(id) ON DELETE SET NULL,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.activation_codes ENABLE ROW LEVEL SECURITY;

-- Admin full management
CREATE POLICY "Admins manage codes"
  ON public.activation_codes FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- Authenticated users can read a code to validate (will look up by codigo)
CREATE POLICY "Auth users can read codes"
  ON public.activation_codes FOR SELECT TO authenticated
  USING (true);

-- Authenticated users can mark a not-yet-used code as used by them
CREATE POLICY "Users can claim a code"
  ON public.activation_codes FOR UPDATE TO authenticated
  USING (usado = false)
  WITH CHECK (used_by = auth.uid() AND usado = true);

-- Storage bucket for comprovativos
INSERT INTO storage.buckets (id, name, public) VALUES ('comprovativos', 'comprovativos', true)
  ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Comprovativos publicly readable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'comprovativos');

CREATE POLICY "Authenticated can upload comprovativos"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'comprovativos' AND (auth.uid()::text = (storage.foldername(name))[1]));

CREATE POLICY "Admins manage comprovativos"
  ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'comprovativos' AND has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'comprovativos' AND has_role(auth.uid(), 'admin'));