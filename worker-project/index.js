// File: index.js

import { handleEmails } from './emails/emails.js';
import { handleUsers } from './handlers/users.js';
import { handleOrders } from './handlers/orders.js';
import { handleServices } from './handlers/services.js';
import { handleSettings } from './handlers/settings.js';
import { handleAdmin } from './handlers/admin.js';
import { handlePosts } from './handlers/posts.js';
import { handleTickets } from './handlers/tickets.js';
import { handleSubscribe } from './handlers/subscribe.js';
import { handleReviews } from './handlers/reviews.js';

// --- دالة مساعدة مركزية لإضافة تصاريح CORS ---
function withCors(response) {
    const corsHeaders = {
        "Access-Control-Allow-Origin": "*", // يمكنك تغييره إلى نطاق موقعك فقط لمزيد من الأمان
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };
    
    // تأكد من أن الرد هو كائن Response صالح
    if (!(response instanceof Response)) {
        response = new Response("Internal error", { status: 500 });
    }

    // أضف التصاريح إلى الرد
    Object.entries(corsHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
    });

    return response;
}

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        const { pathname } = url;

        // تعامل مع طلبات OPTIONS أولاً (مهم جداً لـ CORS)
        if (request.method === "OPTIONS") {
            return withCors(new Response(null, { status: 204 }));
        }

        let response;
        try {
            // --- The Router ---
            if (pathname === '/api/send-verification-email') {
                response = await handleEmails(request, env, ctx);
            } else if (pathname === '/api/subscribe') {
                response = await handleSubscribe(request, env, ctx);
            } else if (pathname.startsWith('/api/reviews')) {
                response = await handleReviews(request, env, ctx);
            } else if (pathname.startsWith('/api/tickets') || pathname.startsWith('/tickets')) {
                response = await handleTickets(request, env, ctx);
            } else if (pathname.startsWith('/api/orders') || pathname.startsWith('/orders')) {
                response = await handleOrders(request, env, ctx);
            } else if (pathname.startsWith('/api/users') || pathname.startsWith('/users')) {
                response = await handleUsers(request, env, ctx);
            } else if (pathname.startsWith('/api/services') || pathname.startsWith('/services')) {
                response = await handleServices(request, env, ctx);
            } else if (pathname.startsWith('/api/posts')) {
                response = await handlePosts(request, env, ctx);
            } else if (pathname.startsWith('/api/settings') || pathname.startsWith('/settings')) {
                response = await handleSettings(request, env, ctx);
            } else if (pathname.startsWith('/api/admin/')) {
                response = await handleAdmin(request, env, ctx);
            } else {
                response = new Response(JSON.stringify({ error: "Route not found" }), { status: 404, headers: { 'Content-Type': 'application/json' }});
            }

        } catch (error) {
            console.error('Critical Error in Worker:', error.message, error.stack);
            response = new Response(JSON.stringify({ error: "Internal Server Error: " + error.message }), { status: 500, headers: { 'Content-Type': 'application/json' }});
        }
        
        // --- قم بتطبيق تصاريح CORS على كل الردود في النهاية ---
        return withCors(response);
    },
};