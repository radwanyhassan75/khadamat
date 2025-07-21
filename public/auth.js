// =================================================================
//          ملف المصادقة والتنقل المشترك - auth.js
//          الإصدار: 2.1 - مع مزامنة المستخدمين مع قاعدة البيانات
// =================================================================

// -----------------------------------------------------------------
// 1. إعدادات Firebase
// This object contains your project's unique Firebase configuration keys.
// -----------------------------------------------------------------
const firebaseConfig = {
    apiKey: "AIzaSyBfuVxOgengj2b1JBdt9V3u5WAnyYWsd78",
    authDomain: "khadamatukdigital.firebaseapp.com",
    projectId: "khadamatukdigital",
    storageBucket: "khadamatukdigital.appspot.com",
    messagingSenderId: "690661888019",
    appId: "1:690661888019:web:8770076b69beda7d2d6fe6",
};

// -----------------------------------------------------------------
// 2. تهيئة Firebase
// -----------------------------------------------------------------
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();

// -----------------------------------------------------------------
// ✅ 3. [جديد] مزامنة المستخدم الجديد مع قاعدة البيانات (Worker/D1)
// -----------------------------------------------------------------
const WORKER_URL = 'https://orders-worker.radwanyhassan75.workers.dev'; // تأكد من أن هذا هو الرابط الصحيح

/**
 * ترسل بيانات المستخدم المسجل حديثًا إلى الخادم (Worker) لحفظها في قاعدة البيانات D1.
 * يجب استدعاء هذه الدالة فورًا بعد نجاح عملية إنشاء حساب جديد.
 * @param {firebase.User} user - كائن المستخدم الذي يتم إرجاعه من Firebase بعد التسجيل.
 */
