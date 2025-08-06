// manage-blog.js

document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    
    // تأكد من أن هذا هو عنوان الـ Worker الصحيح
    const WORKER_URL = 'https://orders-worker.radwanyhassan75.workers.dev';
    const postsList = document.getElementById('posts-list');

    async function fetchPosts() {
        try {
            // سنستخدم endpoint جديد للمسؤولين يجلب كل المقالات (بما فيها المسودات)
            const response = await fetch(`${WORKER_URL}/api/admin/posts`);
            if (!response.ok) {
                throw new Error('فشل في جلب المقالات');
            }
            const posts = await response.json();
            renderPosts(posts);
        } catch (error) {
            console.error('Error fetching posts:', error);
            postsList.innerHTML = `<tr><td colspan="5" class="p-6 text-center text-red-500">حدث خطأ أثناء تحميل المقالات.</td></tr>`;
        }
    }

    function renderPosts(posts) {
        postsList.innerHTML = '';
        if (posts.length === 0) {
            postsList.innerHTML = `<tr><td colspan="5" class="p-6 text-center text-gray-500">لم يتم إنشاء أي مقالات بعد.</td></tr>`;
            return;
        }

        posts.forEach(post => {
            const statusClass = post.status === 'published' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800';
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="p-4 font-semibold text-gray-800">${post.title}</td>
                <td class="p-4 text-gray-600">${post.author_name || 'غير محدد'}</td>
                <td class="p-4 text-xs"><span class="px-2 py-1 font-semibold leading-tight rounded-full ${statusClass}">${post.status === 'published' ? 'منشور' : 'مسودة'}</span></td>
                <td class="p-4 text-gray-500">${new Date(post.created_at).toLocaleDateString('ar-EG')}</td>
                <td class="p-4 space-x-2 space-x-reverse">
                    <a href="edit-post.html?id=${post.id}" class="text-indigo-600 hover:text-indigo-900">تعديل</a>
                    <button data-id="${post.id}" class="delete-btn text-red-600 hover:text-red-900">حذف</button>
                </td>
            `;
            postsList.appendChild(row);
        });
    }

    fetchPosts();
});