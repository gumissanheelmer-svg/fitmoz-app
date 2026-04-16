import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("nome, plano, objetivo, nivel, dias_treinados, streak")
      .eq("user_id", user.id)
      .single();

    if (!profile) {
      return new Response(JSON.stringify({ error: "Perfil não encontrado" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Plan gating
    if (profile.plano !== "pro") {
      return new Response(
        JSON.stringify({ error: "plan_required", message: "🔒 O Coach AI está disponível apenas no plano PRO" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { messages } = await req.json();
    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "Mensagens inválidas" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const currentDay = profile.dias_treinados > 0 ? Math.min(profile.dias_treinados, 30) : 1;

    const systemPrompt = `Você é o Coach FitMoz, um treinador pessoal virtual inteligente e motivador.

PERSONALIDADE:
- Fale como um treinador pessoal real, direto e amigável
- Tom motivador e encorajador
- Linguagem simples, sem termos técnicos difíceis
- Sempre incentive ação
- Respostas CURTAS e práticas (máximo 3-4 frases)
- Use emojis com moderação (💪🔥✅)

CONTEXTO DO USUÁRIO:
- Nome: ${profile.nome || "Atleta"}
- Plano: ${profile.plano}
- Objetivo: ${profile.objetivo || "melhorar condição física"}
- Nível: ${profile.nivel || "iniciante"}
- Dia atual do desafio: ${currentDay}/30
- Dias treinados: ${profile.dias_treinados}
- Streak atual: ${profile.streak} dias

REGRAS:
- Sempre adaptar resposta ao nível do usuário
- Sempre incluir motivação na resposta
- Dar orientação clara e prática
- NUNCA recomendar algo perigoso
- Se a pergunta for médica, responda: "Recomendo consultar um profissional de saúde para essa questão 🏥"
- NÃO dê conselhos médicos
- Use o nome do usuário de vez em quando
- Foque em fitness, emagrecimento e motivação`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages.slice(-20), // Last 20 messages for context
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Muitas requisições. Tente novamente em alguns segundos." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos de IA esgotados." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Erro ao processar resposta" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("coach-ai error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
