// File: handlers/admin.js
// ✅ Backend for /api/admin/* with CORS

export async function handleAdmin(request, env) {
    const corsHeaders = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, HEAD, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    };

    // OPTIONS request (preflight) support
    if (request.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        // مثال: مجرد رد مؤقت للـ Admin API
        // لاحقًا يمكنك إضافة تسجيل الدخول أو إدارة الطلبات
        return new Response(JSON.stringify({
            message: "Admin API OK",
            routes: [
                "/api/admin/login",
                "/api/admin/users",
                "/api/admin/settings"
            ]
        }), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
        });

    } catch (error) {
        console.error("Error in Admin API:", error);
        return new Response(JSON.stringify({ error: "Failed to process admin request." }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
    }
}
