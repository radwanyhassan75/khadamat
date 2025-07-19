/**
 * =================================================================
 * Cloudflare Worker المتكامل - النسخة النهائية والمُصحَّحة
 * =================================================================
 */

// الكائن الذكي (Durable Object) يبقى كما هو
export class ChatRoom {
  constructor(state, env) { this.state = state; this.sessions = []; this.messages = []; }
  async fetch(request) {
    await this.loadMessages();
    const upgradeHeader = request.headers.get('Upgrade');
    if (!upgradeHeader || upgradeHeader !== 'websocket') { return new Response('Expected Upgrade: websocket', { status: 426 }); }
    const webSocketPair = new WebSocketPair();
    const [client, server] = Object.values(webSocketPair);
    server.accept(); this.handleSession(server);
    return new Response(null, { status: 101, webSocket: client });
  }
  handleSession(webSocket) {
    this.sessions.push(webSocket);
    webSocket.send(JSON.stringify({ type: 'history', messages: this.messages }));
    webSocket.addEventListener('message', async (event) => {
      try {
        const messageData = JSON.parse(event.data);
        this.messages.push(messageData);
        this.broadcast(JSON.stringify({ type: 'message', data: messageData }));
        await this.saveMessage(messageData);
      } catch (err) { webSocket.send(JSON.stringify({ error: 'Invalid message format' })); }
    });
    webSocket.addEventListener('close', () => { this.sessions = this.sessions.filter(s => s !== webSocket); });
  }
  broadcast(message) { this.sessions.forEach(s => { try { s.send(message); } catch (e) {} }); }
  async loadMessages() { this.messages = (await this.state.storage.get('messages')) || []; }
  async saveMessage() { await this.state.storage.put('messages', this.messages); }
}

// --- الدوال المساعدة ---

function handleOptions(request) {
    const headers = {
        'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    };
    return new Response(null, { headers });
}

async function handleOrderSubmission(request, env) {
    const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx1aw4fSnaCW7NLsRvo4LePSgJpx394lXGvPgNhTfwH0FCLx8JnmwRNeWUj828xoZy1TQ/exec";
    const SUCCESS_URL = "https://khadamat.pages.dev/success.html";

    try {
        const formData = await request.formData();
        const body = Object.fromEntries(formData);

        // 1. كتابة الطلب في D1 (مع كل الحقول)
        if (!env.DB) throw new Error("Database binding 'DB' not found.");
        const ps = env.DB.prepare(
          "INSERT INTO orders (id, userId, customerName, email, phone, serviceName, price, serviceDetails, serviceLink, paymentMethod, receiptUrl, status, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
        ).bind(
          body.orderId, body.userId, body.customerName, body.email, body.phone,
          body.serviceName, body.price, body.serviceDetails, body.serviceLink,
          body.paymentMethod, body.receiptUrl || '', 'جاري المعالجة', body.createdAt
        );
        await ps.run();

        // 2. إرسال نسخة إلى Google Sheet (يعمل في الخلفية)
        const googlePromise = fetch(GOOGLE_SCRIPT_URL, { method: 'POST', body: JSON.stringify({ postData: { contents: JSON.stringify(body) } }), headers: { 'Content-Type': 'application/json' } });
        request.waitUntil(googlePromise);

        // 3. إنشاء رابط النجاح وإرجاع الاستجابة
        const successParams = new URLSearchParams({
            orderId: body.orderId, serviceName: body.serviceName, paymentAmount: body.price
        });
        const successUrlWithId = `${SUCCESS_URL}?${successParams.toString()}`;

        return new Response(JSON.stringify({ success: true, redirectUrl: successUrlWithId }), {
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });

    } catch (error) {
        console.error('Worker Error:', error.message);
        return new Response(JSON.stringify({ success: false, error: 'Failed to process form: ' + error.message }), {
            status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
    }
}

// --- العامل الرئيسي (الموجه) ---
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname.slice(1).split('/');

    if (request.method === 'OPTIONS') { return handleOptions(request); }

    // --- مسار تقديم طلب جديد ---
    if (path[0] === 'api' && path[1] === 'submit-order' && request.method === 'POST') {
        return handleOrderSubmission(request, env);
    }

    // --- مسار جلب طلبات مستخدم معين ---
    if (path[0] === 'api' && path[1] === 'my-orders' && path[2]) {
        const userId = path[2];
        try {
            if (!env.DB) throw new Error("Database binding not found.");
            const { results } = await env.DB.prepare("SELECT * FROM orders WHERE userId = ? ORDER BY createdAt DESC").bind(userId).all();
            return new Response(JSON.stringify(results), { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }});
        } catch (e) {
            return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } });
        }
    }

    // --- START: NEW DASHBOARD STATS ENDPOINT ---
    // --- المسار الجديد لجلب إحصائيات لوحة التحكم ---
    if (path[0] === 'api' && path[1] === 'dashboard-stats' && request.method === 'GET') {
        try {
            const db = env.DB;

            // 1. الاستعلام عن الإحصائيات الرئيسية
            const statsQuery = `
                SELECT
                    (SELECT COUNT(*) FROM orders) as totalOrders,
                    (SELECT SUM(price) FROM orders WHERE status = 'completed') as totalRevenue,
                    (SELECT COUNT(*) FROM support_tickets WHERE status = 'open') as openTickets,
                    (SELECT COUNT(*) FROM users) as totalUsers;
            `;
            const statsResult = await db.prepare(statsQuery).first();

            // 2. الاستعلام عن بيانات المبيان (الإيرادات لآخر 6 أشهر)
            const chartQuery = `
                SELECT
                    strftime('%Y-%m', created_at) as month,
                    SUM(price) as monthlyRevenue
                FROM orders
                WHERE created_at >= strftime('%Y-%m-%d %H:%M:%S', date('now', '-6 months')) AND status = 'completed'
                GROUP BY month
                ORDER BY month ASC;
            `;
            const chartResult = await db.prepare(chartQuery).all();

            // تنظيم بيانات المبيان
            const chartData = {
                labels: chartResult.results.map(row => row.month),
                data: chartResult.results.map(row => row.monthlyRevenue)
            };

            // 3. تجميع كل البيانات في رد واحد
            const dashboardData = {
                totalOrders: statsResult.totalOrders || 0,
                totalRevenue: statsResult.totalRevenue || 0,
                openTickets: statsResult.openTickets || 0,
                totalUsers: statsResult.totalUsers || 0,
                chart: chartData
            };

            return new Response(JSON.stringify(dashboardData), {
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
            });

        } catch (error) {
            console.error("Error fetching dashboard stats:", error);
            return new Response(JSON.stringify({ error: 'Failed to fetch dashboard statistics' }), { status: 500 });
        }
    }
    // --- END: NEW DASHBOARD STATS ENDPOINT ---


    // --- مسار الدردشة ---
    if (path[0] === 'chat' && path[1]) {
        const chatRoomId = path[1];
        let id = env.CHAT_ROOM.idFromName(chatRoomId);
        let roomObject = env.CHAT_ROOM.get(id);
        return roomObject.fetch(request);
    }

    return new Response('Not Found', { status: 404 });
  },
};