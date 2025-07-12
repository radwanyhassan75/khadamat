// =================================================================
//           ملف المصادقة والتنقل المشترك - auth.js
// =================================================================

// 1. إعدادات Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBfuVxOgengj2b1JBdt9V3u5WAnyYWsd78",
    authDomain: "khadamatukdigital.firebaseapp.com",
    projectId: "khadamatukdigital",
    storageBucket: "khadamatukdigital.appspot.com",
    messagingSenderId: "690661888019",
    appId: "1:690661888019:web:8770076b69beda7d2d6fe6",
};

// 2. تهيئة Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// 3. دالة لتحديث واجهة المستخدم في الشريط العلوي (سطح المكتب والجوال)
function updateHeaderUI(user) {
    const navbarActions = document.getElementById('navbar-actions');
    const mobileNavbarActions = document.getElementById('mobile-navbar-actions'); // للجوال

    if (!navbarActions) return;

    let desktopNavHtml = '';
    let mobileNavHtml = '';

    if (user) {
        // --- حالة المستخدم مسجل دخوله ---
        const userName = user.displayName || 'مستخدم';
        const userAvatar = user.photoURL || 'https://placehold.co/40x40/0056b3/ffffff?text=U';
        
        // نسخة سطح المكتب
        desktopNavHtml = `
            <a href="dashboard.html" class="user-nav-link">
                <img src="${userAvatar}" alt="${userName}" class="user-avatar">
                <span>${userName}</span>
            </a>
            <a href="#" onclick="logoutUser()" class="btn btn-light" style="padding: 8px 15px;">تسجيل الخروج</a>
        `;
        
        // نسخة الجوال
        mobileNavHtml = `
            <li><a href="dashboard.html">لوحة التحكم</a></li>
            <li><a href="#" onclick="logoutUser()">تسجيل الخروج</a></li>
        `;

    } else {
        // --- حالة المستخدم زائر ---
        
        // نسخة سطح المكتب
        desktopNavHtml = `
            <a href="login.html" class="btn btn-light">تسجيل الدخول</a>
            <a href="register.html" class="btn btn-primary">إنشاء حساب</a>
        `;
        
        // نسخة الجوال
        mobileNavHtml = `
            <li><a href="login.html">تسجيل الدخول</a></li>
            <li><a href="register.html">إنشاء حساب</a></li>
        `;
    }

    // تحديث الواجهتين
    navbarActions.innerHTML = desktopNavHtml;
    if (mobileNavbarActions) {
        mobileNavbarActions.innerHTML = mobileNavHtml;
    }
}

// 4. دالة تسجيل الخروج
function logoutUser() {
    auth.signOut().then(() => {
        window.location.href = "index.html";
    });
}

// 5. الاستماع لتغير حالة تسجيل الدخول وتحديث الهيدر
auth.onAuthStateChanged(user => {
    updateHeaderUI(user);
});

// 6. منطق قائمة الهامبرغر للجوال
document.addEventListener('DOMContentLoaded', () => {
    const mainHeader = document.querySelector('.main-header');
    if (mainHeader) {
        const hamburger = mainHeader.querySelector('.hamburger-menu');
        const navMenu = mainHeader.querySelector('.navbar-menu');
        
        if (hamburger && navMenu) {
            hamburger.addEventListener('click', () => {
                navMenu.classList.toggle('mobile-active');
            });
        }
    }
});