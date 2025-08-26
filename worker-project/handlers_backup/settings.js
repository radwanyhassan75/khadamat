// File: handlers/settings.js

export async function handleSettings(request, env, ctx) {
    const corsHeaders = { "Access-Control-Allow-Origin": "*" };

    if (request.method === 'GET') {
        const { results } = await env.DB.prepare("SELECT * FROM settings").all();
        return new Response(JSON.stringify(results), { status: 200, headers: corsHeaders });
    } 
    
    else if (request.method === 'PUT') {
        const { key, value } = await request.json();
        if (!key || value === undefined) {
            return new Response(JSON.stringify({ error: "Key and value are required" }), { status: 400, headers: corsHeaders });
        }
        
        await env.DB.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)")
            .bind(key, value).run();
            
        return new Response(JSON.stringify({ message: "Setting updated successfully" }), { status: 200, headers: corsHeaders });
    }

    return new Response(JSON.stringify({ error: "Settings route not found or method not allowed" }), { status: 404, headers: corsHeaders });
}