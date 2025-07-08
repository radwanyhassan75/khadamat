const { createClient } = require('@supabase/supabase-js');
const { Resend } = require('resend');

exports.handler = async function(event) {
    // استلام البيانات من الطلب
    const submissionData = JSON.parse(event.body);
    const { service, price, notes, customer_name, customer_email, customer_phone } = submissionData;
    const orderId = 'KH-' + Date.now().toString().slice(-6);

    // 1. الاتصال بقاعدة البيانات وحفظ الطلب (كما في السابق)
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
    const { error: dbError } = await supabase.from('orders').insert([{ 
        service_name: service, price, notes, order_id: orderId, 
        customer_name, customer_email, customer_phone,
        payment_status: 'قيد المراجعة', order_status: 'قيد المعالجة'
    }]);

    if (dbError) {
        return { statusCode: 500, body: JSON.stringify({ error: dbError.message }) };
    }

    // 2. إرسال الإيميلات باستخدام Resend
    const resend = new Resend(process.env.RESEND_API_KEY);
    const adminEmail = "your-email@gmail.com"; // 👈 ضع بريدك الإلكتروني هنا

    try {
        // --- الإيميل الذي ستتلقاه أنت (المدير) ---
        await resend.emails.send({
            from: 'Khadamatuk <onboarding@resend.dev>', // لا تغير هذا
            to: adminEmail,
            subject: `طلب خدمة جديد #${orderId}`,
            html: `
                <h1>طلب جديد!</h1>
                <p><strong>رقم الطلب:</strong> ${orderId}</p>
                <p><strong>الخدمة:</strong> ${service}</p>
                <p><strong>السعر:</strong> ${price} درهم</p>
                <hr>
                <h3>معلومات العميل:</h3>
                <p><strong>الاسم:</strong> ${customer_name}</p>
                <p><strong>الإيميل:</strong> ${customer_email}</p>
                <p><strong>الهاتف:</strong> ${customer_phone}</p>
                <hr>
                <h3>تفاصيل الطلب:</h3>
                <p>${notes || 'لا توجد ملاحظات'}</p>
            `
        });

        // --- الإيميل الذي سيتلقاه العميل (بتصميم احترافي) ---
        await resend.emails.send({
            from: 'Khadamatuk <onboarding@resend.dev>', // لا تغير هذا
            to: customer_email,
            subject: `تأكيد استلام طلبك رقم #${orderId}`,
            html: getCustomerEmailTemplate(orderId, service, price, customer_name)
        });

        return { statusCode: 200, body: JSON.stringify({ orderId: orderId }) };

    } catch (emailError) {
        // حتى لو فشل الإيميل، الطلب تم حفظه.
        console.error("Email sending error: ", emailError);
        return { statusCode: 200, body: JSON.stringify({ orderId: orderId, warning: 'Order saved, but email failed.' }) };
    }
};

// --- قالب HTML احترافي لإيميل العميل ---
function getCustomerEmailTemplate(orderId, serviceName, price, customerName) {
    return `
        <!DOCTYPE html>
        <html>
        <head> <style> body { font-family: Cairo, sans-serif; } .container { max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; } </style> </head>
        <body style="direction: rtl; text-align: right;">
            <div class="container">
                <h2>شكراً لطلبك، ${customerName}!</h2>
                <p>لقد استلمنا طلبك بنجاح وسنبدأ في معالجته قريباً. هذا هو ملخص طلبك:</p>
                <hr>
                <p><strong>رقم تتبع الطلب:</strong> <span style="font-size: 1.2em; color: #0056b3;">${orderId}</span></p>
                <p><strong>الخدمة المطلوبة:</strong> ${serviceName}</p>
                <p><strong>المبلغ:</strong> ${price} درهم</p>
                <hr>
                <p>يمكنك تتبع حالة طلبك في أي وقت باستخدام رقم التتبع في صفحة "تتبع الطلب" على موقعنا.</p>
                <p>مع تحيات،<br>فريق المكتب الرقمي</p>
            </div>
        </body>
        </html>
    `;
}