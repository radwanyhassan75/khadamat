// =================================================================
//  الملف الرئيسي (index.js) - Main Entry Point
// This file acts as a router, delegating requests to specialized handlers.
// =================================================================

import { handleEmails } from './emails/emails.js';
import { handleUsers } from './handlers/users.js';
import { handleOrders } from './handlers/orders.js';
import { handleServices } from './handlers/services.js';
import { handleSettings } from './handlers/settings.js';
import { handleAdmin } from './handlers/admin.js';
import { handlePosts } from './handlers/posts.js';
import { handleTickets } from './handlers/tickets.js';
import { handleSubscribe } from './handlers/subscribe.js'; // ✅ 1. تم إضافة هذا السطر

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        const { pathname } = url;
        const corsHeaders = {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
        };

        if (request.method === "OPTIONS") {
            return new Response(null, { headers: corsHeaders });
        }

        try {
            // --- The Router (المنظم) ---
            // يقوم بتوجيه كل طلب إلى الملف المختص به
            
            if (pathname === '/api/send-verification-email') {
                return handleEmails(request, env, ctx);
            }
            
            // ✅ 2. تم إضافة هذا الشرط لتفعيل مسار الاشتراك
            if (pathname === '/api/subscribe') {
                return handleSubscribe(request, env, ctx);
            }

            if (pathname.startsWith('/api/tickets') || pathname.startsWith('/tickets')) {
                return handleTickets(request, env, ctx);
            }
            if (pathname.startsWith('/api/orders') || pathname.startsWith('/orders')) {
                return handleOrders(request, env, ctx);
            }
            if (pathname.startsWith('/api/users') || pathname.startsWith('/users')) {
                return handleUsers(request, env, ctx);
            }
            if (pathname.startsWith('/api/services') || pathname.startsWith('/services')) {
                return handleServices(request, env, ctx);
            }
            if (pathname.startsWith('/api/posts')) {
                return handlePosts(request, env, ctx);
            }
            if (pathname.startsWith('/api/settings') || pathname.startsWith('/settings')) {
                return handleSettings(request, env, ctx);
            }
            if (pathname.startsWith('/api/admin/')) {
                return handleAdmin(request, env, ctx);
            }

            // إذا لم يتطابق أي مسار
            return new Response(JSON.stringify({ error: "Route not found" }), { status: 404, headers: corsHeaders });

        } catch (error) {
            console.error('Critical Error in Worker:', error.message, error.stack);
            return new Response(JSON.stringify({ error: "Internal Server Error: " + error.message }), { status: 500, headers: corsHeaders });
        }
    },
};