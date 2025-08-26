// File: handlers/users.js

export async function handleUsers(request, env, ctx) {
    const url = new URL(request.url);
    const { pathname } = url;
    const corsHeaders = { "Access-Control-Allow-Origin": "*" };

    const pathParts = pathname.split('/').filter(Boolean);
    const isStatusCheck = pathParts[pathParts.length - 1] === 'status';
    const userId = pathParts.length > 1 && !isStatusCheck ? pathParts[pathParts.length - 1] : (isStatusCheck ? pathParts[pathParts.length - 2] : null);

    if (request.method === "GET" && userId && isStatusCheck) {
        try {
            const user = await env.DB.prepare("SELECT role FROM users WHERE id = ?").bind(userId).first();
            if (user && user.role === 'admin') {
                return new Response(JSON.stringify({ isAdmin: true }), { status: 200, headers: corsHeaders });
            }
            return new Response(JSON.stringify({ isAdmin: false }), { status: 200, headers: corsHeaders });
        } catch (error) {
            console.error("User status check error:", error);
            return new Response(JSON.stringify({ isAdmin: false }), { status: 500, headers: corsHeaders });
        }
    }

    else if (request.method === "GET" && !userId) { // جلب كل المستخدمين
        const defaultPicture = 'https://via.placeholder.com/150';
        const { results } = await env.DB.prepare(
            "SELECT u.id, u.email, u.displayName, u.createdAt, u.status, COALESCE(u.profilePicture, ?) as profilePicture, COUNT(o.id) as totalOrders FROM users u LEFT JOIN orders o ON u.id = o.userId GROUP BY u.id ORDER BY u.createdAt DESC"
        ).bind(defaultPicture).all();
        return new Response(JSON.stringify(results), { status: 200, headers: corsHeaders });
    }

    else if (request.method === "POST") { // إنشاء مستخدم جديد
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
                new Date().toISOString(), 
                newUser.profilePicture || 'https://via.placeholder.com/150',
                newUser.provider || 'email'
            ).run();
            
            return new Response(JSON.stringify({ success: true, message: "User created successfully" }), { status: 201, headers: corsHeaders });
        } catch (error) {
            console.error('Error creating user:', error);
            return new Response(JSON.stringify({ error: "Failed to create user: " + error.message }), { status: 500, headers: corsHeaders });
        }
    }
    
    else if (request.method === "PUT" && userId) { // تحديث بيانات مستخدم
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
    }
    
    else if (request.method === "DELETE" && userId) { // حذف مستخدم
        await env.DB.prepare("DELETE FROM users WHERE id = ?").bind(userId).run();
        return new Response(JSON.stringify({ message: "User deleted successfully" }), { status: 200, headers: corsHeaders });
    }

    // fallback
    return new Response(JSON.stringify({ error: "User route not found" }), { status: 404, headers: corsHeaders });
}