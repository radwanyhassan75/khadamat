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

// --- دالة تسجيل الدخول عبر المزودين (تبقى كما هي) ---
window.signInWithProvider = async function(provider) {
    const options = { redirectTo: `${window.location.origin}/dashboard.html` };
    if (provider === 'google') {
        options.queryParams = { prompt: 'select_account' };
    }
    await supabase.auth.signInWithOAuth({ provider: provider, options: options });
};

// --- المستمع الرئيسي لحالة المصادقة (✅ تم تحسينه) ---
supabase.auth.onAuthStateChange((event, session) => {
    const user = session?.user;
    const navbarActions = document.getElementById('navbar-actions');
    if (!navbarActions) return;

    // تحديث أزرار الهيدر
    if (user) {
        navbarActions.innerHTML = `<a href="dashboard.html" class="btn btn-primary">لوحة التحكم</a> <button id="logout-button" class="btn btn-secondary">تسجيل الخروج</button>`;
        const logoutButton = document.getElementById('logout-button');
        if(logoutButton) {
            logoutButton.addEventListener('click', () => supabase.auth.signOut().then(() => window.location.href = "/index.html"));
        }
    } else {
        navbarActions.innerHTML = `<a href="login.html" class="btn btn-secondary">تسجيل الدخول</a><a href="register.html" class="btn btn-primary">إنشاء حساب</a>`;
    }

    // --- منطق إعادة التوجيه المحسّن ---
    const currentPage = window.location.pathname.split('/').pop();
    const isAuthPage = ['login.html', 'register.html'].includes(currentPage);

    // هذا هو الشرط الأهم: إذا نجحت عملية تسجيل الدخول، وجه المستخدم فورًا
    if (event === 'SIGNED_IN' && isAuthPage) {
        window.location.href = '/dashboard.html';
    }
});