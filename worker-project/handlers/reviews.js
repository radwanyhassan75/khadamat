// File: handlers/reviews.js

export async function handleReviews(request, env, ctx) {
    const corsHeaders = { "Access-Control-Allow-Origin": "*" };

    if (request.method === 'POST') {
        try {
            const reviewData = await request.json();
            const newReviewId = `review_${Date.now()}`;

            // Basic validation
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
                reviewData.comment || '', // Ensure comment is not null
                new Date().toISOString()
            ).run();

            return new Response(JSON.stringify({ success: true, reviewId: newReviewId }), { status: 201, headers: corsHeaders });
        } catch (e) {
            console.error("Review submission error:", e);
            return new Response(JSON.stringify({ error: "Failed to save review.", details: e.message }), { status: 500, headers: corsHeaders });
        }
    }

    // For public GET requests, you might want to show approved reviews
    if (request.method === 'GET') {
        const { results } = await env.DB.prepare("SELECT serviceName, customerName, rating, comment FROM reviews WHERE status = 'approved' ORDER BY createdAt DESC").all();
        return new Response(JSON.stringify(results), { status: 200, headers: corsHeaders });
    }

    return new Response(JSON.stringify({ error: "Method not allowed for this route" }), { status: 405, headers: corsHeaders });
}
