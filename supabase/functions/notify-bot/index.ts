import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { telefone, codigo, plano, nome } = await req.json();
    if (!telefone || !codigo || !plano) {
      return new Response(JSON.stringify({ error: "telefone, codigo e plano são obrigatórios" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const webhook = Deno.env.get("WHATSAPP_BOT_WEBHOOK_URL");
    const token = Deno.env.get("WHATSAPP_BOT_TOKEN");

    if (!webhook) {
      console.log("[notify-bot] WHATSAPP_BOT_WEBHOOK_URL not configured. Code generated:", codigo);
      return new Response(
        JSON.stringify({ ok: true, sent: false, reason: "webhook_not_configured", codigo }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const mensagem = `🎉 Pagamento confirmado!\n\nOlá ${nome || ""}, seu plano *${String(plano).toUpperCase()}* foi liberado.\n\n🔑 Código de ativação:\n*${codigo}*\n\nAbra o app FitMoz → Perfil → Ativar código e cole acima. Válido por 30 dias.`;

    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(webhook, {
      method: "POST",
      headers,
      body: JSON.stringify({ telefone, codigo, plano, nome, mensagem }),
    });

    const text = await res.text();
    console.log("[notify-bot] webhook response", res.status, text);

    return new Response(JSON.stringify({ ok: res.ok, status: res.status, response: text }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("[notify-bot] error", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
