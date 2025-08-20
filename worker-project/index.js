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

// --- Central CORS Helper ---
function withCors(response) {
    const corsHeaders = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };
    
    if (!(response instanceof Response)) {
        console.error("An invalid object was passed to withCors.", response);
        response = new Response(JSON.stringify({ error: "Internal Server Error due to invalid response object" }), { status: 500 });
    }

    Object.entries(corsHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
    });

    return response;
}

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        const { pathname } = url;

        if (request.method === "OPTIONS") {
            return withCors(new Response(null, { status: 204 }));
        }

        let response;
        try {
            // --- The Router (FIXED ORDER) ---

            // [FIXED] Check for the admin route WITHOUT the trailing slash to catch all admin paths.
            if (pathname.startsWith('/api/admin')) {
                response = await handleAdmin(request, env, ctx);
            } 
            // --- All other public routes follow ---
            else if (pathname === '/api/send-verification-email') {
                response = await handleEmails(request, env, ctx);
            } else if (pathname === '/api/subscribe') {
                response = await handleSubscribe(request, env, ctx);
            } else if (pathname.startsWith('/api/reviews')) {
                response = await handleReviews(request, env, ctx);
            } else if (pathname.startsWith('/api/tickets')) {
                response = await handleTickets(request, env, ctx);
            } else if (pathname.startsWith('/api/orders')) {
                response = await handleOrders(request, env, ctx);
            } else if (pathname.startsWith('/api/users')) {
                response = await handleUsers(request, env, ctx);
            } else if (pathname.startsWith('/api/services')) {
                response = await handleServices(request, env, ctx);
            } else if (pathname.startsWith('/api/posts')) {
                response = await handlePosts(request, env, ctx);
            } else if (pathname.startsWith('/api/settings')) {
                response = await handleSettings(request, env, ctx);
            } else {
                response = new Response(JSON.stringify({ error: "Route not found" }), { status: 404 });
            }

        } catch (error) {
            console.error('Critical Error in Worker:', error.message, error.stack);
            response = new Response(JSON.stringify({ error: "Internal Server Error: " + error.message }), { status: 500 });
        }
        
        return withCors(response);
    },
};