async function syncUserWithBackend(user) {
    if (!user) {
        console.error("فشلت المزامنة: لم يتم توفير كائن المستخدم.");
        return;
    }

    try {
        const payload = {
            id: user.uid,
            email: user.email,
            displayName: user.displayName
        };

        const response = await fetch(`${WORKER_URL}/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            console.log("تمت مزامنة المستخدم بنجاح مع قاعدة البيانات الخلفية.");
        } else {
            const errorData = await response.json();
            console.error("فشلت المزامنة مع الخادم:", errorData.error || response.statusText);
        }
    } catch (error) {
        console.error("حدث خطأ أثناء محاولة مزامنة المستخدم:", error);
    }
}

/*
// ------------------ 📝 كيفية الاستخدام 📝 ------------------
// في ملف الجافاسكريبت الخاص بصفحة التسجيل (register.html)،
// بعد إنشاء المستخدم بنجاح، قم باستدعاء الدالة هكذا:
//
// auth.createUserWithEmailAndPassword(email, password)
//   .then((userCredential) => {
//     // تم تسجيل الدخول 
//     const user = userCredential.user;
//     
//     // ✅ استدعاء دالة المزامنة هنا
//     syncUserWithBackend(user); 
//
//     // ... بقية الكود الخاص بك، مثل إعادة توجيه المستخدم ...
//     window.location.href = 'index.html';
//   })
//   .catch((error) => {
//     // ... معالجة الأخطاء ...
//   });
// -------------------------------------------------------------
*/


// -----------------------------------------------------------------
// 4. دالة لتحديث واجهة المستخدم في الشريط العلوي
// -----------------------------------------------------------------
function updateHeaderUI(user) {
    const navbarActions = document.getElementById('navbar-actions');
    const mobileNavbarActions = document.getElementById('mobile-navbar-actions');
    if (!navbarActions) return;

    let desktopNavHtml = '';
    let mobileNavHtml = '';

    if (user) {
        const userName = user.displayName || 'مستخدم';
        const userAvatar = user.photoURL || 'https://placehold.co/40x40/0056b3/ffffff?text=U';
        desktopNavHtml = `
            <div class="user-menu-container">
                <button class="user-menu-button" id="user-menu-toggle">
                    <img src="${userAvatar}" alt="${userName}" class="user-avatar">
                    <span>${userName}</span>
                    <i class="fas fa-chevron-down dropdown-arrow"></i>
                </button>
                <ul class="dropdown-menu" id="user-dropdown">
                    <li><a href="dashboard.html"><i class="fas fa-user-circle"></i> لوحة التحكم</a></li>
                    <li class="dropdown-divider"></li>
                    <li><a href="#" onclick="logoutUser()"><i class="fas fa-sign-out-alt"></i> تسجيل الخروج</a></li>
                </ul>
            </div>
        `;
        mobileNavHtml = `
            <li><a href="dashboard.html">لوحة التحكم</a></li>
            <li><a href="#" onclick="logoutUser()">تسجيل الخروج</a></li>
        `;
    } else {
        desktopNavHtml = `
            <a href="login.html" class="btn-header light">تسجيل الدخول</a>
            <a href="register.html" class="btn-header primary">إنشاء حساب</a>
        `;
        mobileNavHtml = `
            <li><a href="login.html">تسجيل الدخول</a></li>
            <li><a href="register.html">إنشاء حساب</a></li>
        `;
    }

    navbarActions.innerHTML = desktopNavHtml;
    if (mobileNavbarActions) {
        mobileNavbarActions.innerHTML = mobileNavHtml;
    }

    if (user) {
        setupDropdownMenu();
    }
}

// -----------------------------------------------------------------
// 5. دالة تسجيل الخروج
// -----------------------------------------------------------------
function logoutUser() {
    auth.signOut().then(() => {
        console.log("User signed out successfully.");
        window.location.href = "index.html";
    }).catch((error) => {
        console.error("Logout Error:", error);
    });
}

// -----------------------------------------------------------------
// 6. دالة جديدة لتشغيل القائمة المنسدلة
// -----------------------------------------------------------------
function setupDropdownMenu() {
    const toggleButton = document.getElementById('user-menu-toggle');
    const dropdown = document.getElementById('user-dropdown');
    if (toggleButton && dropdown) {
        toggleButton.addEventListener('click', (event) => {
            event.stopPropagation();
            dropdown.classList.toggle('show');
        });
        document.addEventListener('click', (event) => {
            if (dropdown.classList.contains('show') && !toggleButton.contains(event.target)) {
                dropdown.classList.remove('show');
            }
        });
    }
}

// -----------------------------------------------------------------
// 7. الاستماع لتغير حالة تسجيل الدخول
// -----------------------------------------------------------------
auth.onAuthStateChanged(user => {
    updateHeaderUI(user);
});

// -----------------------------------------------------------------
// 8. منطق قائمة الهامبرغر للجوال والتصميم
// -----------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    const style = document.createElement('style');
    style.textContent = `
        .user-menu-container { position: relative; }
        .user-menu-button { display: flex; align-items: center; gap: 10px; background: transparent; border: 2px solid #eee; cursor: pointer; padding: 6px 15px 6px 6px; border-radius: 50px; transition: background-color 0.3s, box-shadow 0.3s; }
        .user-menu-button:hover { background-color: var(--gray-color); box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .user-avatar { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; }
        .user-menu-button span { font-weight: 700; font-size: 1rem; color: var(--dark-color); }
        .dropdown-arrow { font-size: 0.8rem; color: #aaa; transition: transform 0.3s; }
        .user-menu-button[aria-expanded="true"] .dropdown-arrow { transform: rotate(180deg); }
        .dropdown-menu { display: none; position: absolute; top: 120%; left: 0; background: white; border-radius: var(--border-radius); box-shadow: var(--box-shadow); list-style: none; padding: 10px 0; margin: 0; width: 220px; z-index: 1001; border: 1px solid #eee; opacity: 0; transform: translateY(10px); transition: opacity 0.2s ease, transform 0.2s ease; }
        .dropdown-menu.show { display: block; opacity: 1; transform: translateY(0); }
        .dropdown-menu a { display: flex; align-items: center; gap: 10px; padding: 12px 20px; text-decoration: none; color: var(--dark-color); font-weight: 700; font-size: 0.95rem; }
        .dropdown-menu a:hover { background-color: var(--gray-color); }
        .dropdown-menu a i { width: 20px; color: var(--primary-color); }
        .dropdown-divider { height: 1px; background-color: #eee; margin: 8px 0; }
        .btn-header { font-weight:700; padding: 10px 22px; text-decoration: none; border-radius: 50px; transition: all 0.3s ease; }
        .btn-header.primary { background-color: var(--primary-color); color: white; }
        .btn-header.light { background-color: #e7f1ff; color: var(--primary-color); }
        .btn-header:hover { transform: translateY(-2px); box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
    `;
    document.head.appendChild(style);

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
