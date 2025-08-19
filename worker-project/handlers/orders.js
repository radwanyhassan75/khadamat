// File: handlers/orders.js

import { sendEmailWithResend, getOrderConfirmationHTML, getOrderUpdateHTML } from '../emails/emails.js';

export async function handleOrders(request, env, ctx) {
    const url = new URL(request.url);
    const { pathname } = url;
    const corsHeaders = { "Access-Control-Allow-Origin": "*" };

    const pathParts = pathname.split('/').filter(Boolean);
    const orderId = pathParts.find(p => p.startsWith('KH-'));

    if (request.method === "GET" && orderId) {
        const order = await env.DB.prepare("SELECT * FROM orders WHERE id = ?").bind(orderId).first();
        if (!order) {
            return new Response(JSON.stringify({ error: "Order not found" }), { status: 404, headers: corsHeaders });
        }
        return new Response(JSON.stringify(order), { status: 200, headers: corsHeaders });
    }

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
    
    else if (request.method === "POST") {
        try {
            const formData = await request.formData();
            const newOrderId = `KH-${Date.now()}`;
            
            const orderData = {
                id: newOrderId,
                userId: formData.get('userId') || 'guest-user',
                customerName: formData.get('customerName'),
                email: formData.get('email'),
                serviceName: formData.get('serviceName'),
                status: "pending",
                createdAt: new Date().toISOString(),
                paymentAmount: parseFloat(formData.get('price')) || 0,
                paymentMethod: formData.get('paymentMethod'),
                phone: formData.get('phone'),
                price: parseFloat(formData.get('price')) || 0,
                serviceDetails: formData.get('serviceDetails'),
                serviceLink: formData.get('serviceLink'),
                receiptUrl: null,
                cancellationReason: null
            };

            // --- R2 Upload Logic with specific error handling ---
            try {
                const receiptFile = formData.get('receiptFile');
                if (receiptFile && typeof receiptFile.name === 'string' && receiptFile.name) {
                    if (!env.RECEIPTS_BUCKET) throw new Error("R2 Bucket 'RECEIPTS_BUCKET' is not bound. Please check wrangler.toml.");
                    const fileName = `receipts/${newOrderId}/${Date.now()}-${receiptFile.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
                    await env.RECEIPTS_BUCKET.put(fileName, receiptFile.stream(), { httpMetadata: { contentType: receiptFile.type } });
                    orderData.receiptUrl = `${env.R2_PUBLIC_URL.replace(/\/$/, '')}/${fileName}`;
                }
            } catch (e) {
                console.error("R2 Upload Error:", e);
                return new Response(JSON.stringify({ error: "Failed to upload receipt file.", details: e.message }), { status: 500, headers: corsHeaders });
            }

            // --- D1 Insert Logic with specific error handling ---
            try {
                if (!env.DB) throw new Error("D1 Database 'DB' is not bound. Please check wrangler.toml.");
                await env.DB.prepare(
                    "INSERT INTO orders (id, userId, customerName, email, serviceName, status, createdAt, paymentAmount, paymentMethod, phone, price, serviceDetails, serviceLink, receiptUrl, cancellationReason) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
                ).bind(...Object.values(orderData)).run();
            } catch (e) {
                console.error("D1 Insert Error:", e);
                return new Response(JSON.stringify({ error: "Failed to save order to database.", details: e.message }), { status: 500, headers: corsHeaders });
            }

            ctx.waitUntil(sendEmailWithResend({ to: orderData.email, subject: `✅ تم استلام طلبك بنجاح - رقم الطلب: ${orderData.id}`, html: getOrderConfirmationHTML(orderData) }, env));
            ctx.waitUntil(fetch("https://hook.eu2.make.com/1thwtejvy75mtrjoh8oidw5rj4r3lxgg", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(orderData) }));
            
            return new Response(JSON.stringify({ success: true, orderId: newOrderId }), { status: 201, headers: corsHeaders });

        } catch (e) {
            console.error("General POST /orders error:", e);
            return new Response(JSON.stringify({ error: "An unexpected error occurred.", details: e.message }), { status: 500, headers: corsHeaders });
        }
    } 
    
    else if (request.method === "PUT" && orderId) {
        const { status, cancellationReason } = await request.json();
        if (!status) return new Response(JSON.stringify({ error: "يجب تقديم حالة جديدة" }), { status: 400, headers: corsHeaders });
        
        const orderToUpdate = await env.DB.prepare("SELECT * FROM orders WHERE id = ?").bind(orderId).first();
        if (!orderToUpdate) return new Response(JSON.stringify({ error: "Order not found" }), { status: 404, headers: corsHeaders });
        
        await env.DB.prepare("UPDATE orders SET status = ?, cancellationReason = ? WHERE id = ?")
            .bind(status, status === 'ملغى' ? (cancellationReason || "لم يتم تحديد سبب.") : null, orderId).run();
            
        const updatedOrderData = { ...orderToUpdate, status, cancellationReason };
        ctx.waitUntil(sendEmailWithResend({ to: updatedOrderData.email, subject: `تحديث حالة الطلب: ${updatedOrderData.id}`, html: getOrderUpdateHTML(updatedOrderData) }, env));
        
        return new Response(JSON.stringify({ message: "تم تحديث الطلب بنجاح" }), { status: 200, headers: corsHeaders });
    } 
    
    else if (request.method === "DELETE" && orderId) {
        await env.DB.prepare("DELETE FROM orders WHERE id = ?").bind(orderId).run();
        return new Response(JSON.stringify({ message: "تم حذف الطلب بنجاح" }), { status: 200, headers: corsHeaders });
    }

    return new Response(JSON.stringify({ error: "Order route not found" }), { status: 404, headers: corsHeaders });
}
