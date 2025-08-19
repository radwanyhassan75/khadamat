var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// emails/emails.js
async function sendEmailWithResend(emailData, env) {
  if (!env.RESEND_API_KEY) {
    console.error("Resend API Key is not set in environment secrets.");
    return new Response(JSON.stringify({ error: "Email service not configured" }), { status: 500 });
  }
  const fromAddress = "khadamatmaroc <support@khadamatmaroc.co.uk>";
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${env.RESEND_API_KEY}` },
    body: JSON.stringify({ from: fromAddress, to: emailData.to, subject: emailData.subject, html: emailData.html })
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
__name(sendEmailWithResend, "sendEmailWithResend");
var emailStyles = {
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
function getEmailTemplateWrapper(title, content) {
  const logoUrl = "https://raw.githubusercontent.com/radwanyhassan75/logo.png/main/20832c91-c5a0-4bb1-a95f-b8c8bd097d7a-removebg-preview.png";
  return `
    <div style="${emailStyles.body}">
      <table width="100%" border="0" cellspacing="0" cellpadding="0">
        <tr>
          <td align="center" style="padding: 20px;">
            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="${emailStyles.container}">
              <tr><td style="${emailStyles.header}"><img src="${logoUrl}" alt="\u0634\u0639\u0627\u0631 \u0627\u0644\u0645\u0643\u062A\u0628 \u0627\u0644\u0631\u0642\u0645\u064A" style="${emailStyles.headerImage}"></td></tr>
              <tr><td style="${emailStyles.content}">${content}</td></tr>
              <tr>
                <td style="${emailStyles.footer}">
                  <p style="margin:0;">&copy; ${(/* @__PURE__ */ new Date()).getFullYear()} \u0627\u0644\u0645\u0643\u062A\u0628 \u0627\u0644\u0631\u0642\u0645\u064A. \u062C\u0645\u064A\u0639 \u0627\u0644\u062D\u0642\u0648\u0642 \u0645\u062D\u0641\u0648\u0638\u0629.</p>
                  <p style="margin-top: 10px;">\u0647\u0644 \u062A\u062D\u062A\u0627\u062C \u0625\u0644\u0649 \u0645\u0633\u0627\u0639\u062F\u0629\u061F <a href="https://khadamat.pages.dev/contact.html" style="color: #0056b3; text-decoration: underline;">\u062A\u0648\u0627\u0635\u0644 \u0645\u0639\u0646\u0627</a>.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>`;
}
__name(getEmailTemplateWrapper, "getEmailTemplateWrapper");
function getCustomVerificationEmailHTML(displayName, verificationLink) {
  const content = `
        <h2 style="${emailStyles.h2}">\u0645\u0631\u062D\u0628\u0627\u064B \u0628\u0643 ${displayName}!</h2>
        <p style="${emailStyles.p}">\u0634\u0643\u0631\u0627\u064B \u0644\u062A\u0633\u062C\u064A\u0644\u0643 \u0641\u064A <strong>\u0627\u0644\u0645\u0643\u062A\u0628 \u0627\u0644\u0631\u0642\u0645\u064A</strong>. \u0644\u0645 \u064A\u062A\u0628\u0642 \u0633\u0648\u0649 \u062E\u0637\u0648\u0629 \u0648\u0627\u062D\u062F\u0629 \u0644\u062A\u0641\u0639\u064A\u0644 \u062D\u0633\u0627\u0628\u0643.</p>
        <p style="text-align: center; margin: 30px 0;">
            <a href="${verificationLink}" style="${emailStyles.button}">\u062A\u0623\u0643\u064A\u062F \u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A</a>
        </p>`;
  return getEmailTemplateWrapper("\u062A\u0623\u0643\u064A\u062F \u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A", content);
}
__name(getCustomVerificationEmailHTML, "getCustomVerificationEmailHTML");
function getOrderConfirmationHTML(order) {
  const content = `
    <h2 style="${emailStyles.h2}">\u0634\u0643\u0631\u0627\u064B \u0644\u0637\u0644\u0628\u0643\u060C ${order.customerName}!</h2>
    <p style="${emailStyles.p}">\u0644\u0642\u062F \u0627\u0633\u062A\u0644\u0645\u0646\u0627 \u0637\u0644\u0628\u0643 \u0628\u0646\u062C\u0627\u062D \u0648\u0633\u0646\u0628\u062F\u0623 \u0641\u064A \u0645\u0639\u0627\u0644\u062C\u062A\u0647 \u0642\u0631\u064A\u0628\u0627\u064B.</p>
    <div style="background-color: #f8f9fa; border-radius: 12px; padding: 25px; margin: 25px 0;">
      <table width="100%" cellspacing="0" cellpadding="0" style="text-align: right; font-size: 15px;">
        <tr><td style="padding: 8px 0; color: #6c757d;">\u0631\u0642\u0645 \u0627\u0644\u0637\u0644\u0628:</td><td style="padding: 8px 0; font-weight: bold;">${order.id}</td></tr>
        <tr><td style="padding: 8px 0; color: #6c757d;">\u0627\u0633\u0645 \u0627\u0644\u062E\u062F\u0645\u0629:</td><td style="padding: 8px 0;">${order.serviceName}</td></tr>
      </table>
    </div>`;
  return getEmailTemplateWrapper("\u062A\u0623\u0643\u064A\u062F \u0627\u0644\u0637\u0644\u0628", content);
}
__name(getOrderConfirmationHTML, "getOrderConfirmationHTML");
function getOrderUpdateHTML(order, updates) {
  const statusTranslations = {
    "in progress": "\u0642\u064A\u062F \u0627\u0644\u0645\u0639\u0627\u0644\u062C\u0629",
    "completed": "\u0645\u0643\u062A\u0645\u0644",
    "cancelled": "\u0645\u0644\u063A\u064A",
    "payment processing": "\u0642\u064A\u062F \u0645\u0631\u0627\u062C\u0639\u0629 \u0627\u0644\u062F\u0641\u0639",
    "payment verified": "\u062A\u0645 \u0627\u0644\u062A\u062D\u0642\u0642 \u0645\u0646 \u0627\u0644\u062F\u0641\u0639",
    "payment cancelled": "\u062A\u0645 \u0625\u0644\u063A\u0627\u0621 \u0627\u0644\u062F\u0641\u0639"
  };
  const newStatusText = statusTranslations[updates.status] || updates.status;
  const updateDate = (/* @__PURE__ */ new Date()).toLocaleString("ar-EG", { dateStyle: "full", timeStyle: "short" });
  let title = `\u062A\u062D\u062F\u064A\u062B \u0628\u062E\u0635\u0648\u0635 \u0637\u0644\u0628\u0643 #${order.id}`;
  let mainContent = `<p style="${emailStyles.p}">\u0645\u0631\u062D\u0628\u0627\u064B ${order.customerName},</p>`;
  let cancellationReasonContent = "";
  let buttonUrl = "";
  let buttonText = "";
  if (updates.updateType === "order") {
    title = `\u062A\u0645 \u062A\u062D\u062F\u064A\u062B \u062D\u0627\u0644\u0629 \u0637\u0644\u0628\u0643 \u0625\u0644\u0649: ${newStatusText}`;
    mainContent += `<p style="${emailStyles.p}">\u0646\u0648\u062F \u0625\u0639\u0644\u0627\u0645\u0643 \u0628\u0623\u0646\u0647 \u062A\u0645 \u062A\u063A\u064A\u064A\u0631 \u062D\u0627\u0644\u0629 \u0637\u0644\u0628\u0643 <strong>"${order.serviceName}"</strong>.</p>`;
    if (updates.status === "cancelled") {
      title = `\u0644\u0644\u0623\u0633\u0641\u060C \u062A\u0645 \u0625\u0644\u063A\u0627\u0621 \u0637\u0644\u0628\u0643 #${order.id}`;
      if (updates.cancellationReason) {
        cancellationReasonContent = `
                <div style="${emailStyles.cancellationBox}">
                    <p style="margin:0; font-weight: bold;">\u0633\u0628\u0628 \u0627\u0644\u0625\u0644\u063A\u0627\u0621:</p>
                    <p style="margin-top: 5px;">${updates.cancellationReason}</p>
                </div>`;
      }
      buttonUrl = `https://khadamat.pages.dev/contact.html`;
      buttonText = "\u062A\u0648\u0627\u0635\u0644 \u0645\u0639 \u0627\u0644\u062F\u0639\u0645";
    } else if (updates.status === "completed") {
      title = `\u{1F389} \u0637\u0644\u0628\u0643 #${order.id} \u0642\u062F \u0627\u0643\u062A\u0645\u0644!`;
      buttonText = "\u0639\u0631\u0636 \u062A\u0641\u0627\u0635\u064A\u0644 \u0627\u0644\u0637\u0644\u0628";
    } else {
      buttonText = "\u0645\u062A\u0627\u0628\u0639\u0629 \u062D\u0627\u0644\u0629 \u0627\u0644\u0637\u0644\u0628";
    }
  } else if (updates.updateType === "payment") {
    title = `\u062A\u062D\u062F\u064A\u062B \u062D\u0627\u0644\u0629 \u0627\u0644\u062F\u0641\u0639 \u0644\u0637\u0644\u0628\u0643 #${order.id}`;
    mainContent += `<p style="${emailStyles.p}">\u062A\u0645 \u062A\u062D\u062F\u064A\u062B \u062D\u0627\u0644\u0629 \u0627\u0644\u062F\u0641\u0639 \u0644\u0637\u0644\u0628\u0643 \u0625\u0644\u0649 <strong>"${newStatusText}"</strong>.</p>`;
    buttonText = "\u0639\u0631\u0636 \u062A\u0641\u0627\u0635\u064A\u0644 \u0627\u0644\u0637\u0644\u0628";
  }
  if (!buttonUrl) {
    if (order.userId === "guest-user") {
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
            <tr><td style="padding: 8px 0; color: #6c757d;">\u0627\u0644\u062D\u0627\u0644\u0629 \u0627\u0644\u062C\u062F\u064A\u062F\u0629:</td><td style="padding: 8px 0; font-weight: bold;">${newStatusText}</td></tr>
            <tr><td style="padding: 8px 0; color: #6c757d;">\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u062A\u062D\u062F\u064A\u062B:</td><td style="padding: 8px 0;">${updateDate}</td></tr>
          </table>
        </div>
        <p style="text-align: center; margin: 30px 0;">
            <a href="${buttonUrl}" style="${emailStyles.button}">${buttonText}</a>
        </p>
    `;
  return getEmailTemplateWrapper("\u062A\u062D\u062F\u064A\u062B \u062D\u0627\u0644\u0629 \u0627\u0644\u0637\u0644\u0628", content);
}
__name(getOrderUpdateHTML, "getOrderUpdateHTML");
function getSupportTicketConfirmationHTML(ticket) {
  const content = `
    <h2 style="${emailStyles.h2}">\u062A\u0645 \u0627\u0633\u062A\u0644\u0627\u0645 \u062A\u0630\u0643\u0631\u0629 \u0627\u0644\u062F\u0639\u0645 \u0627\u0644\u062E\u0627\u0635\u0629 \u0628\u0643</h2>
    <p style="${emailStyles.p}">\u0645\u0631\u062D\u0628\u0627\u064B ${ticket.userName},</p>
    <p style="${emailStyles.p}">\u0644\u0642\u062F \u0627\u0633\u062A\u0644\u0645\u0646\u0627 \u0637\u0644\u0628 \u0627\u0644\u062F\u0639\u0645 \u0627\u0644\u062E\u0627\u0635 \u0628\u0643 \u0628\u0646\u062C\u0627\u062D.</p>
    <div style="background-color: #f8f9fa; border-radius: 12px; padding: 25px; margin: 25px 0;">
      <table width="100%" cellspacing="0" cellpadding="0" style="text-align: right; font-size: 15px;">
        <tr><td style="padding: 8px 0; color: #6c757d;">\u0631\u0642\u0645 \u0627\u0644\u062A\u0630\u0643\u0631\u0629:</td><td style="padding: 8px 0; font-weight: bold;">${ticket.id}</td></tr>
        <tr><td style="padding: 8px 0; color: #6c757d;">\u0627\u0644\u0645\u0648\u0636\u0648\u0639:</td><td style="padding: 8px 0;">${ticket.subject}</td></tr>
      </table>
    </div>
    <p style="text-align: center; margin: 30px 0;">
      <a href="https://khadamat.pages.dev/track-ticket.html" style="${emailStyles.button}">\u0645\u062A\u0627\u0628\u0639\u0629 \u062D\u0627\u0644\u0629 \u0627\u0644\u062A\u0630\u0643\u0631\u0629</a>
    </p>`;
  return getEmailTemplateWrapper("\u062A\u0623\u0643\u064A\u062F \u0627\u0633\u062A\u0644\u0627\u0645 \u062A\u0630\u0643\u0631\u0629 \u0627\u0644\u062F\u0639\u0645", content);
}
__name(getSupportTicketConfirmationHTML, "getSupportTicketConfirmationHTML");
function getAdminNewTicketNotificationHTML(ticket) {
  const content = `
    <h2 style="${emailStyles.h2}">\u062A\u0646\u0628\u064A\u0647: \u062A\u0630\u0643\u0631\u0629 \u062F\u0639\u0645 \u062C\u062F\u064A\u062F\u0629</h2>
    <p style="${emailStyles.p}">\u062A\u0645 \u0625\u0646\u0634\u0627\u0621 \u062A\u0630\u0643\u0631\u0629 \u062F\u0639\u0645 \u062C\u062F\u064A\u062F\u0629.</p>
    <div style="background-color: #f8f9fa; border-radius: 12px; padding: 25px; margin: 25px 0;">
      <table width="100%" cellspacing="0" cellpadding="0" style="text-align: right; font-size: 15px;">
        <tr><td style="padding: 8px 0; color: #6c757d;">\u0631\u0642\u0645 \u0627\u0644\u062A\u0630\u0643\u0631\u0629:</td><td style="padding: 8px 0; font-weight: bold;">${ticket.id}</td></tr>
        <tr><td style="padding: 8px 0; color: #6c757d;">\u0627\u0633\u0645 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645:</td><td style="padding: 8px 0;">${ticket.userName}</td></tr>
        <tr><td style="padding: 8px 0; color: #6c757d;">\u0628\u0631\u064A\u062F \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645:</td><td style="padding: 8px 0;">${ticket.userEmail}</td></tr>
        <tr><td style="padding: 8px 0; color: #6c757d;">\u0627\u0644\u0645\u0648\u0636\u0648\u0639:</td><td style="padding: 8px 0;">${ticket.subject}</td></tr>
      </table>
    </div>`;
  return getEmailTemplateWrapper("\u062A\u0630\u0643\u0631\u0629 \u062F\u0639\u0645 \u062C\u062F\u064A\u062F\u0629", content);
}
__name(getAdminNewTicketNotificationHTML, "getAdminNewTicketNotificationHTML");
function getNewMessageNotificationHTML(ticketId) {
  const content = `
    <h2 style="${emailStyles.h2}">\u0644\u062F\u064A\u0643 \u0631\u062F \u062C\u062F\u064A\u062F \u0639\u0644\u0649 \u062A\u0630\u0643\u0631\u062A\u0643</h2>
    <p style="${emailStyles.p}">\u0644\u0642\u062F \u0642\u0627\u0645 \u0641\u0631\u064A\u0642 \u0627\u0644\u062F\u0639\u0645 \u0628\u0627\u0644\u0631\u062F \u0639\u0644\u0649 \u062A\u0630\u0643\u0631\u062A\u0643 \u0631\u0642\u0645 <strong>${ticketId}</strong>.</p>
    <p style="text-align: center; margin: 30px 0;">
      <a href="https://khadamat.pages.dev/track-ticket.html" style="${emailStyles.button}">\u0639\u0631\u0636 \u0627\u0644\u0631\u062F \u0627\u0644\u0622\u0646</a>
    </p>`;
  return getEmailTemplateWrapper("\u0631\u062F \u062C\u062F\u064A\u062F \u0639\u0644\u0649 \u062A\u0630\u0643\u0631\u062A\u0643", content);
}
__name(getNewMessageNotificationHTML, "getNewMessageNotificationHTML");
function getSubscriptionConfirmationHTML() {
  const content = `<h2 style="${emailStyles.h2}">\u0634\u0643\u0631\u0627\u064B \u0644\u0627\u0634\u062A\u0631\u0627\u0643\u0643!</h2><p style="${emailStyles.p}">\u0644\u0642\u062F \u062A\u0645 \u062A\u0623\u0643\u064A\u062F \u0627\u0634\u062A\u0631\u0627\u0643\u0643 \u0641\u064A \u0627\u0644\u0646\u0634\u0631\u0629 \u0627\u0644\u0628\u0631\u064A\u062F\u064A\u0629 \u0628\u0646\u062C\u0627\u062D.</p>`;
  return getEmailTemplateWrapper("\u062A\u0623\u0643\u064A\u062F \u0627\u0644\u0627\u0634\u062A\u0631\u0627\u0643", content);
}
__name(getSubscriptionConfirmationHTML, "getSubscriptionConfirmationHTML");
async function handleEmails(request, env) {
  const corsHeaders = { "Access-Control-Allow-Origin": "*" };
  if (request.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  const { email, displayName, verificationLink } = await request.json();
  if (!email || !displayName || !verificationLink) return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
  const emailHtml = getCustomVerificationEmailHTML(displayName, verificationLink);
  const emailData = { to: email, subject: "\u2705 \u0623\u0643\u0651\u062F \u0628\u0631\u064A\u062F\u0643 \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A - \u0627\u0644\u0645\u0643\u062A\u0628 \u0627\u0644\u0631\u0642\u0645\u064A", html: emailHtml };
  const emailResponse = await sendEmailWithResend(emailData, env);
  return emailResponse.ok ? new Response(JSON.stringify({ success: true }), { status: 200, headers: corsHeaders }) : new Response(JSON.stringify({ error: "Failed to send verification email" }), { status: 500, headers: corsHeaders });
}
__name(handleEmails, "handleEmails");

// handlers/users.js
async function handleUsers(request, env, ctx) {
  const url = new URL(request.url);
  const { pathname } = url;
  const corsHeaders = { "Access-Control-Allow-Origin": "*" };
  const pathParts = pathname.split("/").filter(Boolean);
  const isStatusCheck = pathParts[pathParts.length - 1] === "status";
  const userId = pathParts.length > 1 && !isStatusCheck ? pathParts[pathParts.length - 1] : isStatusCheck ? pathParts[pathParts.length - 2] : null;
  if (request.method === "GET" && userId && isStatusCheck) {
    try {
      const user = await env.DB.prepare("SELECT role FROM users WHERE id = ?").bind(userId).first();
      if (user && user.role === "admin") {
        return new Response(JSON.stringify({ isAdmin: true }), { status: 200, headers: corsHeaders });
      }
      return new Response(JSON.stringify({ isAdmin: false }), { status: 200, headers: corsHeaders });
    } catch (error) {
      console.error("User status check error:", error);
      return new Response(JSON.stringify({ isAdmin: false }), { status: 500, headers: corsHeaders });
    }
  } else if (request.method === "GET" && !userId) {
    const defaultPicture = "https://via.placeholder.com/150";
    const { results } = await env.DB.prepare(
      "SELECT u.id, u.email, u.displayName, u.createdAt, u.status, COALESCE(u.profilePicture, ?) as profilePicture, COUNT(o.id) as totalOrders FROM users u LEFT JOIN orders o ON u.id = o.userId GROUP BY u.id ORDER BY u.createdAt DESC"
    ).bind(defaultPicture).all();
    return new Response(JSON.stringify(results), { status: 200, headers: corsHeaders });
  } else if (request.method === "POST") {
    try {
      const newUser = await request.json();
      if (!newUser.id || !newUser.email) {
        return new Response(JSON.stringify({ error: "User ID and Email are required" }), { status: 400, headers: corsHeaders });
      }
      await env.DB.prepare(
        "INSERT INTO users (id, email, displayName, createdAt, status, profilePicture, role, provider) VALUES (?, ?, ?, ?, 'pending_verification', ?, 'customer', ?)"
      ).bind(
        newUser.id,
        newUser.email,
        newUser.displayName || null,
        (/* @__PURE__ */ new Date()).toISOString(),
        newUser.profilePicture || "https://via.placeholder.com/150",
        newUser.provider || "email"
      ).run();
      return new Response(JSON.stringify({ success: true, message: "User created successfully" }), { status: 201, headers: corsHeaders });
    } catch (error) {
      console.error("Error creating user:", error);
      return new Response(JSON.stringify({ error: "Failed to create user: " + error.message }), { status: 500, headers: corsHeaders });
    }
  } else if (request.method === "PUT" && userId) {
    const { status, profilePicture } = await request.json();
    if (!status && !profilePicture) {
      return new Response(JSON.stringify({ error: "At least one field is required" }), { status: 400, headers: corsHeaders });
    }
    let query = "UPDATE users SET";
    const params = [];
    if (status) {
      query += " status = ?,";
      params.push(status);
    }
    if (profilePicture) {
      query += " profilePicture = ?,";
      params.push(profilePicture);
    }
    query = query.slice(0, -1) + " WHERE id = ?";
    params.push(userId);
    await env.DB.prepare(query).bind(...params).run();
    return new Response(JSON.stringify({ message: "User updated successfully" }), { status: 200, headers: corsHeaders });
  } else if (request.method === "DELETE" && userId) {
    await env.DB.prepare("DELETE FROM users WHERE id = ?").bind(userId).run();
    return new Response(JSON.stringify({ message: "User deleted successfully" }), { status: 200, headers: corsHeaders });
  }
  return new Response(JSON.stringify({ error: "User route not found" }), { status: 404, headers: corsHeaders });
}
__name(handleUsers, "handleUsers");

// handlers/orders.js
async function handleOrders(request, env, ctx) {
  const url = new URL(request.url);
  const { pathname } = url;
  const corsHeaders = { "Access-Control-Allow-Origin": "*" };
  const pathParts = pathname.split("/").filter(Boolean);
  const orderId = pathParts.find((p) => p.startsWith("KH-"));
  if (request.method === "GET" && orderId) {
    const order = await env.DB.prepare("SELECT * FROM orders WHERE id = ?").bind(orderId).first();
    if (!order) {
      return new Response(JSON.stringify({ error: "Order not found" }), { status: 404, headers: corsHeaders });
    }
    return new Response(JSON.stringify(order), { status: 200, headers: corsHeaders });
  }
  if (request.method === "GET") {
    const userId = url.searchParams.get("userId");
    if (userId) {
      const { results } = await env.DB.prepare("SELECT * FROM orders WHERE userId = ? ORDER BY createdAt DESC").bind(userId).all();
      return new Response(JSON.stringify(results), { status: 200, headers: corsHeaders });
    } else {
      const { results } = await env.DB.prepare("SELECT * FROM orders ORDER BY createdAt DESC").all();
      return new Response(JSON.stringify(results), { status: 200, headers: corsHeaders });
    }
  } else if (request.method === "POST") {
    const formData = await request.formData();
    const newOrderId = `KH-${Date.now()}`;
    const orderData = {
      id: newOrderId,
      userId: formData.get("userId") || "guest-user",
      customerName: formData.get("customerName"),
      email: formData.get("email"),
      serviceName: formData.get("serviceName"),
      // تم تغيير الحالات الافتراضية للغة الإنجليزية لتكون متوافقة مع النظام
      status: "in progress",
      paymentStatus: "payment processing",
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      paymentAmount: parseFloat(formData.get("price")) || 0,
      paymentMethod: formData.get("paymentMethod"),
      phone: formData.get("phone"),
      price: parseFloat(formData.get("price")) || 0,
      serviceDetails: formData.get("serviceDetails"),
      receiptUrl: null,
      // سيتم تحديث هذا لاحقاً إذا تم رفع إيصال
      cancellationReason: null,
      paymentCancellationReason: null
    };
    await env.DB.prepare(
      "INSERT INTO orders (id, userId, customerName, email, serviceName, status, paymentStatus, createdAt, paymentAmount, paymentMethod, phone, price, serviceDetails, receiptUrl, cancellationReason, paymentCancellationReason) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    ).bind(...Object.values(orderData)).run();
    ctx.waitUntil(sendEmailWithResend({ to: orderData.email, subject: `\u2705 \u062A\u0645 \u0627\u0633\u062A\u0644\u0627\u0645 \u0637\u0644\u0628\u0643 \u0628\u0646\u062C\u0627\u062D - \u0631\u0642\u0645 \u0627\u0644\u0637\u0644\u0628: ${orderData.id}`, html: getOrderConfirmationHTML(orderData) }, env));
    return new Response(JSON.stringify({ success: true, orderId: newOrderId }), { status: 201, headers: corsHeaders });
  } else if (request.method === "PUT" && orderId) {
    const updates = await request.json();
    let fieldsToUpdate = [];
    let params = [];
    let query;
    if (updates.updateType === "order") {
      if (updates.status) {
        fieldsToUpdate.push("status = ?");
        params.push(updates.status);
      }
      if (updates.cancellationReason !== void 0) {
        fieldsToUpdate.push("cancellationReason = ?");
        params.push(updates.cancellationReason);
      }
    } else if (updates.updateType === "payment") {
      if (updates.status) {
        fieldsToUpdate.push("paymentStatus = ?");
        params.push(updates.status);
      }
      if (updates.paymentCancellationReason !== void 0) {
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
    const updatedOrder = await env.DB.prepare("SELECT * FROM orders WHERE id = ?").bind(orderId).first();
    if (updatedOrder) {
      const emailHtml = getOrderUpdateHTML(updatedOrder, updates);
      const emailSubject = `\u{1F514} \u062A\u062D\u062F\u064A\u062B \u0628\u062E\u0635\u0648\u0635 \u0637\u0644\u0628\u0643 \u0631\u0642\u0645: ${updatedOrder.id}`;
      ctx.waitUntil(sendEmailWithResend({ to: updatedOrder.email, subject: emailSubject, html: emailHtml }, env));
    }
    return new Response(JSON.stringify({ message: "\u062A\u0645 \u062A\u062D\u062F\u064A\u062B \u0627\u0644\u0637\u0644\u0628 \u0628\u0646\u062C\u0627\u062D" }), { status: 200, headers: corsHeaders });
  } else if (request.method === "DELETE" && orderId) {
    await env.DB.prepare("DELETE FROM orders WHERE id = ?").bind(orderId).run();
    return new Response(JSON.stringify({ message: "\u062A\u0645 \u062D\u0630\u0641 \u0627\u0644\u0637\u0644\u0628 \u0628\u0646\u062C\u0627\u062D" }), { status: 200, headers: corsHeaders });
  }
  return new Response(JSON.stringify({ error: "Order route not found" }), { status: 404, headers: corsHeaders });
}
__name(handleOrders, "handleOrders");

// utils/slug.js
function generateSlug(text) {
  if (!text) return "";
  return text.toString().toLowerCase().replace(/\s+/g, "-").replace(/[^\u0600-\u06FF\w\-]+/g, "").replace(/\-\-+/g, "-").replace(/^-+/, "").replace(/-+$/, "");
}
__name(generateSlug, "generateSlug");

// handlers/services.js
async function handleServices(request, env, ctx) {
  const url = new URL(request.url);
  const { pathname } = url;
  const corsHeaders = { "Access-Control-Allow-Origin": "*" };
  const isAdminRoute = pathname.includes("/admin/");
  const pathParts = pathname.split("/").filter(Boolean);
  const slug = pathname.includes("/slug/") ? decodeURIComponent(pathParts[pathParts.length - 1]) : null;
  const serviceId = pathParts.find((p) => p.startsWith("serv_"));
  if (request.method === "GET") {
    if (slug) {
      const service = await env.DB.prepare("SELECT * FROM services WHERE slug = ? AND status = 'available'").bind(slug).first();
      if (!service) return new Response(JSON.stringify({ error: "Service not found" }), { status: 404, headers: corsHeaders });
      return new Response(JSON.stringify(service), { status: 200, headers: corsHeaders });
    } else if (serviceId) {
      const service = await env.DB.prepare("SELECT * FROM services WHERE id = ?").bind(serviceId).first();
      if (!service) return new Response(JSON.stringify({ error: "Service not found" }), { status: 404, headers: corsHeaders });
      return new Response(JSON.stringify(service), { status: 200, headers: corsHeaders });
    } else {
      const query = isAdminRoute ? "SELECT * FROM services ORDER BY created_at DESC" : "SELECT * FROM services WHERE status = 'available' ORDER BY category, created_at DESC";
      const { results } = await env.DB.prepare(query).all();
      return new Response(JSON.stringify(results), { status: 200, headers: corsHeaders });
    }
  } else if (request.method === "POST") {
    const service = await request.json();
    const newId = `serv_${Date.now()}`;
    const newSlug = generateSlug(service.title);
    await env.DB.prepare(
      "INSERT INTO services (id, title, description, price, image_url, status, category, long_description, slug, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    ).bind(
      newId,
      service.title,
      service.description,
      service.price,
      service.image_url,
      service.status,
      service.category,
      service.long_description,
      newSlug,
      (/* @__PURE__ */ new Date()).toISOString()
    ).run();
    return new Response(JSON.stringify({ id: newId }), { status: 201, headers: corsHeaders });
  } else if (request.method === "PUT" && serviceId) {
    const service = await request.json();
    const newSlug = generateSlug(service.title);
    await env.DB.prepare(
      "UPDATE services SET title = ?, description = ?, price = ?, image_url = ?, status = ?, category = ?, long_description = ?, slug = ? WHERE id = ?"
    ).bind(
      service.title,
      service.description,
      service.price,
      service.image_url,
      service.status,
      service.category,
      service.long_description,
      newSlug,
      serviceId
    ).run();
    return new Response(JSON.stringify({ id: serviceId }), { status: 200, headers: corsHeaders });
  } else if (request.method === "DELETE" && serviceId) {
    await env.DB.prepare("DELETE FROM services WHERE id = ?").bind(serviceId).run();
    return new Response(null, { status: 204, headers: corsHeaders });
  }
  return new Response(JSON.stringify({ error: "Service route not found" }), { status: 404, headers: corsHeaders });
}
__name(handleServices, "handleServices");

// handlers/settings.js
async function handleSettings(request, env, ctx) {
  const corsHeaders = { "Access-Control-Allow-Origin": "*" };
  if (request.method === "GET") {
    const { results } = await env.DB.prepare("SELECT * FROM settings").all();
    return new Response(JSON.stringify(results), { status: 200, headers: corsHeaders });
  } else if (request.method === "PUT") {
    const { key, value } = await request.json();
    if (!key || value === void 0) {
      return new Response(JSON.stringify({ error: "Key and value are required" }), { status: 400, headers: corsHeaders });
    }
    await env.DB.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)").bind(key, value).run();
    return new Response(JSON.stringify({ message: "Setting updated successfully" }), { status: 200, headers: corsHeaders });
  }
  return new Response(JSON.stringify({ error: "Settings route not found or method not allowed" }), { status: 404, headers: corsHeaders });
}
__name(handleSettings, "handleSettings");

// handlers/admin.js
async function handleAdmin(request, env, ctx) {
  const url = new URL(request.url);
  const { pathname } = url;
  const corsHeaders = { "Access-Control-Allow-Origin": "*" };
  if (pathname.startsWith("/api/admin/posts")) {
    const pathParts = pathname.split("/").filter(Boolean);
    const postId = pathParts.length === 4 ? pathParts[3] : null;
    if (request.method === "GET") {
      if (postId) {
        const post = await env.DB.prepare("SELECT * FROM blog_posts WHERE id = ?").bind(postId).first();
        if (!post) return new Response(JSON.stringify({ error: "Post not found" }), { status: 404, headers: corsHeaders });
        return new Response(JSON.stringify(post), { status: 200, headers: corsHeaders });
      } else {
        const { results } = await env.DB.prepare("SELECT id, title, slug, status, created_at FROM blog_posts ORDER BY created_at DESC").all();
        return new Response(JSON.stringify(results), { status: 200, headers: corsHeaders });
      }
    } else if (request.method === "POST") {
      const postData = await request.json();
      const newPostId = `post_${Date.now()}`;
      const slug = postData.slug || generateSlug(postData.title);
      await env.DB.prepare(
        "INSERT INTO blog_posts (id, title, slug, content, meta_title, meta_description, featured_image_url, tags, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
      ).bind(
        newPostId,
        postData.title,
        slug,
        postData.content,
        postData.meta_title,
        postData.meta_description,
        postData.featured_image_url,
        JSON.stringify(postData.tags || []),
        postData.status,
        (/* @__PURE__ */ new Date()).toISOString()
      ).run();
      return new Response(JSON.stringify({ id: newPostId, message: "Post created successfully" }), { status: 201, headers: corsHeaders });
    } else if (request.method === "PUT" && postId) {
      const postData = await request.json();
      const slug = postData.slug || generateSlug(postData.title);
      await env.DB.prepare(
        "UPDATE blog_posts SET title = ?, slug = ?, content = ?, meta_title = ?, meta_description = ?, featured_image_url = ?, tags = ?, status = ? WHERE id = ?"
      ).bind(
        postData.title,
        slug,
        postData.content,
        postData.meta_title,
        postData.meta_description,
        postData.featured_image_url,
        JSON.stringify(postData.tags || []),
        postData.status,
        postId
      ).run();
      return new Response(JSON.stringify({ message: "Post updated successfully" }), { status: 200, headers: corsHeaders });
    } else if (request.method === "DELETE" && postId) {
      await env.DB.prepare("DELETE FROM blog_posts WHERE id = ?").bind(postId).run();
      return new Response(JSON.stringify({ message: "Post deleted successfully" }), { status: 200, headers: corsHeaders });
    }
  } else if (pathname.startsWith("/api/admin/reviews")) {
    const pathParts = pathname.split("/").filter(Boolean);
    const reviewId = pathParts.length > 3 ? pathParts[3] : null;
    if (request.method === "GET") {
      const { results } = await env.DB.prepare("SELECT id, orderId, serviceName, customerName, rating, comment, status, createdAt FROM reviews ORDER BY createdAt DESC").all();
      return new Response(JSON.stringify(results), { status: 200, headers: corsHeaders });
    } else if (request.method === "PUT" && reviewId) {
      const { status } = await request.json();
      if (!["pending", "approved"].includes(status)) {
        return new Response(JSON.stringify({ error: "Invalid status" }), { status: 400, headers: corsHeaders });
      }
      await env.DB.prepare("UPDATE reviews SET status = ? WHERE id = ?").bind(status, reviewId).run();
      return new Response(JSON.stringify({ message: "Review updated successfully" }), { status: 200, headers: corsHeaders });
    } else if (request.method === "DELETE" && reviewId) {
      await env.DB.prepare("DELETE FROM reviews WHERE id = ?").bind(reviewId).run();
      return new Response(JSON.stringify({ message: "Review deleted successfully" }), { status: 200, headers: corsHeaders });
    }
  }
  return new Response(JSON.stringify({ error: "Admin route not found" }), { status: 404, headers: corsHeaders });
}
__name(handleAdmin, "handleAdmin");

// handlers/posts.js
async function handlePosts(request, env, ctx) {
  const url = new URL(request.url);
  const { pathname } = url;
  const corsHeaders = { "Access-Control-Allow-Origin": "*" };
  const pathParts = pathname.split("/").filter(Boolean);
  const isSlugRoute = pathParts.length > 2 && pathParts[2] === "slug";
  const slug = isSlugRoute ? decodeURIComponent(pathParts.slice(3).join("/")) : null;
  if (request.method === "GET") {
    if (slug) {
      const post = await env.DB.prepare("SELECT * FROM blog_posts WHERE slug = ? AND status = 'published'").bind(slug).first();
      if (!post) {
        return new Response(JSON.stringify({ error: "Post not found or not published" }), { status: 404, headers: corsHeaders });
      }
      return new Response(JSON.stringify(post), { status: 200, headers: corsHeaders });
    } else {
      const { results } = await env.DB.prepare(
        "SELECT id, title, slug, meta_description, featured_image_url, created_at FROM blog_posts WHERE status = 'published' ORDER BY created_at DESC"
      ).all();
      return new Response(JSON.stringify(results), { status: 200, headers: corsHeaders });
    }
  }
  return new Response(JSON.stringify({ error: "Public posts route not found" }), { status: 404, headers: corsHeaders });
}
__name(handlePosts, "handlePosts");

// handlers/tickets.js
async function handleTickets(request, env, ctx) {
  const url = new URL(request.url);
  const { pathname } = url;
  const corsHeaders = { "Access-Control-Allow-Origin": "*" };
  const pathParts = pathname.split("/").filter(Boolean);
  let ticketId = pathParts.find((part) => part.startsWith("ticket_"));
  const isMessagesRoute = pathParts.includes("messages");
  if (request.method === "GET") {
    const userId = url.searchParams.get("userId");
    if (ticketId) {
      const ticketInfo = await env.DB.prepare("SELECT * FROM support_tickets WHERE id = ?").bind(ticketId).first();
      if (!ticketInfo) return new Response(JSON.stringify({ error: "Ticket not found" }), { status: 404, headers: corsHeaders });
      const { results: messages } = await env.DB.prepare("SELECT * FROM support_messages WHERE ticketId = ? ORDER BY createdAt ASC").bind(ticketId).all();
      return new Response(JSON.stringify({ ticket: ticketInfo, messages }), { status: 200, headers: corsHeaders });
    } else if (userId) {
      const { results } = await env.DB.prepare("SELECT * FROM support_tickets WHERE userId = ? ORDER BY updatedAt DESC").bind(userId).all();
      return new Response(JSON.stringify(results), { status: 200, headers: corsHeaders });
    } else {
      const { results } = await env.DB.prepare("SELECT * FROM support_tickets ORDER BY updatedAt DESC").all();
      return new Response(JSON.stringify(results), { status: 200, headers: corsHeaders });
    }
  } else if (request.method === "POST" && ticketId && isMessagesRoute) {
    const formData = await request.formData();
    const sender = formData.get("sender");
    const message = formData.get("message");
    const now = (/* @__PURE__ */ new Date()).toISOString();
    if (!sender || !message) {
      return new Response(JSON.stringify({ error: "Sender and message are required." }), { status: 400, headers: corsHeaders });
    }
    const messageData = {
      id: `msg_${Date.now()}`,
      ticketId,
      sender,
      message,
      attachmentUrl: null,
      createdAt: now
    };
    const attachmentFile = formData.get("attachment");
    if (attachmentFile && typeof attachmentFile.name === "string" && attachmentFile.name) {
      if (!env.RECEIPTS_BUCKET || !env.R2_PUBLIC_URL) throw new Error("R2 bucket for attachments is not configured.");
      const fileName = `attachments/${ticketId}/${Date.now()}-${attachmentFile.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      await env.RECEIPTS_BUCKET.put(fileName, attachmentFile.stream(), { httpMetadata: { contentType: attachmentFile.type } });
      messageData.attachmentUrl = `${env.R2_PUBLIC_URL.replace(/\/$/, "")}/${fileName}`;
    }
    await env.DB.prepare("INSERT INTO support_messages (id, ticketId, sender, message, attachmentUrl, createdAt) VALUES (?, ?, ?, ?, ?, ?)").bind(...Object.values(messageData)).run();
    await env.DB.prepare("UPDATE support_tickets SET updatedAt = ?, lastReplier = ? WHERE id = ?").bind(now, sender, ticketId).run();
    const ticketInfo = await env.DB.prepare("SELECT userId FROM support_tickets WHERE id = ?").bind(ticketId).first();
    if (sender === "admin" && ticketInfo) {
      if (ticketInfo.userId !== "guest-user") {
        const userInfo = await env.DB.prepare("SELECT email FROM users WHERE id = ?").bind(ticketInfo.userId).first();
        if (userInfo && userInfo.email) {
          ctx.waitUntil(sendEmailWithResend({ to: userInfo.email, subject: `\u0644\u062F\u064A\u0643 \u0631\u062F \u062C\u062F\u064A\u062F \u0639\u0644\u0649 \u062A\u0630\u0643\u0631\u062A\u0643 #${ticketId}`, html: getNewMessageNotificationHTML(ticketId) }, env));
        }
      }
    } else if (sender === "user") {
      ctx.waitUntil(sendEmailWithResend({ to: "support@khadamatmaroc.co.uk", subject: `\u0631\u062F \u062C\u062F\u064A\u062F \u0645\u0646 \u0645\u0633\u062A\u062E\u062F\u0645 \u0639\u0644\u0649 \u0627\u0644\u062A\u0630\u0643\u0631\u0629 #${ticketId}`, html: getNewMessageNotificationHTML(ticketId) }, env));
    }
    return new Response(JSON.stringify(messageData), { status: 201, headers: corsHeaders });
  } else if (request.method === "POST") {
    const formData = await request.formData();
    const newTicketId = `ticket_${Date.now()}`;
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const ticketData = {
      id: newTicketId,
      userId: formData.get("userId") || "guest-user",
      subject: formData.get("subject"),
      status: "open",
      createdAt: now,
      updatedAt: now,
      lastReplier: "user"
      // The user is the first replier
    };
    const messageData = {
      id: `msg_${Date.now()}`,
      ticketId: newTicketId,
      sender: "user",
      message: formData.get("message"),
      attachmentUrl: null,
      createdAt: now
    };
    const attachmentFile = formData.get("attachmentFile");
    if (attachmentFile && typeof attachmentFile.name === "string" && attachmentFile.name) {
      if (!env.RECEIPTS_BUCKET || !env.R2_PUBLIC_URL) throw new Error("R2 bucket for attachments is not configured.");
      const fileName = `attachments/${newTicketId}/${Date.now()}-${attachmentFile.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      await env.RECEIPTS_BUCKET.put(fileName, attachmentFile.stream(), { httpMetadata: { contentType: attachmentFile.type } });
      messageData.attachmentUrl = `${env.R2_PUBLIC_URL.replace(/\/$/, "")}/${fileName}`;
    }
    await env.DB.prepare("INSERT INTO support_tickets (id, userId, subject, status, createdAt, updatedAt, lastReplier) VALUES (?, ?, ?, ?, ?, ?, ?)").bind(...Object.values(ticketData)).run();
    await env.DB.prepare("INSERT INTO support_messages (id, ticketId, sender, message, attachmentUrl, createdAt) VALUES (?, ?, ?, ?, ?, ?)").bind(...Object.values(messageData)).run();
    const emailInfo = {
      userName: formData.get("name"),
      userEmail: formData.get("email")
    };
    const fullTicketInfoForEmail = { ...ticketData, ...emailInfo };
    ctx.waitUntil(sendEmailWithResend({ to: emailInfo.userEmail, subject: `\u062A\u0645 \u0627\u0633\u062A\u0644\u0627\u0645 \u062A\u0630\u0643\u0631\u062A\u0643 \u0631\u0642\u0645: ${ticketData.id}`, html: getSupportTicketConfirmationHTML(fullTicketInfoForEmail) }, env));
    ctx.waitUntil(sendEmailWithResend({ to: "support@khadamatmaroc.co.uk", subject: `\u062A\u0630\u0643\u0631\u0629 \u062F\u0639\u0645 \u062C\u062F\u064A\u062F\u0629: ${ticketData.subject}`, html: getAdminNewTicketNotificationHTML(fullTicketInfoForEmail) }, env));
    return new Response(JSON.stringify({ success: true, ticketId: newTicketId }), { status: 201, headers: corsHeaders });
  } else if (request.method === "PUT" && ticketId) {
    const { status } = await request.json();
    if (!["open", "closed"].includes(status)) return new Response(JSON.stringify({ error: "Invalid status" }), { status: 400, headers: corsHeaders });
    await env.DB.prepare("UPDATE support_tickets SET status = ?, updatedAt = ? WHERE id = ?").bind(status, (/* @__PURE__ */ new Date()).toISOString(), ticketId).run();
    return new Response(JSON.stringify({ message: "Ticket status updated" }), { status: 200, headers: corsHeaders });
  }
  return new Response(JSON.stringify({ error: "Ticket route not found" }), { status: 404, headers: corsHeaders });
}
__name(handleTickets, "handleTickets");

// handlers/subscribe.js
async function handleSubscribe(request, env, ctx) {
  const corsHeaders = { "Access-Control-Allow-Origin": "*" };
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: corsHeaders });
  }
  try {
    const { email } = await request.json();
    if (!email || !email.includes("@")) {
      return new Response(JSON.stringify({ error: "Please provide a valid email address." }), { status: 400, headers: corsHeaders });
    }
    await env.DB.prepare(
      "INSERT INTO subscribers (email, createdAt) VALUES (?, ?)"
    ).bind(email, (/* @__PURE__ */ new Date()).toISOString()).run();
    ctx.waitUntil(sendEmailWithResend({
      to: email,
      subject: "\u2705 \u062A\u0645 \u062A\u0623\u0643\u064A\u062F \u0627\u0634\u062A\u0631\u0627\u0643\u0643 \u0641\u064A \u0627\u0644\u0646\u0634\u0631\u0629 \u0627\u0644\u0628\u0631\u064A\u062F\u064A\u0629!",
      html: getSubscriptionConfirmationHTML()
    }, env));
    return new Response(JSON.stringify({ success: true, message: "Subscription successful!" }), { status: 201, headers: corsHeaders });
  } catch (e) {
    if (e.message.includes("UNIQUE constraint failed")) {
      return new Response(JSON.stringify({ error: "This email is already subscribed." }), { status: 409, headers: corsHeaders });
    }
    console.error("Subscription Error:", e);
    return new Response(JSON.stringify({ error: "An internal error occurred." }), { status: 500, headers: corsHeaders });
  }
}
__name(handleSubscribe, "handleSubscribe");

// handlers/reviews.js
async function handleReviews(request, env, ctx) {
  const corsHeaders = { "Access-Control-Allow-Origin": "*" };
  if (request.method === "POST") {
    try {
      const reviewData = await request.json();
      const newReviewId = `review_${Date.now()}`;
      if (!reviewData.orderId || !reviewData.serviceName || !reviewData.customerName || !reviewData.rating) {
        return new Response(JSON.stringify({ error: "Missing required review fields." }), { status: 400, headers: corsHeaders });
      }
      await env.DB.prepare(
        "INSERT INTO reviews (id, orderId, serviceName, customerName, rating, comment, status, createdAt) VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)"
      ).bind(
        newReviewId,
        reviewData.orderId,
        reviewData.serviceName,
        reviewData.customerName,
        reviewData.rating,
        reviewData.comment || "",
        // Ensure comment is not null
        (/* @__PURE__ */ new Date()).toISOString()
      ).run();
      return new Response(JSON.stringify({ success: true, reviewId: newReviewId }), { status: 201, headers: corsHeaders });
    } catch (e) {
      console.error("Review submission error:", e);
      return new Response(JSON.stringify({ error: "Failed to save review.", details: e.message }), { status: 500, headers: corsHeaders });
    }
  }
  if (request.method === "GET") {
    const { results } = await env.DB.prepare("SELECT serviceName, customerName, rating, comment FROM reviews WHERE status = 'approved' ORDER BY createdAt DESC").all();
    return new Response(JSON.stringify(results), { status: 200, headers: corsHeaders });
  }
  return new Response(JSON.stringify({ error: "Method not allowed for this route" }), { status: 405, headers: corsHeaders });
}
__name(handleReviews, "handleReviews");

// index.js
function withCors(response) {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    // يمكنك تغييره إلى نطاق موقعك فقط لمزيد من الأمان
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization"
  };
  if (!(response instanceof Response)) {
    response = new Response("Internal error", { status: 500 });
  }
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}
__name(withCors, "withCors");
var index_default = {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const { pathname } = url;
    if (request.method === "OPTIONS") {
      return withCors(new Response(null, { status: 204 }));
    }
    let response;
    try {
      if (pathname === "/api/send-verification-email") {
        response = await handleEmails(request, env, ctx);
      } else if (pathname === "/api/subscribe") {
        response = await handleSubscribe(request, env, ctx);
      } else if (pathname.startsWith("/api/reviews")) {
        response = await handleReviews(request, env, ctx);
      } else if (pathname.startsWith("/api/tickets") || pathname.startsWith("/tickets")) {
        response = await handleTickets(request, env, ctx);
      } else if (pathname.startsWith("/api/orders") || pathname.startsWith("/orders")) {
        response = await handleOrders(request, env, ctx);
      } else if (pathname.startsWith("/api/users") || pathname.startsWith("/users")) {
        response = await handleUsers(request, env, ctx);
      } else if (pathname.startsWith("/api/services") || pathname.startsWith("/services")) {
        response = await handleServices(request, env, ctx);
      } else if (pathname.startsWith("/api/posts")) {
        response = await handlePosts(request, env, ctx);
      } else if (pathname.startsWith("/api/settings") || pathname.startsWith("/settings")) {
        response = await handleSettings(request, env, ctx);
      } else if (pathname.startsWith("/api/admin/")) {
        response = await handleAdmin(request, env, ctx);
      } else {
        response = new Response(JSON.stringify({ error: "Route not found" }), { status: 404, headers: { "Content-Type": "application/json" } });
      }
    } catch (error) {
      console.error("Critical Error in Worker:", error.message, error.stack);
      response = new Response(JSON.stringify({ error: "Internal Server Error: " + error.message }), { status: 500, headers: { "Content-Type": "application/json" } });
    }
    return withCors(response);
  }
};
export {
  index_default as default
};
//# sourceMappingURL=index.js.map
