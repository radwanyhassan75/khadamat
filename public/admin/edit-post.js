// edit-post.js

document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    const WORKER_URL = 'https://orders-worker.radwanyhassan75.workers.dev';

    const form = document.getElementById('post-form');
    const titleInput = document.getElementById('title');
    const slugInput = document.getElementById('slug');
    const pageTitle = document.getElementById('page-title');

    // --- 1. تهيئة محرر النصوص TinyMCE ---
    tinymce.init({
        selector: '#content-editor',
        plugins: 'preview importcss searchreplace autolink autosave save directionality code visualblocks visualchars fullscreen image link media template codesample table charmap pagebreak nonbreaking anchor insertdatetime advlist lists wordcount help charmap quickbars emoticons',
        menubar: 'file edit view insert format tools table help',
        toolbar: 'undo redo | bold italic underline strikethrough | fontfamily fontsize blocks | alignleft aligncenter alignright alignjustify | outdent indent |  numlist bullist | forecolor backcolor removeformat | pagebreak | charmap emoticons | fullscreen  preview save print | insertfile image media template link anchor codesample | ltr rtl',
        autosave_ask_before_unload: true,
        height: 600,
        language: 'ar',
        directionality: 'rtl',
        content_style: 'body { font-family: Cairo, Arial, sans-serif; font-size: 16px; direction: rtl; }'
    });

    // --- 2. إنشاء الـ Slug تلقائيًا من العنوان ---
    function generateSlug(text) {
        return text.toString().toLowerCase()
            .replace(/\s+/g, '-')           // Replace spaces with -
            .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
            .replace(/\-\-+/g, '-')         // Replace multiple - with single -
            .replace(/^-+/, '')             // Trim - from start of text
            .replace(/-+$/, '');            // Trim - from end of text
    }

    titleInput.addEventListener('keyup', () => {
        slugInput.value = generateSlug(titleInput.value);
    });

    // --- 3. التحقق إذا كنا في وضع "التعديل" أو "الإنشاء" ---
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');

    if (postId) {
        pageTitle.textContent = 'تعديل المقال';
        // (سنضيف كود تحميل بيانات المقال هنا لاحقًا)
    }

    // --- 4. برمجة زر "حفظ المقال" ---
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const postData = {
            id: postId, // سيكون null إذا كان مقالاً جديداً
            title: titleInput.value,
            slug: slugInput.value,
            content: tinymce.get('content-editor').getContent(),
            status: document.getElementById('status').value,
            featured_image_url: document.getElementById('featured_image_url').value,
            tags: document.getElementById('tags').value,
            // (سنضيف بيانات المؤلف و SEO هنا لاحقًا)
        };

        try {
            // تحديد إذا كنا سنقوم بإنشاء (POST) أو تحديث (PUT)
            const method = postId ? 'PUT' : 'POST';
            const endpoint = postId ? `${WORKER_URL}/api/posts/${postId}` : `${WORKER_URL}/api/posts`;

            const response = await fetch(endpoint, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(postData),
            });

            if (!response.ok) {
                const errorResult = await response.json();
                throw new Error(errorResult.error || 'فشل حفظ المقال');
            }

            // نجاح!
            alert('تم حفظ المقال بنجاح!');
            window.location.href = 'manage-blog.html'; // العودة إلى قائمة المقالات

        } catch (error) {
            console.error('Error saving post:', error);
            alert(`حدث خطأ: ${error.message}`);
        }
    });
});