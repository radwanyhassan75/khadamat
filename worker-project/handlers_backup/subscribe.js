// File: handlers/subscribe.js

// نستورد وظائف البريد الإلكتروني التي سنحتاجها
import { sendEmailWithResend, getSubscriptionConfirmationHTML } from '../emails/emails.js';

export async function handleSubscribe(request, env, ctx) {
    const corsHeaders = { "Access-Control-Allow-Origin": "*" };

    if (request.method !== 'POST') {
        return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: corsHeaders });
    }

    try {
        const { email } = await request.json();

        if (!email || !email.includes('@')) {
            return new Response(JSON.stringify({ error: "Please provide a valid email address." }), { status: 400, headers: corsHeaders });
        }

        // (نفترض أن لديك جدولاً باسم "subscribers" يحتوي على حقل "email" و "createdAt")
        await env.DB.prepare(
            "INSERT INTO subscribers (email, createdAt) VALUES (?, ?)"
        ).bind(email, new Date().toISOString()).run();

        // إرسال بريد إلكتروني لتأكيد الاشتراك
        ctx.waitUntil(sendEmailWithResend({
            to: email,
            subject: '✅ تم تأكيد اشتراكك في النشرة البريدية!',
            html: getSubscriptionConfirmationHTML()
        }, env));

        return new Response(JSON.stringify({ success: true, message: "Subscription successful!" }), { status: 201, headers: corsHeaders });

    } catch (e) {
        // التعامل مع حالة البريد الإلكتروني المكرر
        if (e.message.includes('UNIQUE constraint failed')) {
            return new Response(JSON.stringify({ error: "This email is already subscribed." }), { status: 409, headers: corsHeaders });
        }
        console.error("Subscription Error:", e);
        return new Response(JSON.stringify({ error: "An internal error occurred." }), { status: 500, headers: corsHeaders });
    }
}