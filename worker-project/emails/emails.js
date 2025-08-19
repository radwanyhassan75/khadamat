// File: emails/emails.js

export async function sendEmailWithResend(emailData, env) {
    if (!env.RESEND_API_KEY) {
        console.error("Resend API Key is not set in environment secrets.");
        return new Response(JSON.stringify({ error: 'Email service not configured' }), { status: 500 });
    }
    const fromAddress = "khadamatmaroc <support@khadamatmaroc.co.uk>";
    const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${env.RESEND_API_KEY}` },
        body: JSON.stringify({ from: fromAddress, to: emailData.to, subject: emailData.subject, html: emailData.html }),
    });
    if (!response.ok) {
        const errorData = await response.json();
        console.error(`Failed to send email via Resend: ${response.status} ${response.statusText}`, errorData);
    } else {
        const data = await response.json();
        console.log(`Email sent successfully to ${emailData.to} via Resend. Message ID: ${data.id}`);
    }
    return response;
}

export const emailStyles = {
    body: `background-color: #f4f7f9; margin: 0; padding: 0; font-family: Cairo, Arial, sans-serif; -webkit-font-smoothing: antialiased;`,
    container: `max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 16px; box-shadow: 0 20px 50px -10px rgba(0, 48, 143, 0.1); overflow: hidden; border: 1px solid #e9ecef;`,
    header: `text-align: center; padding: 25px 20px; background-color: #e0f2fe;`, 
    headerImage: `height: 60px;`,
    content: `padding: 40px 35px; text-align: right; direction: rtl; color: #343a40; line-height: 1.8;`,
    h2: `color: #1d2d3d; font-weight: 900; margin-top: 0; font-size: 24px;`,
    p: `margin: 1em 0; font-size: 16px;`,
    hr: `border: none; border-top: 1px solid #e9ecef; margin: 30px 0;`,
    button: `display: inline-block; padding: 14px 28px; background-color: #0056b3; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; transition: all 0.3s ease;`,
    cancellationBox: `background-color: #fffbe6; border: 1px solid #ffe58f; border-radius: 8px; padding: 20px; margin: 25px 0;`,
    footer: `text-align: center; padding: 25px 30px; background-color: #f8f9fa; font-size: 13px; color: #6c757d; border-top: 1px solid #e9ecef;`
};

export function getEmailTemplateWrapper(title, content) {
    const logoUrl = "https://raw.githubusercontent.com/radwanyhassan75/logo.png/main/20832c91-c5a0-4bb1-a95f-b8c8bd097d7a-removebg-preview.png";
    return `
    <div style="${emailStyles.body}">
      <table width="100%" border="0" cellspacing="0" cellpadding="0">
        <tr>
          <td align="center" style="padding: 20px;">
            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="${emailStyles.container}">
              <tr><td style="${emailStyles.header}"><img src="${logoUrl}" alt="شعار المكتب الرقمي" style="${emailStyles.headerImage}"></td></tr>
              <tr><td style="${emailStyles.content}">${content}</td></tr>
              <tr>
                <td style="${emailStyles.footer}">
                  <p style="margin:0;">&copy; ${new Date().getFullYear()} المكتب الرقمي. جميع الحقوق محفوظة.</p>
                  <p style="margin-top: 10px;">هل تحتاج إلى مساعدة؟ <a href="https://khadamat.pages.dev/contact.html" style="color: #0056b3; text-decoration: underline;">تواصل معنا</a>.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>`;
}

export function getCustomVerificationEmailHTML(displayName, verificationLink) {
    const content = `
        <h2 style="${emailStyles.h2}">مرحباً بك ${displayName}!</h2>
        <p style="${emailStyles.p}">شكراً لتسجيلك في <strong>المكتب الرقمي</strong>. لم يتبق سوى خطوة واحدة لتفعيل حسابك.</p>
        <p style="text-align: center; margin: 30px 0;">
            <a href="${verificationLink}" style="${emailStyles.button}">تأكيد البريد الإلكتروني</a>
        </p>`;
    return getEmailTemplateWrapper('تأكيد البريد الإلكتروني', content);
}

