// File: handlers/posts.js

export async function handlePosts(request, env, ctx) {
    const url = new URL(request.url);
    const { pathname } = url;
    const corsHeaders = { "Access-Control-Allow-Origin": "*" };

    const pathParts = pathname.split('/').filter(Boolean);
    
    // تحديد ما إذا كان الطلب يبحث عن مقال معين عبر رابطه (slug)
    const isSlugRoute = pathParts.length > 2 && pathParts[2] === 'slug';
    const slug = isSlugRoute ? decodeURIComponent(pathParts.slice(3).join('/')) : null;

    if (request.method === 'GET') {
        if (slug) {
            // جلب مقال واحد بناءً على رابطه
            const post = await env.DB.prepare("SELECT * FROM blog_posts WHERE slug = ? AND status = 'published'").bind(slug).first();
            
            if (!post) {
                return new Response(JSON.stringify({ error: "Post not found or not published" }), { status: 404, headers: corsHeaders });
            }
            return new Response(JSON.stringify(post), { status: 200, headers: corsHeaders });

        } else {
            // جلب قائمة مختصرة بكل المقالات المنشورة
            const { results } = await env.DB.prepare(
                "SELECT id, title, slug, meta_description, featured_image_url, created_at FROM blog_posts WHERE status = 'published' ORDER BY created_at DESC"
            ).all();
            return new Response(JSON.stringify(results), { status: 200, headers: corsHeaders });
        }
    }

    return new Response(JSON.stringify({ error: "Public posts route not found" }), { status: 404, headers: corsHeaders });
}