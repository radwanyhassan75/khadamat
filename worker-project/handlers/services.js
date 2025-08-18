// File: handlers/services.js

// نستورد وظيفة إنشاء الروابط من ملف الأدوات المساعدة
import { generateSlug } from '../utils/slug.js';

export async function handleServices(request, env, ctx) {
    const url = new URL(request.url);
    const { pathname } = url;
    const corsHeaders = { "Access-Control-Allow-Origin": "*" };

    const isAdminRoute = pathname.includes('/admin/');
    const pathParts = pathname.split('/').filter(Boolean);
    
    // طرق مختلفة لتحديد الخدمة المطلوبة
    const slug = pathname.includes('/slug/') ? decodeURIComponent(pathParts[pathParts.length - 1]) : null;
    const serviceId = pathParts.find(p => p.startsWith('serv_'));

    if (request.method === 'GET') {
        if (slug) { // جلب خدمة عن طريق الرابط (slug)
            const service = await env.DB.prepare("SELECT * FROM services WHERE slug = ? AND status = 'available'").bind(slug).first();
            if (!service) return new Response(JSON.stringify({ error: 'Service not found' }), { status: 404, headers: corsHeaders });
            return new Response(JSON.stringify(service), { status: 200, headers: corsHeaders });
        
        } else if (serviceId) { // جلب خدمة عن طريق الـ ID
            const service = await env.DB.prepare("SELECT * FROM services WHERE id = ?").bind(serviceId).first();
            if (!service) return new Response(JSON.stringify({ error: 'Service not found' }), { status: 404, headers: corsHeaders });
            return new Response(JSON.stringify(service), { status: 200, headers: corsHeaders });
        
        } else { // جلب كل الخدمات
            // إذا كان المسار يحتوي على 'admin'، نعرض كل الخدمات، وإلا نعرض الخدمات المتاحة فقط
            const query = isAdminRoute 
                ? "SELECT * FROM services ORDER BY created_at DESC" 
                : "SELECT * FROM services WHERE status = 'available' ORDER BY category, created_at DESC";
            const { results } = await env.DB.prepare(query).all();
            return new Response(JSON.stringify(results), { status: 200, headers: corsHeaders });
        }
    } 
    
    else if (request.method === 'POST') {
        const service = await request.json();
        const newId = `serv_${Date.now()}`;
        const newSlug = generateSlug(service.title);
        
        await env.DB.prepare(
            "INSERT INTO services (id, title, description, price, image_url, status, category, long_description, slug, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
        ).bind(
            newId, 
            service.title, 
            service.description, 
            service.price, 
            service.image_url, 
            service.status, 
            service.category, 
            service.long_description, 
            newSlug, 
            new Date().toISOString()
        ).run();
        
        return new Response(JSON.stringify({ id: newId }), { status: 201, headers: corsHeaders });
    } 
    
    else if (request.method === 'PUT' && serviceId) {
        const service = await request.json();
        const newSlug = generateSlug(service.title);
        
        await env.DB.prepare(
            "UPDATE services SET title = ?, description = ?, price = ?, image_url = ?, status = ?, category = ?, long_description = ?, slug = ? WHERE id = ?"
        ).bind(
            service.title, 
            service.description, 
            service.price, 
            service.image_url, 
            service.status, 
            service.category, 
            service.long_description, 
            newSlug, 
            serviceId
        ).run();
        
        return new Response(JSON.stringify({ id: serviceId }), { status: 200, headers: corsHeaders });
    } 
    
    else if (request.method === 'DELETE' && serviceId) {
        await env.DB.prepare("DELETE FROM services WHERE id = ?").bind(serviceId).run();
        return new Response(null, { status: 204, headers: corsHeaders });
    }

    return new Response(JSON.stringify({ error: "Service route not found" }), { status: 404, headers: corsHeaders });
}