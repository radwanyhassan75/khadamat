// File: index.js
// ✅ النسخة النهائية والمضمونة: كل شيء في ملف واحد لضمان عمل الخدمات
export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        const corsHeaders = {
            "Access-Control-Allow-Origin": "*", // للسماح بالاتصال من الواجهة الأمامية
            "Content-Type": "application/json"
        };

        // تحقق من أن الطلب هو لرابط الخدمات فقط
        if (url.pathname === '/api/services') {

            // تأكد من أن قاعدة البيانات متصلة
            if (!env.DB) {
                return new Response(JSON.stringify({ error: "Database not connected" }), { status: 500, headers: corsHeaders });
            }

            try {
                // اتصل بقاعدة البيانات وجلب الخدمات
                const { results } = await env.DB.prepare("SELECT * FROM services").all();

                // أرجع النتائج بنجاح
                return new Response(JSON.stringify(results), { status: 200, headers: corsHeaders });

            } catch (e) {
                // في حال فشل الاتصال، أرجع رسالة الخطأ
                return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders });
            }
        }

        // لأي رابط آخر، أرجع رسالة "غير موجود"
        return new Response(JSON.stringify({ error: "Not Found" }), { status: 404, headers: corsHeaders });
    }
};