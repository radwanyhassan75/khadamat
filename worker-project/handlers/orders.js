// File: handlers/orders.js

// نستورد قوالب البريد الإلكتروني التي نحتاجها من ملف الإيميلات
import { sendEmailWithResend, getOrderConfirmationHTML, getOrderUpdateHTML } from '../emails/emails.js';

export async function handleOrders(request, env, ctx) {
    const url = new URL(request.url);
    const { pathname } = url;
    const corsHeaders = { "Access-Control-Allow-Origin": "*" };

    const pathParts = pathname.split('/').filter(Boolean);
    // طريقة دقيقة لتحديد رقم الطلب من الرابط
    const orderId = pathParts.find(p => p.startsWith('KH-'));

    if (request.method === "GET") {
        const userId = url.searchParams.get('userId');
        
        if (userId) { // جلب كل طلبات مستخدم معين
            const { results } = await env.DB.prepare("SELECT * FROM orders WHERE userId = ? ORDER BY createdAt DESC").bind(userId).all();
            return new Response(JSON.stringify(results), { status: 200, headers: corsHeaders });
        } else { // جلب كل الطلبات (للأدمن)
            const { results } = await env.DB.prepare("SELECT * FROM orders ORDER BY createdAt DESC").all();
            return new Response(JSON.stringify(results), { status: 200, headers: corsHeaders });
        }
    } 
    
    else if (request.method === "POST") {
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

        const receiptFile = formData.get('receiptFile');
        if (receiptFile && typeof receiptFile.name === 'string' && receiptFile.name) {
            if (!env.RECEIPTS_BUCKET || !env.R2_PUBLIC_URL) {
                throw new Error("R2 bucket environment variables not set.");
            }
            const fileName = `receipts/${newOrderId}/${Date.now()}-${receiptFile.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
            await env.RECEIPTS_BUCKET.put(fileName, receiptFile.stream(), { httpMetadata: { contentType: receiptFile.type } });
            orderData.receiptUrl = `${env.R2_PUBLIC_URL.replace(/\/$/, '')}/${fileName}`;
        }

        await env.DB.prepare(
            "INSERT INTO orders (id, userId, customerName, email, serviceName, status, createdAt, paymentAmount, paymentMethod, phone, price, serviceDetails, serviceLink, receiptUrl, cancellationReason) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
        ).bind(...Object.values(orderData)).run();

        // إرسال إيميل تأكيد الطلب + إرسال البيانات إلى Make.com
        ctx.waitUntil(sendEmailWithResend({ to: orderData.email, subject: `✅ تم استلام طلبك بنجاح - رقم الطلب: ${orderData.id}`, html: getOrderConfirmationHTML(orderData) }, env));
        ctx.waitUntil(fetch("https://hook.eu2.make.com/1thwtejvy75mtrjoh8oidw5rj4r3lxgg", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(orderData) }));
        
        return new Response(JSON.stringify({ success: true, orderId: newOrderId }), { status: 201, headers: corsHeaders });
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

    // fallback in case no condition is met
    return new Response(JSON.stringify({ error: "Order route not found" }), { status: 404, headers: corsHeaders });
}