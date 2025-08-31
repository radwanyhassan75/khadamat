import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://dlzmyxsycjzedhuqzvpg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsem15eHN5Y2p6ZWRodXF6dnBnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxNTI5ODAsImV4cCI6MjA3MTcyODk4MH0.d8Mk01dOUWyOV3wLWM2NIYFzZhN_azr9S4kOZFA6ZvA';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        detectSessionInUrl: true,
        autoRefreshToken: true,
        persistSession: true
    }
});

window.supabase = supabase;

// جعل الدالة متاحة عالميًا ليتم استدعاؤها من صفحات HTML
window.signInWithProvider = async function(provider) {
    const { error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
            redirectTo: `${window.location.origin}/dashboard.html`,
            // هذا السطر هو الحل لمشكلة جوجل
            queryParams: {
                prompt: 'select_account',
            }
        }
    });
    if (error) {
        alert("فشل تسجيل الدخول: " + error.message);
        console.error("OAuth Error:", error);
    }
}

// ... (بقية كود onAuthStateChange وتحديث الواجهة يبقى كما هو في الإصدارات السابقة)
supabase.auth.onAuthStateChange((event, session) => {
    const user = session?.user || null;
    const navbarActions = document.getElementById('navbar-actions');
    if (!navbarActions) return;
    if (user) {
        navbarActions.innerHTML = `<a href="dashboard.html" class="btn btn-primary">لوحة التحكم</a>`;
    } else {
        navbarActions.innerHTML = `<a href="login.html" class="btn btn-secondary">تسجيل الدخول</a><a href="register.html" class="btn btn-primary">إنشاء حساب</a>`;
    }

    const currentPage = window.location.pathname.split('/').pop();
    const isProtectedPage = ['dashboard.html'].includes(currentPage);
    const isAuthPage = ['login.html', 'register.html'].includes(currentPage);
    if (user && isAuthPage) window.location.href = '/dashboard.html';
    if (!user && isProtectedPage) window.location.href = '/login.html';
});