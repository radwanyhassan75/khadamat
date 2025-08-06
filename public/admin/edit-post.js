// edit-post.js

document.addEventListener('DOMContentLoaded', () => {
    const WORKER_URL = 'https://orders-worker.radwanyhassan75.workers.dev';
    const form = document.getElementById('post-form');
    const pageTitle = document.getElementById('page-title');
    const titleInput = document.getElementById('title');
    const slugInput = document.getElementById('slug');
    
    let editorInitialized = false;

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
        content_style: 'body { font-family: Cairo, Arial, sans-serif; font-size: 16px; direction: rtl; }',
        setup: function (editor) {
            editor.on('init', function () {
                editorInitialized = true;
                loadPostData(); // لا تقم بتحميل البيانات إلا بعد تهيئة المحرر
            });
        }
    });

    // --- 2. إنشاء الـ Slug تلقائيًا ---
    function generateSlug(text) {
        return text.toString().toLowerCase()
            .replace(/\s+/g, '-')           // استبدال المسافات بـ -
            .replace(/[^\w\-]+/g, '')       // إزالة كل الأحرف غير الكلمات
            .replace(/\-\-+/g, '-')         // استبدال الشرطات المتعددة بواحدة
            .replace(/^-+/, '')             // إزالة الشرطات من البداية
            .replace(/-+$/, '');            // إزالة الشرطات من النهاية
    }

    titleInput.addEventListener('keyup', () => {
        slugInput.value = generateSlug(titleInput.value);
    });

    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');

    // --- 3. تحميل بيانات المقال في وضع التعديل ---
    async function loadPostData() {
        if (postId && editorInitialized) {
            pageTitle.textContent = 'تعديل المقال';
            try {
                const response = await fetch(`${WORKER_URL}/api/posts/${postId}`);
                if (!response.ok) throw new Error('لم يتم العثور على المقال');
                const post = await response.json();

                // تعبئة الحقول بالبيانات القادمة من الخادم
                titleInput.value = post.title || '';
                slugInput.value = post.slug || '';
                tinymce.get('content-editor').setContent(post.content || '');
                document.getElementById('status').value = post.status || 'draft';
                document.getElementById('featured_image_url').value = post.featured_image_url || '';
                document.getElementById('tags').value = post.tags || '';
                // لا تنس تعبئة حقول SEO إذا كانت موجودة في النموذج
                // document.getElementById('meta_title').value = post.meta_title || '';
                // document.getElementById('meta_description').value = post.meta_description || '';

            } catch (error) {
                alert(`خطأ في تحميل البيانات: ${error.message}`);
            }
        }
    }

    // --- 4. برمجة زر "حفظ المقال" ---
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // ✅ تجميع كل البيانات من النموذج، بما في ذلك حقول SEO
        const postData = {
            title: titleInput.value,
            slug: slugInput.value,
            content: tinymce.get('content-editor').getContent(),
            status: document.getElementById('status').value,
            featured_image_url: document.getElementById('featured_image_url').value,
            tags: document.getElementById('tags').value,
            // افترض أن لديك حقول meta في HTML
            meta_title: document.getElementById('meta_title') ? document.getElementById('meta_title').value : '',
            meta_description: document.getElementById('meta_description') ? document.getElementById('meta_description').value : ''
        };

        const method = postId ? 'PUT' : 'POST';
        const endpoint = postId ? `${WORKER_URL}/api/posts/${postId}` : `${WORKER_URL}/api/posts`;

        try {
            const response = await fetch(endpoint, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(postData),
            });

            if (!response.ok) {
                const errorResult = await response.json();
                throw new Error(errorResult.error || 'فشل حفظ المقال');
            }

            alert('تم حفظ المقال بنجاح!');
            window.location.href = 'manage-blog.html';

        } catch (error) {
            console.error('Error saving post:', error);
            alert(`حدث خطأ: ${error.message}`);
        }
    });
});
