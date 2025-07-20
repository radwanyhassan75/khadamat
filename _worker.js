export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    if (url.pathname === '/api/dashboard-stats' && request.method === 'GET') {
      try {
        const db = env.DB;

        // مثال استعلام إحصائيات
        const statsQuery = `
          SELECT
            (SELECT COUNT(*) FROM orders) AS totalOrders,
            (SELECT IFNULL(SUM(price),0) FROM orders WHERE status = 'completed') AS totalRevenue,
            (SELECT COUNT(*) FROM tickets WHERE status = 'open') AS openTickets,
            (SELECT COUNT(*) FROM users) AS totalUsers;
        `;
        const statsResult = await db.prepare(statsQuery).first();

        // استعلام بيانات الرسم البياني
        const chartQuery = `
          SELECT
            strftime('%Y-%m', createdAt) AS month,
            IFNULL(SUM(price), 0) AS monthlyRevenue
          FROM orders
          WHERE createdAt >= date('now', '-6 months') AND status = 'completed'
          GROUP BY month ORDER BY month ASC;
        `;
        const chartResult = await db.prepare(chartQuery).all();

        const chartData = {
          labels: chartResult.results.map(r => r.month),
          data: chartResult.results.map(r => r.monthlyRevenue),
        };

        const dashboardData = {
          totalOrders: statsResult.totalOrders || 0,
          totalRevenue: statsResult.totalRevenue || 0,
          openTickets: statsResult.openTickets || 0,
          totalUsers: statsResult.totalUsers || 0,
          chart: chartData,
        };

        return new Response(JSON.stringify(dashboardData), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });

      } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }
    }

    return new Response('Not Found', { status: 404 });
  },
};
