// File: handlers/admin.js
// This is the complete and final version that handles ALL admin routes.

import { Router } from 'itty-router';

// =================================================================================
// --- Utilities (Auth & DB Check) ---
// =================================================================================

function withAuth(request, env) {
    const authHeader = request.headers.get('Authorization');
    const expectedToken = `Bearer ${env.ADMIN_SECRET_TOKEN}`;
    if (!env.ADMIN_SECRET_TOKEN) {
        console.error("ADMIN_SECRET_TOKEN is not set in Cloudflare environment variables.");
        return new Response(JSON.stringify({ error: "Server configuration error" }), { status: 500 });
    }
    if (!authHeader || authHeader !== expectedToken) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }
}

function withDBCheck(request, env) {
    if (!env.DB) {
        console.error("Database binding [DB] not found. Please check your wrangler.toml file.");
        return new Response(JSON.stringify({ error: "Database connection is not configured." }), { status: 500 });
    }
}

// =================================================================================
// --- Admin Handlers for All Sections ---
// =================================================================================

// --- Orders (NEWLY ADDED) ---
async function adminGetAllOrders(request, env) {
    try {
        // We assume your orders table is named 'orders' and has these columns.
        // Adjust the query if your table structure is different.
        const query = "SELECT id, userId, totalAmount, status, paymentStatus, createdAt FROM orders ORDER BY createdAt DESC LIMIT 100;";
        const { results } = await env.DB.prepare(query).all();
        return new Response(JSON.stringify(results), { status: 200 });
    } catch (e) {
        return new Response(JSON.stringify({ error: "Failed to fetch orders.", details: e.message }), { status: 500 });
    }
}

// --- Tickets ---
async function adminGetAllTickets(request, env) {
    try {
        const query = "SELECT id, subject, status, updatedAt, lastReplier FROM support_tickets ORDER BY updatedAt DESC LIMIT 100;";
        const { results } = await env.DB.prepare(query).all();
        return new Response(JSON.stringify(results), { status: 200 });
    } catch (e) {
        return new Response(JSON.stringify({ error: "Failed to fetch tickets.", details: e.message }), { status: 500 });
    }
}
async function adminGetTicketById(request, env) {
    try {
        const { ticketId } = request.params;
        const ticket = await env.DB.prepare("SELECT * FROM support_tickets WHERE id = ?").bind(ticketId).first();
        if (!ticket) return new Response(JSON.stringify({ error: "Ticket not found" }), { status: 404 });
        const { results: messages } = await env.DB.prepare("SELECT * FROM support_messages WHERE ticketId = ? ORDER BY createdAt ASC").bind(ticketId).all();
        return new Response(JSON.stringify({ ticket, messages }), { status: 200 });
    } catch (e) {
        return new Response(JSON.stringify({ error: "Failed to fetch single ticket.", details: e.message }), { status: 500 });
    }
}

// --- Users ---
async function adminGetAllUsers(request, env) {
    try {
        const { results } = await env.DB.prepare("SELECT id, displayName, email, role, createdAt FROM users ORDER BY createdAt DESC").all();
        return new Response(JSON.stringify(results), { status: 200 });
    } catch (e) {
        return new Response(JSON.stringify({ error: "Failed to fetch users.", details: e.message }), { status: 500 });
    }
}
async function adminGetUserById(request, env) {
    try {
        const { id } = request.params;
        const user = await env.DB.prepare("SELECT id, displayName, email, role, createdAt FROM users WHERE id = ?").bind(id).first();
        if (!user) return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
        return new Response(JSON.stringify(user), { status: 200 });
    } catch (e) {
        return new Response(JSON.stringify({ error: "Failed to fetch user.", details: e.message }), { status: 500 });
    }
}

// --- Posts ---
async function adminGetAllPosts(request, env) {
    try {
        const { results } = await env.DB.prepare("SELECT id, title, slug, status, created_at FROM blog_posts ORDER BY created_at DESC").all();
        return new Response(JSON.stringify(results), { status: 200 });
    } catch (e) {
        return new Response(JSON.stringify({ error: "Failed to fetch posts.", details: e.message }), { status: 500 });
    }
}

// --- Services ---
async function adminGetAllServices(request, env) {
    try {
        const { results } = await env.DB.prepare("SELECT id, title, price, category, status, created_at FROM services ORDER BY created_at DESC").all();
        return new Response(JSON.stringify(results), { status: 200 });
    } catch (e) {
        return new Response(JSON.stringify({ error: "Failed to fetch services.", details: e.message }), { status: 500 });
    }
}

// --- Reviews ---
async function adminGetAllReviews(request, env) {
    try {
        const { results } = await env.DB.prepare("SELECT id, orderId, serviceName, customerName, rating, status, createdAt FROM reviews ORDER BY createdAt DESC").all();
        return new Response(JSON.stringify(results), { status: 200 });
    } catch (e) {
        return new Response(JSON.stringify({ error: "Failed to fetch reviews.", details: e.message }), { status: 500 });
    }
}

// --- Settings ---
async function adminGetSettings(request, env) {
    try {
        const { results } = await env.DB.prepare("SELECT key, value FROM settings").all();
        const settings = results.reduce((acc, { key, value }) => ({ ...acc, [key]: value }), {});
        return new Response(JSON.stringify(settings), { status: 200 });
    } catch (e) {
        return new Response(JSON.stringify({ error: "Failed to fetch settings.", details: e.message }), { status: 500 });
    }
}

// =================================================================================
// --- Router Setup for Admin API ---
// =================================================================================

const router = Router({ base: '/api/admin' });

// Apply middleware to all admin routes
router.all('*', withAuth, withDBCheck);

// Define ALL admin routes
router.get('/orders', adminGetAllOrders); // <-- ROUTE ADDED HERE
router.get('/tickets', adminGetAllTickets);
router.get('/tickets/:ticketId', adminGetTicketById);
router.get('/users', adminGetAllUsers);
router.get('/users/:id', adminGetUserById);
router.get('/posts', adminGetAllPosts);
router.get('/services', adminGetAllServices);
router.get('/reviews', adminGetAllReviews);
router.get('/settings', adminGetSettings);

// Fallback for any unhandled admin routes
router.all('*', () => new Response(JSON.stringify({ error: "Admin route not found" }), { status: 404 }));

// =================================================================================
// --- Main Exported Handler Function ---
// =================================================================================

export function handleAdmin(request, env, ctx) {
    return router.handle(request, env, ctx);
}