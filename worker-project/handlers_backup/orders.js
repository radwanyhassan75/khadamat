// File: handlers/orders.js

import { sendEmailWithResend, getOrderConfirmationHTML, getOrderUpdateHTML } from '../emails/emails.js';

export async function handleOrders(request, env, ctx) {
    const url = new URL(request.url);
    const { pathname } = url;
    const corsHeaders = { "Access-Control-Allow-Origin": "*" };

    const pathParts = pathname.split('/').filter(Boolean);
    const orderId = pathParts.find(p => p.startsWith('KH-'));

    // --- GET (Fetch single order) ---
    if (request.method === "GET" && orderId) {
        const order = await env.DB.prepare("SELECT * FROM orders WHERE id = ?").bind(orderId).first();
        if (!order) {
            return new Response(JSON.stringify({ error: "Order not found" }), { status: 404, headers: corsHeaders });
        }
        return new Response(JSON.stringify(order), { status: 200, headers: corsHeaders });
    }

    // --- GET (Fetch all orders or by userId) ---
    if (request.method === "GET") {
        const userId = url.searchParams.get('userId');
        if (userId) {
            const { results } = await env.DB.prepare("SELECT * FROM orders WHERE userId = ? ORDER BY createdAt DESC").bind(userId).all();
            return new Response(JSON.stringify(results), { status: 200, headers: corsHeaders });
        } else {
            const { results } = await env.DB.prepare("SELECT * FROM orders ORDER BY createdAt DESC").all();
            return new Response(JSON.stringify(results), { status: 200, headers: corsHeaders });
        }
    } 
    
    // --- POST (Create new order) ---
    else if (request.method === "POST") {
        const formData = await request.formData();
        const newOrderId = `KH-${Date.now()}`;
        
        const orderData = {
            id: newOrderId,
            userId: formData.get('userId') || 'guest-user',
            customerName: formData.get('customerName'),
            email: formData.get('email'),
            serviceName: formData.get('serviceName'),
            // تم تغيير الحالات الافتراضية للغة الإنجليزية لتكون متوافقة مع النظام
            status: "in progress", 
            paymentStatus: "payment processing",
            createdAt: new Date().toISOString(),
            paymentAmount: parseFloat(formData.get('price')) || 0,
            paymentMethod: formData.get('paymentMethod'),
            phone: formData.get('phone'),
            price: parseFloat(formData.get('price')) || 0,
            serviceDetails: formData.get('serviceDetails'),
            receiptUrl: null, // سيتم تحديث هذا لاحقاً إذا تم رفع إيصال
            cancellationReason: null,
            paymentCancellationReason: null
        };

        // ... (Your R2 Upload Logic should be here if needed)

        await env.DB.prepare(
            "INSERT INTO orders (id, userId, customerName, email, serviceName, status, paymentStatus, createdAt, paymentAmount, paymentMethod, phone, price, serviceDetails, receiptUrl, cancellationReason, paymentCancellationReason) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
        ).bind(...Object.values(orderData)).run();

        ctx.waitUntil(sendEmailWithResend({ to: orderData.email, subject: `✅ تم استلام طلبك بنجاح - رقم الطلب: ${orderData.id}`, html: getOrderConfirmationHTML(orderData) }, env));
        
        return new Response(JSON.stringify({ success: true, orderId: newOrderId }), { status: 201, headers: corsHeaders });
    } 
    
    // --- PUT (Update order) - [ تم الإصلاح والتطوير هنا ] ---
    else if (request.method === "PUT" && orderId) {
        const updates = await request.json();
        
        let fieldsToUpdate = [];
        let params = [];
        let query;

        // منطق ذكي للتمييز بين تحديث حالة الطلب وحالة الدفع
        if (updates.updateType === 'order') {
            if (updates.status) {
                fieldsToUpdate.push("status = ?");
                params.push(updates.status);
            }
            if (updates.cancellationReason !== undefined) {
                fieldsToUpdate.push("cancellationReason = ?");
                params.push(updates.cancellationReason);
            }
        } else if (updates.updateType === 'payment') {
            if (updates.status) { // اللوحة الأمامية ترسل الحالة تحت اسم 'status'
                fieldsToUpdate.push("paymentStatus = ?");
                params.push(updates.status);
            }
            if (updates.paymentCancellationReason !== undefined) {
                fieldsToUpdate.push("paymentCancellationReason = ?");
                params.push(updates.paymentCancellationReason);
            }
        }

        if (fieldsToUpdate.length === 0) {
            return new Response(JSON.stringify({ error: "No valid fields to update" }), { status: 400, headers: corsHeaders });
        }

        params.push(orderId);
        query = `UPDATE orders SET ${fieldsToUpdate.join(", ")} WHERE id = ?`;
        
        await env.DB.prepare(query).bind(...params).run();
        
        // -- تفعيل إرسال البريد الإلكتروني عند التحديث --
        const updatedOrder = await env.DB.prepare("SELECT * FROM orders WHERE id = ?").bind(orderId).first();
        if (updatedOrder) {
            const emailHtml = getOrderUpdateHTML(updatedOrder, updates);
            const emailSubject = `🔔 تحديث بخصوص طلبك رقم: ${updatedOrder.id}`;
            ctx.waitUntil(sendEmailWithResend({ to: updatedOrder.email, subject: emailSubject, html: emailHtml }, env));
        }
        
        return new Response(JSON.stringify({ message: "تم تحديث الطلب بنجاح" }), { status: 200, headers: corsHeaders });
    } 
    
    // --- DELETE (Delete order) ---
    else if (request.method === "DELETE" && orderId) {
        await env.DB.prepare("DELETE FROM orders WHERE id = ?").bind(orderId).run();
        return new Response(JSON.stringify({ message: "تم حذف الطلب بنجاح" }), { status: 200, headers: corsHeaders });
    }

    return new Response(JSON.stringify({ error: "Order route not found" }), { status: 404, headers: corsHeaders });
}