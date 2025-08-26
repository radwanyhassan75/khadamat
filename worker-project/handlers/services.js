// File: handlers/services.js
// ✅ النسخة النهائية والنظيفة لمعالج الخدمات
export async function handleServices(request, env) {
    const corsHeaders = {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"
    };
    try {
        const { results } = await env.DB.prepare("SELECT * FROM services").all();
        return new Response(JSON.stringify(results), { status: 200, headers: corsHeaders });
    } catch (e) {
        console.error("Error in handleServices:", e);
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders });
    }
}