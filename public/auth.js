import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://dlzmyxsycjzedhuqzvpg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsem15eHN5Y2p6ZWRodXF6dnBnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxNTI5ODAsImV4cCI6MjA3MTcyODk4MH0.d8Mk01dOUWyOV3wLWM2NIYFzZhN_azr9S4kOZFA6ZvA';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        detectSessionInUrl: true,
        autoRefreshToken: true,
        persistSession: true
    }
});

window.supabase = supabase;

function updateAuthButtons(user) {
    const navbarActions = document.getElementById('navbar-actions');
    if (!navbarActions) return;

    if (user) {
        navbarActions.innerHTML = `
            <div class="user-profile-dropdown">
                <div class="user-avatar">
                    <div class="avatar-icon"><i class="fas fa-user"></i></div>
                    <i class="fas fa-chevron-down"></i>
                </div>
                <div class="dropdown-content">
                    <div class="dropdown-header">
                        <p class="user-name">مرحباً بك</p>
                        <p class="user-email">${user.email}</p>
                    </div>
                    <a href="dashboard.html"><i class="fas fa-tachometer-alt"></i> لوحة التحكم</a>
                    <div class="dropdown-divider"></div>
                    <button id="logout-button" class="logout-button">
                        <i class="fas fa-sign-out-alt"></i> تسجيل الخروج
                    </button>
                </div>
            </div>
        `;
        const dropdown = navbarActions.querySelector('.user-profile-dropdown');
        dropdown.addEventListener('click', (event) => {
            event.stopPropagation();
            dropdown.classList.toggle('open');
        });
        document.getElementById('logout-button').addEventListener('click', () => {
            supabase.auth.signOut().then(() => window.location.href = "/index.html");
        });
    } else {
        navbarActions.innerHTML = `
            <a href="login.html" class="btn btn-secondary">تسجيل الدخول</a>
            <a href="register.html" class="btn btn-primary">إنشاء حساب</a>
        `;
    }
}

window.addEventListener('click', () => {
    const openDropdown = document.querySelector('.user-profile-dropdown.open');
    if (openDropdown) {
        openDropdown.classList.remove('open');
    }
});

window.signInWithProvider = async function(provider) {
    const { error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
            redirectTo: `${window.location.origin}/auth-callback.html`,
            queryParams: provider === 'google' ? { prompt: 'select_account' } : {}
        }
    });
    if (error) alert("فشل تسجيل الدخول: " + error.message);
};

// --- 💡 هذا هو الجزء الذي تم تعديله ---
supabase.auth.onAuthStateChange((event, session) => {
    const user = session?.user;

    // ✅ الإضافة الأولى: جعل معلومات المستخدم الحالية متاحة لكل الصفحات
    window.currentUser = user;
    
    // ✅ الإضافة الثانية: إرسال إشارة بأن عملية المصادقة قد تمت
    window.authReady = true;

    // الآن يمكننا تحديث الأزرار وتوجيه المستخدم كما كان في السابق
    updateAuthButtons(user);

    const currentPage = window.location.pathname.split('/').pop();
    const isAuthPage = ['login.html', 'register.html'];
    const isProtectedPage = ['dashboard.html', 'orders.html']; // أضف صفحة الطلبات هنا للحماية

    if (user && isAuthPage.includes(currentPage)) {
        window.location.replace('/dashboard.html');
    } else if (!user && isProtectedPage.includes(currentPage)) {
        window.location.replace('/login.html');
    }
});