export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // دالة للتعامل مع CORS
    function handleOptions() {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    // التعامل مع طلبات OPTIONS أولاً
    if (request.method === 'OPTIONS') {
      return handleOptions();
    }

    // توجيه الطلب إلى الرابط الصحيح الذي تطلبه لوحة التحكم
    if (url.pathname === '/api/dashboard-stats') {
      if (request.method === 'GET') {
        try {
          const db = env.DB;
          
          // استعلامات SQL لجمع البيانات
          const statsQuery = `
            SELECT
              (SELECT COUNT(*) FROM orders) as totalOrders,
              (SELECT SUM(price) FROM orders WHERE status = 'completed') as totalRevenue,
              (SELECT COUNT(*) FROM tickets WHERE status = 'open') as openTickets,
              (SELECT COUNT(*) FROM users) as totalUsers;
          `;
          const statsResult = await db.prepare(statsQuery).first();

          const chartQuery = `
            SELECT
              strftime('%Y-%m', createdAt) as month,
              SUM(price) as monthlyRevenue
            FROM orders
            WHERE createdAt >= strftime('%Y-%m-%d %H:%M:%S', date('now', '-6 months')) AND status = 'completed'
            GROUP BY month ORDER BY month ASC;
          `;
          const chartResult = await db.prepare(chartQuery).all();
          
          const chartData = {
              labels: chartResult.results.map(row => row.month),
              data: chartResult.results.map(row => row.monthlyRevenue)
          };
          
          // تجميع كل البيانات في رد واحد
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

        } catch (e) {
          console.error("Database Error:", e);
          return new Response(JSON.stringify({ error: "Failed to fetch statistics", details: e.message }), { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
        }
      }
    }

    // إذا لم يتم العثور على المسار
    return new Response('Not Found', { status: 404 });
  },
};