// File: handlers/admin.js

import { generateSlug } from '../utils/slug.js';

// يمكنك إضافة دالة رفع الملفات إلى R2 هنا إذا كنت ستستخدمها للمرفقات
// async function uploadToR2(file, bucket, key) { ... }

export async function handleAdmin(request, env, ctx) {
    const url = new URL(request.url);
    const { pathname } = url;
    const corsHeaders = { "Access-Control-Allow-Origin": "*" };

    // --- Admin Tickets (Support) Logic --- [UPGRADED] ---
    if (pathname.startsWith('/api/admin/tickets')) {
        const pathParts = pathname.split('/').filter(Boolean);
        const ticketIdFromPath = pathParts[3];

        // NEW: Handle POSTing a new message to a ticket
        // Matches URLs like /api/admin/tickets/ticket_123/messages
        if (request.method === 'POST' && pathname.endsWith('/messages')) {
            const ticketId = ticketIdFromPath;
            const formData = await request.formData();
            
            const newMessage = {
                id: `msg_${Date.now()}`,
                ticketId: ticketId,
                sender: formData.get('sender') || 'admin',
                message: formData.get('message'),
                attachmentUrl: null,
                createdAt: new Date().toISOString()
            };

            // Here you can handle file attachments and upload to R2 if needed
            // const attachmentFile = formData.get('attachment');

            await env.DB.prepare("INSERT INTO ticket_messages (id, ticketId, sender, message, attachmentUrl, createdAt) VALUES (?, ?, ?, ?, ?, ?)")
                .bind(...Object.values(newMessage)).run();

            // IMPORTANT: Update the ticket's last updated timestamp
            await env.DB.prepare("UPDATE support_tickets SET updatedAt = ? WHERE id = ?")
                .bind(new Date().toISOString(), ticketId).run();

            return new Response(JSON.stringify(newMessage), { status: 201 });
        }
        
        // UPGRADED: Get a single ticket AND all its messages
        else if (request.method === 'GET' && ticketIdFromPath) {
            const ticket = await env.DB.prepare("SELECT * FROM support_tickets WHERE id = ?").bind(ticketIdFromPath).first();
            if (!ticket) {
                return new Response(JSON.stringify({ error: "Ticket not found" }), { status: 404 });
            }
            // Also fetch all messages for this ticket
            const { results: messages } = await env.DB.prepare("SELECT * FROM ticket_messages WHERE ticketId = ? ORDER BY createdAt ASC").bind(ticketIdFromPath).all();
            
            // Return both ticket and messages in one response
            return new Response(JSON.stringify({ ticket, messages }), { status: 200 });
        }
        
        // UPGRADED: Get all tickets, sorted by the most recently updated
        else if (request.method === 'GET') {
            const { results } = await env.DB.prepare("SELECT * FROM support_tickets ORDER BY updatedAt DESC").all();
            return new Response(JSON.stringify(results), { status: 200 });
        }
        
        // UPGRADED: Update ticket status and timestamp
        else if (request.method === 'PUT' && ticketIdFromPath) {
            const { status } = await request.json();
            await env.DB.prepare("UPDATE support_tickets SET status = ?, updatedAt = ? WHERE id = ?").bind(status, new Date().toISOString(), ticketIdFromPath).run();
            return new Response(JSON.stringify({ message: "Ticket status updated" }), { status: 200 });
        }
    }
    
    // --- [بقية الأكواد تبقى كما هي بدون تغيير] ---

    // --- Admin Posts Logic ---
    else if (pathname.startsWith('/api/admin/posts')) {
        const pathParts = pathname.split('/').filter(Boolean);
        const postId = pathParts.length === 4 ? pathParts[3] : null;

        if (request.method === 'GET') {
            if (postId) {
                const post = await env.DB.prepare("SELECT * FROM blog_posts WHERE id = ?").bind(postId).first();
                if (!post) return new Response(JSON.stringify({ error: "Post not found" }), { status: 404, headers: corsHeaders });
                return new Response(JSON.stringify(post), { status: 200, headers: corsHeaders });
            } else {
                const { results } = await env.DB.prepare("SELECT id, title, slug, status, created_at FROM blog_posts ORDER BY created_at DESC").all();
                return new Response(JSON.stringify(results), { status: 200, headers: corsHeaders });
            }
        }
        // ... (POST, PUT, DELETE for posts)
    }

    // --- Admin Reviews Logic (Management Only) ---
    else if (pathname.startsWith('/api/admin/reviews')) {
        const pathParts = pathname.split('/').filter(Boolean);
        const reviewId = pathParts.length > 3 ? pathParts[3] : null;
        if (request.method === 'GET') {
            const { results } = await env.DB.prepare("SELECT id, orderId, serviceName, customerName, rating, comment, status, createdAt FROM reviews ORDER BY createdAt DESC").all();
            return new Response(JSON.stringify(results), { status: 200, headers: corsHeaders });
        }
        // ... (PUT, DELETE for reviews)
    }

    // --- Admin Services Logic ---
    else if (pathname.startsWith('/api/admin/services')) {
        const pathParts = pathname.split('/').filter(Boolean);
        const serviceId = pathParts.length > 3 ? pathParts[3] : null;
        if (request.method === 'GET') {
            if (serviceId) {
                const service = await env.DB.prepare("SELECT * FROM services WHERE id = ?").bind(serviceId).first();
                if (!service) return new Response(JSON.stringify({ error: "Service not found" }), { status: 404 });
                return new Response(JSON.stringify(service), { status: 200 });
            } else {
                const { results } = await env.DB.prepare("SELECT id, title, price, category, status, created_at, image_url FROM services ORDER BY created_at DESC").all();
                return new Response(JSON.stringify(results), { status: 200 });
            }
        }
        // ... (POST, PUT, DELETE for services)
    }
    
    // --- Admin Users Logic ---
    else if (pathname.startsWith('/api/admin/users')) {
        const pathParts = pathname.split('/').filter(Boolean);
        const userId = pathParts.length > 3 ? pathParts[3] : null;
        if (request.method === 'GET') {
            if(userId) {
                const user = await env.DB.prepare("SELECT id, displayName, email, role, createdAt FROM users WHERE id = ?").bind(userId).first();
                return new Response(JSON.stringify(user), { status: 200 });
            } else {
                const { results } = await env.DB.prepare("SELECT id, displayName, email, role, createdAt FROM users ORDER BY createdAt DESC").all();
                return new Response(JSON.stringify(results), { status: 200 });
            }
        }
        // ... (PUT, DELETE for users)
    }
    
    // --- Admin Settings Logic ---
    else if (pathname.startsWith('/api/admin/settings')) {
        if (request.method === 'GET') {
            const { results } = await env.DB.prepare("SELECT key, value FROM settings").all();
            const settings = results.reduce((acc, { key, value }) => ({ ...acc, [key]: value }), {});
            return new Response(JSON.stringify(settings), { status: 200 });
        }
        if (request.method === 'POST') {
            const settingsToUpdate = await request.json();
            const promises = Object.entries(settingsToUpdate).map(([key, value]) => {
                return env.DB.prepare("UPDATE settings SET value = ? WHERE key = ?").bind(value, key).run();
            });
            await Promise.all(promises);
            return new Response(JSON.stringify({ message: "Settings updated successfully" }), { status: 200 });
        }
    }

    // fallback for any unhandled admin routes
    return new Response(JSON.stringify({ error: "Admin route not found" }), { status: 404, headers: corsHeaders });
}