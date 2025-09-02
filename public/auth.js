import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://dlzmyxsycjzedhuqzvpg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsem15eHN5Y2p6ZWRodXF6dnBnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxNTI5ODAsImV4cCI6MjA3MTcyODk4MH0.d8Mk01dOUWyOV3wLWM2NIYFzZhN_azr9S4kOZFA6ZvA';

// ✅ === التعديل هنا ===
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        detectSessionInUrl: true,
        autoRefreshToken: true,
        persistSession: true
    }
});

window.supabase = supabase; // يمكنك إبقاء هذا السطر للاحتياط

// --- دالة تحديث أزرار الهيدر ---
function updateAuthButtons(user) {
    const navbarActions = document.getElementById('navbar-actions');
    if (!navbarActions) return;
    if (user) {
        navbarActions.innerHTML = `
            <a href="dashboard.html" class="btn btn-primary">لوحة التحكم</a>
            <button id="logout-button" class="btn btn-secondary" style="border-color: #dc3545; color: #dc3545;">تسجيل الخروج</button>
        `;
        document.getElementById('logout-button').addEventListener('click', () => supabase.auth.signOut().then(() => window.location.href = "/index.html"));
    } else {
        navbarActions.innerHTML = `
            <a href="login.html" class="btn btn-secondary">تسجيل الدخول</a>
            <a href="register.html" class="btn btn-primary">إنشاء حساب</a>
        `;
    }
}

// --- دالة تسجيل الدخول عبر المزودين ---
window.signInWithProvider = async function(provider) {
    const { error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
            redirectTo: `${window.location.origin}/auth-callback.html`, // ✅ === التعديل هنا ===
            queryParams: provider === 'google' ? { prompt: 'select_account' } : {}
        }
    });
    if (error) alert("فشل تسجيل الدخول: " + error.message);
};
// --- المستمع الرئيسي الذكي (المسؤول عن كل شيء) ---
supabase.auth.onAuthStateChange((event, session) => {
    const user = session?.user;
    updateAuthButtons(user);

    const currentPage = window.location.pathname.split('/').pop();
    const isAuthPage = ['login.html', 'register.html'];
    const isProtectedPage = ['dashboard.html'];

    // إذا سجل المستخدم دخوله بنجاح وكان في صفحة تسجيل الدخول/إنشاء حساب، يتم توجيهه
    if (user && isAuthPage.includes(currentPage)) {
        window.location.replace('/dashboard.html');
    }
    // إذا كان المستخدم غير مسجل ويحاول دخول صفحة محمية، يتم توجيهه
    else if (!user && isProtectedPage.includes(currentPage)) {
        window.location.replace('/login.html');
    }
});