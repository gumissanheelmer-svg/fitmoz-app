import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-bot-token",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface Body {
  nome?: string;
  telefone?: string;
  plano?: "plus" | "pro";
  valor?: number;
  metodo?: string;
  referencia?: string;
  comprovativo_url?: string;
  observacao?: string;
}

const PLAN_PRICE: Record<"plus" | "pro", number> = { plus: 97, pro: 147 };

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    // Auth: bot must send the shared token
    const expected = Deno.env.get("WHATSAPP_BOT_TOKEN");
    if (!expected) {
      return new Response(JSON.stringify({ error: "Server not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const provided =
      req.headers.get("x-bot-token") ??
      req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ??
      "";
    if (provided !== expected) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = (await req.json()) as Body;
    const nome = (body.nome ?? "").trim();
    const telefone = (body.telefone ?? "").trim();
    const plano = body.plano;

    if (!nome || nome.length > 100) {
      return new Response(JSON.stringify({ error: "nome inválido (1-100)" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!telefone || telefone.length > 20 || !/^[0-9+\s-]+$/.test(telefone)) {
      return new Response(JSON.stringify({ error: "telefone inválido" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (plano !== "plus" && plano !== "pro") {
      return new Response(JSON.stringify({ error: "plano deve ser plus ou pro" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const valor = Number(body.valor) > 0 ? Number(body.valor) : PLAN_PRICE[plano];
    const metodo = (body.metodo ?? "WhatsApp").slice(0, 50);
    const referencia = body.referencia?.slice(0, 100) ?? null;
    const comprovativo_url = body.comprovativo_url?.slice(0, 500) ?? null;
    const observacao = body.observacao?.slice(0, 500) ?? null;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data, error } = await supabase
      .from("payments")
      .insert({
        nome,
        telefone,
        plano,
        valor,
        metodo,
        referencia,
        comprovativo_url,
        observacao,
        origem: "whatsapp",
        status: "pendente",
      })
      .select("id, status, plano, valor, created_at")
      .single();

    if (error) {
      console.error("[bot-create-payment] insert error", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("[bot-create-payment] payment created", data.id);

    return new Response(JSON.stringify({ ok: true, payment: data }), {
      status: 201,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("[bot-create-payment] error", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
