// File: handlers/admin.js

// نستورد وظيفة إنشاء الروابط لأنها تستخدم عند إنشاء وتعديل المقالات
import { generateSlug } from '../utils/slug.js';

export async function handleAdmin(request, env, ctx) {
    const url = new URL(request.url);
    const { pathname } = url;
    const corsHeaders = { "Access-Control-Allow-Origin": "*" };

    // --- Admin Posts Logic ---
    if (pathname.startsWith('/api/admin/posts')) {
        const pathParts = pathname.split('/').filter(Boolean);
        const postId = pathParts.length === 4 ? pathParts[3] : null;

        if (request.method === 'GET') {
            if (postId) {
                const post = await env.DB.prepare("SELECT * FROM blog_posts WHERE id = ?").bind(postId).first();
                if (!post) return new Response(JSON.stringify({ error: "Post not found" }), { status: 404, headers: corsHeaders });
                return new Response(JSON.stringify(post), { status: 200, headers: corsHeaders });
            } else {
                const { results } = await env.DB.prepare("SELECT id, title, slug, status, created_at FROM blog_posts ORDER BY created_at DESC").all();
                return new Response(JSON.stringify(results), { status: 200, headers: corsHeaders });
            }
        } 
        
        else if (request.method === 'POST') {
            const postData = await request.json();
            const newPostId = `post_${Date.now()}`;
            const slug = postData.slug || generateSlug(postData.title);
            
            await env.DB.prepare(
                "INSERT INTO blog_posts (id, title, slug, content, meta_title, meta_description, featured_image_url, tags, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
            ).bind(
                newPostId, postData.title, slug, postData.content, postData.meta_title, 
                postData.meta_description, postData.featured_image_url, 
                JSON.stringify(postData.tags || []), postData.status, new Date().toISOString()
            ).run();
            
            return new Response(JSON.stringify({ id: newPostId, message: "Post created successfully" }), { status: 201, headers: corsHeaders });
        } 
        
        else if (request.method === 'PUT' && postId) {
            const postData = await request.json();
            const slug = postData.slug || generateSlug(postData.title);
            
            await env.DB.prepare(
                "UPDATE blog_posts SET title = ?, slug = ?, content = ?, meta_title = ?, meta_description = ?, featured_image_url = ?, tags = ?, status = ? WHERE id = ?"
            ).bind(
                postData.title, slug, postData.content, postData.meta_title, 
                postData.meta_description, postData.featured_image_url, 
                JSON.stringify(postData.tags || []), postData.status, postId
            ).run();

            return new Response(JSON.stringify({ message: "Post updated successfully" }), { status: 200, headers: corsHeaders });
        } 
        
        else if (request.method === 'DELETE' && postId) {
            await env.DB.prepare("DELETE FROM blog_posts WHERE id = ?").bind(postId).run();
            return new Response(JSON.stringify({ message: "Post deleted successfully" }), { status: 200, headers: corsHeaders });
        }
    }

    // --- Admin Reviews Logic ---
    else if (pathname.startsWith('/api/admin/reviews')) {
        const pathParts = pathname.split('/').filter(Boolean);
        const reviewId = pathParts.length > 3 ? pathParts[3] : null;

        if (request.method === 'GET') {
            const { results } = await env.DB.prepare("SELECT id, orderId, serviceName, customerName, rating, comment, status, createdAt FROM reviews ORDER BY createdAt DESC").all();
            return new Response(JSON.stringify(results), { status: 200, headers: corsHeaders });
        } 
        
        else if (request.method === 'PUT' && reviewId) {
            const { status } = await request.json();
            if (!['pending', 'approved'].includes(status)) {
                return new Response(JSON.stringify({ error: "Invalid status" }), { status: 400, headers: corsHeaders });
            }
            await env.DB.prepare("UPDATE reviews SET status = ? WHERE id = ?").bind(status, reviewId).run();
            return new Response(JSON.stringify({ message: "Review updated successfully" }), { status: 200, headers: corsHeaders });
        } 
        
        else if (request.method === 'DELETE' && reviewId) {
            await env.DB.prepare("DELETE FROM reviews WHERE id = ?").bind(reviewId).run();
            return new Response(JSON.stringify({ message: "Review deleted successfully" }), { status: 200, headers: corsHeaders });
        }
    }

    // fallback for any unhandled admin routes
    return new Response(JSON.stringify({ error: "Admin route not found" }), { status: 404, headers: corsHeaders });
}