export function getOrderConfirmationHTML(order) {
    const content = `
    <h2 style="${emailStyles.h2}">شكراً لطلبك، ${order.customerName}!</h2>
    <p style="${emailStyles.p}">لقد استلمنا طلبك بنجاح وسنبدأ في معالجته قريباً.</p>
    <div style="background-color: #f8f9fa; border-radius: 12px; padding: 25px; margin: 25px 0;">
      <table width="100%" cellspacing="0" cellpadding="0" style="text-align: right; font-size: 15px;">
        <tr><td style="padding: 8px 0; color: #6c757d;">رقم الطلب:</td><td style="padding: 8px 0; font-weight: bold;">${order.id}</td></tr>
        <tr><td style="padding: 8px 0; color: #6c757d;">اسم الخدمة:</td><td style="padding: 8px 0;">${order.serviceName}</td></tr>
      </table>
    </div>`;
    return getEmailTemplateWrapper('تأكيد الطلب', content);
}

export function getOrderUpdateHTML(order, updates) {
    const statusTranslations = {
        'in progress': 'قيد المعالجة',
        'completed': 'مكتمل',
        'cancelled': 'ملغي',
        'payment processing': 'قيد مراجعة الدفع',
        'payment verified': 'تم التحقق من الدفع',
        'payment cancelled': 'تم إلغاء الدفع'
    };

    const newStatusText = statusTranslations[updates.status] || updates.status;
    const updateDate = new Date().toLocaleString('ar-EG', { dateStyle: 'full', timeStyle: 'short' });
    let title = `تحديث بخصوص طلبك #${order.id}`;
    let mainContent = `<p style="${emailStyles.p}">مرحباً ${order.customerName},</p>`;
    let cancellationReasonContent = '';
    let buttonUrl = '';
    let buttonText = '';

    if (updates.updateType === 'order') {
        title = `تم تحديث حالة طلبك إلى: ${newStatusText}`;
        mainContent += `<p style="${emailStyles.p}">نود إعلامك بأنه تم تغيير حالة طلبك <strong>"${order.serviceName}"</strong>.</p>`;
        
        if (updates.status === 'cancelled') {
            title = `للأسف، تم إلغاء طلبك #${order.id}`;
            if (updates.cancellationReason) {
                cancellationReasonContent = `
                <div style="${emailStyles.cancellationBox}">
                    <p style="margin:0; font-weight: bold;">سبب الإلغاء:</p>
                    <p style="margin-top: 5px;">${updates.cancellationReason}</p>
                </div>`;
            }
            buttonUrl = `https://khadamat.pages.dev/contact.html`;
            buttonText = 'تواصل مع الدعم';
        } else if (updates.status === 'completed') {
            title = `🎉 طلبك #${order.id} قد اكتمل!`;
            buttonText = 'عرض تفاصيل الطلب';
        } else {
            buttonText = 'متابعة حالة الطلب';
        }
    } else if (updates.updateType === 'payment') {
        title = `تحديث حالة الدفع لطلبك #${order.id}`;
        mainContent += `<p style="${emailStyles.p}">تم تحديث حالة الدفع لطلبك إلى <strong>"${newStatusText}"</strong>.</p>`;
        buttonText = 'عرض تفاصيل الطلب';
    }

    if (!buttonUrl) {
        if (order.userId === 'guest-user') {
            buttonUrl = `https://khadamat.pages.dev/track-order.html?orderId=${order.id}`;
        } else {
            buttonUrl = `https://khadamat.pages.dev/my-account.html`;
        }
    }
    
    const content = `
        <h2 style="${emailStyles.h2}">${title}</h2>
        ${mainContent}
        ${cancellationReasonContent}
        <div style="background-color: #f8f9fa; border-radius: 12px; padding: 25px; margin: 25px 0;">
          <table width="100%" cellspacing="0" cellpadding="0" style="text-align: right; font-size: 15px;">
            <tr><td style="padding: 8px 0; color: #6c757d;">الحالة الجديدة:</td><td style="padding: 8px 0; font-weight: bold;">${newStatusText}</td></tr>
            <tr><td style="padding: 8px 0; color: #6c757d;">تاريخ التحديث:</td><td style="padding: 8px 0;">${updateDate}</td></tr>
          </table>
        </div>
        <p style="text-align: center; margin: 30px 0;">
            <a href="${buttonUrl}" style="${emailStyles.button}">${buttonText}</a>
        </p>
    `;
    return getEmailTemplateWrapper('تحديث حالة الطلب', content);
}

