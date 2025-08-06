// manage-blog.js

document.addEventListener('DOMContentLoaded', () => {
    /**
     * الدالة الرئيسية التي تقوم بتهيئة كل وظائف الصفحة.
     * سيتم استدعاؤها بعد التحقق من تسجيل دخول المسؤول.
     */
    function initializePage() {
        // تفعيل أيقونات Lucide في الصفحة
        lucide.createIcons();
        
        // تعريف المتغيرات الأساسية
        const WORKER_URL = 'https://orders-worker.radwanyhassan75.workers.dev';
        const postsList = document.getElementById('posts-list');

        /**
         * تقوم هذه الدالة بجلب قائمة المقالات من الخادم (Worker).
         * هي تستدعي الرابط المخصص للمسؤولين الذي يعرض كل المقالات (بما في ذلك المسودات).
         */
        async function fetchPosts() {
            try {
                const response = await fetch(`${WORKER_URL}/api/admin/posts`);
                if (!response.ok) {
                    const errorData = await response.text();
                    throw new Error(`فشل في جلب المقالات: ${response.statusText} - ${errorData}`);
                }
                const posts = await response.json();
                renderPosts(posts);
            } catch (error) {
                console.error('Error fetching posts:', error);
                postsList.innerHTML = `<tr><td colspan="5" class="p-6 text-center text-red-500">حدث خطأ أثناء تحميل المقالات. الرجاء التحقق من الـ Console.</td></tr>`;
            }
        }

        /**
         * تقوم هذه الدالة بعرض المقالات في جدول HTML.
         * @param {Array} posts - مصفوفة من المقالات القادمة من الخادم.
         */
        function renderPosts(posts) {
            postsList.innerHTML = ''; // مسح رسالة "جاري التحميل"
            if (!posts || posts.length === 0) {
                postsList.innerHTML = `<tr><td colspan="5" class="p-6 text-center text-gray-500">لم يتم إنشاء أي مقالات بعد. اضغط على "إنشاء مقال جديد" للبدء.</td></tr>`;
                return;
            }

            posts.forEach(post => {
                const statusClass = post.status === 'published' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800';
                
                const row = document.createElement('tr');
                row.className = "hover:bg-gray-50 transition-colors";
                row.innerHTML = `
                    <td class="p-4 font-semibold text-gray-800">${post.title}</td>
                    <td class="p-4 text-gray-600">${post.author_name || 'Admin'}</td>
                    <td class="p-4 text-xs">
                        <span class="px-2 py-1 font-semibold leading-tight rounded-full ${statusClass}">
                            ${post.status === 'published' ? 'منشور' : 'مسودة'}
                        </span>
                    </td>
                    <td class="p-4 text-gray-500">${new Date(post.created_at).toLocaleDateString('ar-EG')}</td>
                    <td class="p-4 space-x-2 space-x-reverse whitespace-nowrap">
                        <a href="edit-post.html?id=${post.id}" class="text-indigo-600 hover:text-indigo-900 font-semibold">تعديل</a>
                        <button data-id="${post.id}" class="delete-btn text-red-600 hover:text-red-900 font-semibold">حذف</button>
                    </td>
                `;
                postsList.appendChild(row);
            });
        }

        /**
         * تفعيل زر الحذف باستخدام تقنية "تفويض الأحداث" (Event Delegation).
         * هذا يعني أننا نراقب النقرات على الجدول بأكمله بدلاً من كل زر على حدة.
         */
        postsList.addEventListener('click', async (e) => {
            if (e.target.classList.contains('delete-btn')) {
                const postId = e.target.dataset.id;
                if (confirm('هل أنت متأكد أنك تريد حذف هذا المقال؟ لا يمكن التراجع عن هذا الإجراء.')) {
                    try {
                        const response = await fetch(`${WORKER_URL}/api/posts/${postId}`, { method: 'DELETE' });
                        if (!response.ok) {
                             throw new Error('فشل حذف المقال');
                        }
                        fetchPosts(); // إعادة تحميل القائمة بعد الحذف الناجح
                    } catch (error) {
                        console.error('Error deleting post:', error);
                        alert(`حدث خطأ أثناء الحذف: ${error.message}`);
                    }
                }
            }
        });

        // استدعاء الدالة الرئيسية لجلب المقالات عند تحميل الصفحة
        fetchPosts();
    }

    // هذا الكود يضمن أن صفحتك لن تعمل إلا بعد التحقق من كلمة المرور
    // هو يتكامل مع ملف `admin-auth.js` الخاص بك
    if (typeof showContent === 'function') {
        // نجعل الدالة متاحة لملف الحماية ليقوم باستدعائها
        window.initializePage = initializePage;
    } else {
        // في حال عدم وجود ملف الحماية، يتم تشغيل الصفحة مباشرة (للتجربة)
        initializePage();
    }
});
