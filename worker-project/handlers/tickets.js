// File: handlers/tickets.js

import { sendEmailWithResend, getNewMessageNotificationHTML, getSupportTicketConfirmationHTML, getAdminNewTicketNotificationHTML } from '../emails/emails.js';

export async function handleTickets(request, env, ctx) {
    const url = new URL(request.url);
    const { pathname } = url;
    const corsHeaders = { "Access-Control-Allow-Origin": "*" };

    const pathParts = pathname.split('/').filter(Boolean);
    let ticketId = pathParts.find(part => part.startsWith('ticket_'));
    const isMessagesRoute = pathParts.includes('messages');

    // --- GET: Fetch ticket data ---
    if (request.method === "GET") {
        const userId = url.searchParams.get('userId');
        
        if (ticketId) { // Find a specific ticket and its messages
            const ticketInfo = await env.DB.prepare("SELECT * FROM support_tickets WHERE id = ?").bind(ticketId).first();
            if (!ticketInfo) return new Response(JSON.stringify({ error: "Ticket not found" }), { status: 404, headers: corsHeaders });

            const { results: messages } = await env.DB.prepare("SELECT * FROM support_messages WHERE ticketId = ? ORDER BY createdAt ASC").bind(ticketId).all();
            
            return new Response(JSON.stringify({ ticket: ticketInfo, messages: messages }), { status: 200, headers: corsHeaders });
        } 
        else if (userId) { // Get all tickets for a specific user
            const { results } = await env.DB.prepare("SELECT * FROM support_tickets WHERE userId = ? ORDER BY updatedAt DESC").bind(userId).all();
            return new Response(JSON.stringify(results), { status: 200, headers: corsHeaders });
        } 
        else { // Get all tickets (for admin)
            const { results } = await env.DB.prepare("SELECT * FROM support_tickets ORDER BY updatedAt DESC").all();
            return new Response(JSON.stringify(results), { status: 200, headers: corsHeaders });
        }
    } 
    
    // --- POST: Add a new message to an existing ticket ---
    else if (request.method === "POST" && ticketId && isMessagesRoute) {
        const formData = await request.formData();
        const sender = formData.get('sender'); // Should be 'user' or 'admin'
        const message = formData.get('message');
        const now = new Date().toISOString();

        if (!sender || !message) {
            return new Response(JSON.stringify({ error: "Sender and message are required." }), { status: 400, headers: corsHeaders });
        }

        const messageData = {
            id: `msg_${Date.now()}`,
            ticketId: ticketId,
            sender: sender,
            message: message,
            attachmentUrl: null,
            createdAt: now
        };

        const attachmentFile = formData.get('attachment');
        if (attachmentFile && typeof attachmentFile.name === 'string' && attachmentFile.name) {
            if (!env.RECEIPTS_BUCKET || !env.R2_PUBLIC_URL) throw new Error("R2 bucket for attachments is not configured.");
            const fileName = `attachments/${ticketId}/${Date.now()}-${attachmentFile.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
            await env.RECEIPTS_BUCKET.put(fileName, attachmentFile.stream(), { httpMetadata: { contentType: attachmentFile.type } });
            messageData.attachmentUrl = `${env.R2_PUBLIC_URL.replace(/\/$/, '')}/${fileName}`;
        }

        await env.DB.prepare("INSERT INTO support_messages (id, ticketId, sender, message, attachmentUrl, createdAt) VALUES (?, ?, ?, ?, ?, ?)")
            .bind(...Object.values(messageData)).run();
        
        await env.DB.prepare("UPDATE support_tickets SET updatedAt = ?, lastReplier = ? WHERE id = ?")
            .bind(now, sender, ticketId).run();
        
        // Send email notification to the other party
        const ticketInfo = await env.DB.prepare("SELECT userId FROM support_tickets WHERE id = ?").bind(ticketId).first();
        if (sender === 'admin' && ticketInfo) {
            // Find user's email to send notification
            if (ticketInfo.userId !== 'guest-user') {
                const userInfo = await env.DB.prepare("SELECT email FROM users WHERE id = ?").bind(ticketInfo.userId).first();
                if (userInfo && userInfo.email) {
                    ctx.waitUntil(sendEmailWithResend({ to: userInfo.email, subject: `لديك رد جديد على تذكرتك #${ticketId}`, html: getNewMessageNotificationHTML(ticketId) }, env));
                }
            }
        } else if (sender === 'user') {
            // Notify admin of a new user reply
            ctx.waitUntil(sendEmailWithResend({ to: 'support@khadamatmaroc.co.uk', subject: `رد جديد من مستخدم على التذكرة #${ticketId}`, html: getNewMessageNotificationHTML(ticketId) }, env));
        }

        return new Response(JSON.stringify(messageData), { status: 201, headers: corsHeaders });
    }
    
    // --- POST: Create a new ticket ---
    else if (request.method === "POST") {
        const formData = await request.formData();
        const newTicketId = `ticket_${Date.now()}`;
        const now = new Date().toISOString();
        
        const ticketData = {
            id: newTicketId,
            userId: formData.get('userId') || 'guest-user',
            subject: formData.get('subject'),
            status: 'open',
            createdAt: now,
            updatedAt: now,
            lastReplier: 'user' // The user is the first replier
        };

        const messageData = {
            id: `msg_${Date.now()}`,
            ticketId: newTicketId,
            sender: 'user',
            message: formData.get('message'),
            attachmentUrl: null,
            createdAt: now
        };

        const attachmentFile = formData.get('attachmentFile'); // Ensure this matches the form name
        if (attachmentFile && typeof attachmentFile.name === 'string' && attachmentFile.name) {
            if (!env.RECEIPTS_BUCKET || !env.R2_PUBLIC_URL) throw new Error("R2 bucket for attachments is not configured.");
            const fileName = `attachments/${newTicketId}/${Date.now()}-${attachmentFile.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
            await env.RECEIPTS_BUCKET.put(fileName, attachmentFile.stream(), { httpMetadata: { contentType: attachmentFile.type } });
            messageData.attachmentUrl = `${env.R2_PUBLIC_URL.replace(/\/$/, '')}/${fileName}`;
        }

        await env.DB.prepare("INSERT INTO support_tickets (id, userId, subject, status, createdAt, updatedAt, lastReplier) VALUES (?, ?, ?, ?, ?, ?, ?)")
            .bind(...Object.values(ticketData)).run();
        
        await env.DB.prepare("INSERT INTO support_messages (id, ticketId, sender, message, attachmentUrl, createdAt) VALUES (?, ?, ?, ?, ?, ?)")
            .bind(...Object.values(messageData)).run();
        
        const emailInfo = {
            userName: formData.get('name'),
            userEmail: formData.get('email')
        };
        const fullTicketInfoForEmail = {...ticketData, ...emailInfo};
        ctx.waitUntil(sendEmailWithResend({ to: emailInfo.userEmail, subject: `تم استلام تذكرتك رقم: ${ticketData.id}`, html: getSupportTicketConfirmationHTML(fullTicketInfoForEmail) }, env));
        ctx.waitUntil(sendEmailWithResend({ to: 'support@khadamatmaroc.co.uk', subject: `تذكرة دعم جديدة: ${ticketData.subject}`, html: getAdminNewTicketNotificationHTML(fullTicketInfoForEmail) }, env));

        return new Response(JSON.stringify({ success: true, ticketId: newTicketId }), { status: 201, headers: corsHeaders });
    }

    // --- PUT: Update ticket status (e.g., close) ---
    else if (request.method === "PUT" && ticketId) {
        const { status } = await request.json();
        if (!['open', 'closed'].includes(status)) return new Response(JSON.stringify({ error: "Invalid status" }), { status: 400, headers: corsHeaders });
        
        await env.DB.prepare("UPDATE support_tickets SET status = ?, updatedAt = ? WHERE id = ?")
            .bind(status, new Date().toISOString(), ticketId).run();

        return new Response(JSON.stringify({ message: "Ticket status updated" }), { status: 200, headers: corsHeaders });
    }

    return new Response(JSON.stringify({ error: "Ticket route not found" }), { status: 404, headers: corsHeaders });
}
