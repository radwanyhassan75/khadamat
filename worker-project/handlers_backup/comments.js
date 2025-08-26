// File: handlers/comments.js
// Version 5.0: Final, most robust version. Removed itty-router for maximum stability.

/**
 * Verifies a Firebase ID token.
 * @param {string} token The Firebase ID token.
 * @param {object} env The Worker's environment.
 * @returns {Promise<object|null>} The user object or null.
 */
async function verifyFirebaseToken(token, env) {
    const FIREBASE_API_KEY = env.FIREBASE_API_KEY;
    if (!FIREBASE_API_KEY) {
        console.error("CRITICAL: FIREBASE_API_KEY secret is not set.");
        return null;
    }
    const url = `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_API_KEY}`;
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken: token })
        });
        const data = await response.json();
        if (!response.ok || data.error) return null;
        return data.users && data.users.length > 0 ? data.users[0] : null;
    } catch (error) {
        console.error("Error verifying token:", error);
        return null;
    }
}

/**
 * Fetches comments for a given service ID.
 * @param {Request} request The incoming request.
 * @param {object} env The Worker's environment.
 * @returns {Promise<Response>}
 */
async function getComments(request, env) {
    const { searchParams } = new URL(request.url);
    const serviceId = searchParams.get('serviceId');
    if (!serviceId) {
        return new Response(JSON.stringify({ error: 'Service ID is required' }), { status: 400 });
    }

    // 🚧 FUTURE: This query should be enhanced to join with the reactions table to return counts.
    const { results } = await env.DB.prepare(
        "SELECT id, authorName, authorAvatar, commentText, createdAt, parentId FROM service_comments WHERE serviceId = ? ORDER BY createdAt ASC"
    ).bind(serviceId).all();

    // Nest replies under their parent comments
    const commentsById = {};
    const topLevelComments = [];
    results.forEach(c => {
        commentsById[c.id] = { id: c.id, author: c.authorName, avatar: c.authorAvatar, text: c.commentText, date: c.createdAt, replies: [] };
    });
    results.forEach(c => {
        if (c.parentId && commentsById[c.parentId]) {
            commentsById[c.parentId].replies.push(commentsById[c.id]);
        } else {
            topLevelComments.push(commentsById[c.id]);
        }
    });

    return new Response(JSON.stringify(topLevelComments), { status: 200, headers: { 'Content-Type': 'application/json' } });
}

/**
 * Authenticates a user and adds a new comment.
 * @param {Request} request The incoming request.
 * @param {object} env The Worker's environment.
 * @returns {Promise<Response>}
 */
async function postComment(request, env) {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return new Response(JSON.stringify({ error: 'Authentication token required' }), { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    const user = await verifyFirebaseToken(token, env);
    if (!user) {
        return new Response(JSON.stringify({ error: 'Token is invalid or expired' }), { status: 403 });
    }

    const { serviceId, comment, parentId } = await request.json();
    if (!serviceId || !comment || comment.trim() === '') {
        return new Response(JSON.stringify({ error: 'Service ID and comment text are required' }), { status: 400 });
    }
    
    const authorName = user.displayName || 'User';
    const authorAvatar = user.photoUrl || `https://placehold.co/50x50/e9ecef/343a40?text=${authorName.charAt(0)}`;
    
    await env.DB.prepare(
        "INSERT INTO service_comments (serviceId, userId, authorName, authorAvatar, commentText, parentId) VALUES (?, ?, ?, ?, ?, ?)"
    ).bind(serviceId, user.localId, authorName, authorAvatar, comment.trim(), parentId || null).run();

    return new Response(JSON.stringify({ success: true }), { status: 201 });
}

/**
 * Authenticates a user and adds a reaction to a comment.
 * @param {Request} request The incoming request.
 * @param {object} env The Worker's environment.
 * @param {string} commentId The ID of the comment to react to.
 * @returns {Promise<Response>}
 */
async function postReaction(request, env, commentId) {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return new Response(JSON.stringify({ error: 'Authentication token required' }), { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    const user = await verifyFirebaseToken(token, env);
    if (!user) {
        return new Response(JSON.stringify({ error: 'Token is invalid or expired' }), { status: 403 });
    }
    
    const { reactionType } = await request.json();
    if (!reactionType) {
        return new Response(JSON.stringify({ error: 'Reaction type is required' }), { status: 400 });
    }

    try {
        await env.DB.prepare(
            "INSERT INTO comment_reactions (commentId, userId, reactionType) VALUES (?, ?, ?) ON CONFLICT(commentId, userId) DO NOTHING"
        ).bind(commentId, user.localId, reactionType).run();
        
        return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (e) {
        console.error("D1 Error reacting to comment:", e.message);
        return new Response(JSON.stringify({ error: 'Failed to add reaction' }), { status: 500 });
    }
}


/**
 * Main handler that routes requests based on method and URL path.
 * This is more robust than a router library for this simple case.
 * @param {Request} request The incoming request.
 * @param {object} env The Worker's environment.
 * @returns {Promise<Response>}
 */
export async function handleComments(request, env) {
    const { pathname } = new URL(request.url);
    
    // Check for database connection first
    if (!env.DB) {
        return new Response(JSON.stringify({ error: 'Database not configured' }), { status: 500 });
    }

    // Regex to match /api/comments/:id/react
    const reactionRoute = /^\/api\/comments\/(\d+)\/react$/;
    const match = pathname.match(reactionRoute);

    if (request.method === 'GET' && pathname === '/api/comments') {
        return getComments(request, env);
    }
    
    if (request.method === 'POST' && pathname === '/api/comments') {
        return postComment(request, env);
    }

    if (request.method === 'POST' && match) {
        const commentId = match[1]; // The first captured group from the regex
        return postReaction(request, env, commentId);
    }

    return new Response('Route not found in comments handler', { status: 404 });
}
