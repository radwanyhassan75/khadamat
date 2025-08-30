// =================================================================
//           ملف المصادقة والإعدادات المركزي - auth.js
//           الإصدار: 9.2 - تم إصلاح أخطاء الكونسول
// =================================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// --- 1. إعدادات الاتصال ---
const firebaseConfig = {
    apiKey: "AIzaSyBfuVxOgengj2b1JBdt9V3u5WAnyYWsd78",
    authDomain: "khadamatukdigital.firebaseapp.com",
    projectId: "khadamatukdigital",
    storageBucket: "khadamatukdigital.appspot.com",
    messagingSenderId: "690661888019",
    appId: "1:690661888019:web:8770076b69beda7d2d6fe6",
};
const SUPABASE_URL = 'https://dlzmyxsycjzedhuqzvpg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsem15eHN5Y2p6ZWRodXF6dnBnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxNTI5ODAsImV4cCI6MjA3MTcyODk4MH0.d8Mk01dOUWyOV3wLWM2NIYFzZhN_azr9S4kOZFA6ZvA';

// --- 2. تهيئة الخدمات والمتغيرات العامة ---
const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ✅ جعل المتغيرات متاحة لجميع الصفحات
window.supabase = supabase;
window.authReady = false;      // إشارة بأن التحقق من المستخدم قد تم
window.currentUser = null;   // لتخزين معلومات المستخدم الحالي

// --- 3. دالة تطبيق إعدادات الموقع ---
async function applySiteSettings() {
    try {
        const { data: settings, error } = await supabase.from('general_settings').select('maintenance_mode, logo_url').eq('id', 1).single();
        if (error && error.code !== 'PGRST116') throw error;
        if (settings?.maintenance_mode && !window.location.pathname.includes('/admin/')) {
            document.body.innerHTML = `<div style="display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100vh; text-align: center; font-family: Cairo, sans-serif; background-color: #f8f9fa;"><i class="fas fa-tools" style="font-size: 5rem; color: #0d6efd; margin-bottom: 20px;"></i><h1 style="font-size: 2.5rem; color: #2c3e50;">الموقع تحت الصيانة حاليًا</h1><p style="font-size: 1.2rem; color: #555;">نحن نقوم ببعض التحديثات وسنعود قريبًا. شكرًا لصبركم.</p></div>`;
            return true;
        }
        const logoElement = document.getElementById('site-logo');
        if (logoElement && settings?.logo_url) {
            logoElement.src = settings.logo_url;
        }
    } catch (error) {
        console.error("Could not load site settings:", error);
    }
    return false;
}

// --- 4. تحديث واجهة المستخدم ---
function updateHeaderUI(user) {
    const navbarActions = document.getElementById('navbar-actions');
    if (!navbarActions) return;
    if (user) {
        navbarActions.innerHTML = `<a href="dashboard.html" class="btn btn-primary">لوحة التحكم</a><button onclick="window.logoutUser()" class="btn btn-secondary">تسجيل الخروج</button>`;
    } else {
        navbarActions.innerHTML = `<a href="login.html" class="btn btn-secondary">تسجيل الدخول</a><a href="register.html" class="btn btn-primary">إنشاء حساب</a>`;
    }
}

// --- 5. تسجيل الخروج ---
window.logoutUser = function() {
    signOut(auth).then(() => {
        supabase.auth.signOut();
        window.location.href = "index.html";
    }).catch(error => console.error("خطأ أثناء تسجيل الخروج:", error));
}

// --- 6. نقطة البداية الرئيسية ---
async function initializeAuth() {
    const inMaintenance = await applySiteSettings();
    if (inMaintenance) {
        window.authReady = true; // إرسال الإشارة حتى في وضع الصيانة
        return;
    }

    onAuthStateChanged(auth, (user) => {
        updateHeaderUI(user);
        window.currentUser = user; // تحديث المستخدم الحالي
        
        if (user) {
            user.getIdToken().then(async (token) => {
                // محاولة تسجيل الجلسة في Supabase
                await supabase.auth.setSession({ access_token: token });
            }).catch(error => {
                console.error("Error retrieving a token:", error);
            }).finally(() => {
                // ✅ إرسال الإشارة بعد اكتمال جميع العمليات
                if (!window.authReady) window.authReady = true;
            });
        } else {
            supabase.auth.signOut().catch(e => console.error("SignOut failed", e));
            // ✅ إرسال الإشارة للمستخدم الزائر
            if (!window.authReady) window.authReady = true;
        }
    });
}

// تشغيل كل شيء
initializeAuth();