export function getSupportTicketConfirmationHTML(ticket) {
    const content = `
    <h2 style="${emailStyles.h2}">تم استلام تذكرة الدعم الخاصة بك</h2>
    <p style="${emailStyles.p}">مرحباً ${ticket.userName},</p>
    <p style="${emailStyles.p}">لقد استلمنا طلب الدعم الخاص بك بنجاح.</p>
    <div style="background-color: #f8f9fa; border-radius: 12px; padding: 25px; margin: 25px 0;">
      <table width="100%" cellspacing="0" cellpadding="0" style="text-align: right; font-size: 15px;">
        <tr><td style="padding: 8px 0; color: #6c757d;">رقم التذكرة:</td><td style="padding: 8px 0; font-weight: bold;">${ticket.id}</td></tr>
        <tr><td style="padding: 8px 0; color: #6c757d;">الموضوع:</td><td style="padding: 8px 0;">${ticket.subject}</td></tr>
      </table>
    </div>
    <p style="text-align: center; margin: 30px 0;">
      <a href="https://khadamat.pages.dev/track-ticket.html" style="${emailStyles.button}">متابعة حالة التذكرة</a>
    </p>`;
    return getEmailTemplateWrapper('تأكيد استلام تذكرة الدعم', content);
}

export function getAdminNewTicketNotificationHTML(ticket) {
    const content = `
    <h2 style="${emailStyles.h2}">تنبيه: تذكرة دعم جديدة</h2>
    <p style="${emailStyles.p}">تم إنشاء تذكرة دعم جديدة.</p>
    <div style="background-color: #f8f9fa; border-radius: 12px; padding: 25px; margin: 25px 0;">
      <table width="100%" cellspacing="0" cellpadding="0" style="text-align: right; font-size: 15px;">
        <tr><td style="padding: 8px 0; color: #6c757d;">رقم التذكرة:</td><td style="padding: 8px 0; font-weight: bold;">${ticket.id}</td></tr>
        <tr><td style="padding: 8px 0; color: #6c757d;">اسم المستخدم:</td><td style="padding: 8px 0;">${ticket.userName}</td></tr>
        <tr><td style="padding: 8px 0; color: #6c757d;">بريد المستخدم:</td><td style="padding: 8px 0;">${ticket.userEmail}</td></tr>
        <tr><td style="padding: 8px 0; color: #6c757d;">الموضوع:</td><td style="padding: 8px 0;">${ticket.subject}</td></tr>
      </table>
    </div>`;
    return getEmailTemplateWrapper('تذكرة دعم جديدة', content);
}

export function getNewMessageNotificationHTML(ticketId) {
    const content = `
    <h2 style="${emailStyles.h2}">لديك رد جديد على تذكرتك</h2>
    <p style="${emailStyles.p}">لقد قام فريق الدعم بالرد على تذكرتك رقم <strong>${ticketId}</strong>.</p>
    <p style="text-align: center; margin: 30px 0;">
      <a href="https://khadamat.pages.dev/track-ticket.html" style="${emailStyles.button}">عرض الرد الآن</a>
    </p>`;
    return getEmailTemplateWrapper('رد جديد على تذكرتك', content);
}

export function getSubscriptionConfirmationHTML() {
    const content = `<h2 style="${emailStyles.h2}">شكراً لاشتراكك!</h2><p style="${emailStyles.p}">لقد تم تأكيد اشتراكك في النشرة البريدية بنجاح.</p>`;
    return getEmailTemplateWrapper('تأكيد الاشتراك', content);
}

export async function handleEmails(request, env) {
    const corsHeaders = { "Access-Control-Allow-Origin": "*" };
    if (request.method !== 'POST') return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
    
    const { email, displayName, verificationLink } = await request.json();
    if (!email || !displayName || !verificationLink) return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });

    const emailHtml = getCustomVerificationEmailHTML(displayName, verificationLink);
    const emailData = { to: email, subject: '✅ أكّد بريدك الإلكتروني - المكتب الرقمي', html: emailHtml };
    
    const emailResponse = await sendEmailWithResend(emailData, env);
    return emailResponse.ok 
        ? new Response(JSON.stringify({ success: true }), { status: 200, headers: corsHeaders })
        : new Response(JSON.stringify({ error: 'Failed to send verification email' }), { status: 500, headers: corsHeaders });
}