
-- Add objetivo and nivel to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS objetivo text NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS nivel text NOT NULL DEFAULT 'iniciante';

-- Create chat_messages table
CREATE TABLE public.chat_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own messages"
ON public.chat_messages FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own messages"
ON public.chat_messages FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own messages"
ON public.chat_messages FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE INDEX idx_chat_messages_user_id ON public.chat_messages (user_id, created_at);
