// File: handlers/services.js
// ✅ نسخة معدلة مع تتبع مفصل لخطوات الاتصال بقاعدة البيانات

export async function handleServices(request, env) {
    console.log('[DEBUG] handleServices function started.');
    
    const corsHeaders = {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"
    };

    if (!env.DB) {
        console.error('[DEBUG] Database binding (env.DB) not found!');
        return new Response(JSON.stringify({ error: "Database not connected" }), { status: 500, headers: corsHeaders });
    }
    console.log('[DEBUG] Database binding found.');

    try {
        console.log('[DEBUG] Attempting to query the database for services...');
        const { results } = await env.DB.prepare("SELECT * FROM services").all();
        console.log('[DEBUG] Database query finished successfully.');

        if (!results) {
             console.warn('[DEBUG] Query returned no results.');
             return new Response(JSON.stringify({ error: "No services found" }), { status: 404, headers: corsHeaders });
        }
        
        console.log(`[DEBUG] Found ${results.length} services.`);
        return new Response(JSON.stringify(results), { status: 200, headers: corsHeaders });

    } catch (e) {
        console.error('[DEBUG] CRITICAL ERROR during database query:', e);
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders });
    }
}