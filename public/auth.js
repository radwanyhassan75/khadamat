// =================================================================
//          ملف المصادقة والتنقل المشترك - auth.js
//          الإصدار: 7.1 - مع إصلاح مشكلة وميض المحتوى في وضع الصيانة
// =================================================================

// ✅ FIX: Hide the page content immediately to prevent flashing
document.documentElement.style.visibility = 'hidden';

// -----------------------------------------------------------------
// 1. إعدادات Firebase
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
// 3. مزامنة المستخدم مع قاعدة البيانات الخلفية (Worker/D1)
// -----------------------------------------------------------------
const WORKER_URL = 'https://orders-worker.radwanyhassan75.workers.dev';

async function syncUserWithBackend(user) {
    if (!user) {
        console.error("خطأ: لا يوجد مستخدم لتتم مزامنته مع قاعدة البيانات الخلفية.");
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
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (response.ok) {
            console.log("تمت مزامنة المستخدم مع قاعدة البيانات الخلفية بنجاح.");
        } else {
            const errorData = await response.json();
            console.error("خطأ في مزامنة المستخدم مع قاعدة البيانات الخلفية:", errorData.error || response.statusText);
        }
    } catch (error) {
        console.error("حدث خطأ أثناء محاولة مزامنة المستخدم مع قاعدة البيانات الخلفية:", error);
    }
}

// -----------------------------------------------------------------
// 4. تحديث واجهة المستخدم في الهيدر بناءً على حالة تسجيل الدخول
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
// 5. تسجيل الخروج
// -----------------------------------------------------------------
function logoutUser() {
    auth.signOut().then(() => {
        console.log("تم تسجيل الخروج بنجاح.");
        window.location.href = "index.html";
    }).catch((error) => {
        console.error("خطأ أثناء تسجيل الخروج:", error);
    });
}

// -----------------------------------------------------------------
// 6. إعداد قائمة المستخدم المنسدلة
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
// 7. مراقبة حالة تسجيل الدخول وتحديث الواجهة
// -----------------------------------------------------------------
auth.onAuthStateChanged(user => {
    updateHeaderUI(user);
});


// --- ✅ 8. [مُصحَّح] دالة مركزية لجلب وتطبيق إعدادات الموقع ---
async function loadSiteSettings() {
    const SETTINGS_URL = `${WORKER_URL}/settings`;
    try {
        const response = await fetch(SETTINGS_URL);
        if (!response.ok) {
            document.documentElement.style.visibility = 'visible'; // Show page on error
            return; 
        }
        const settings = await response.json();

        // Maintenance Mode Check
        if (settings.maintenance_mode === 'on') {
            if (!window.location.pathname.endsWith('maintenance.html') && !window.location.pathname.startsWith('/admin/')) {
                window.location.href = '/maintenance.html';
                return; // Stop further execution
            }
        }

        // Update Title
        if (settings.site_name !== undefined) {
            const pageTitle = document.title.split('|')[1] || document.title;
            document.title = `${settings.site_name || 'المكتب الرقمي'} | ${pageTitle.trim()}`;
        }
        
        // Update Logo
        const logoElements = document.querySelectorAll('.navbar-logo img');
        if (logoElements.length > 0 && settings.logo_url !== undefined) {
            logoElements.forEach(logo => {
                logo.src = settings.logo_url || 'https://github.com/radwanyhassan75/logo.png/blob/main/20832c91-c5a0-4bb1-a95f-b8c8bd097d7a-removebg-preview.png?raw=true';
            });
        }
        
        // Update Social Links in Footer
        const facebookLink = document.getElementById('social-link-facebook');
        if(facebookLink) facebookLink.href = settings.facebook_url || '#';
        
        const whatsappLink = document.getElementById('social-link-whatsapp');
        if(whatsappLink) whatsappLink.href = settings.whatsapp_url || '#';

        const instagramLink = document.getElementById('social-link-instagram');
        if(instagramLink) instagramLink.href = settings.instagram_url || '#';

        // Inject Tracking Codes
        if (settings.google_analytics_id) {
            const gaScript = document.createElement('script');
            gaScript.async = true;
            gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${settings.google_analytics_id}`;
            document.head.appendChild(gaScript);

            const gaInitScript = document.createElement('script');
            gaInitScript.innerHTML = `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${settings.google_analytics_id}');
            `;
            document.head.appendChild(gaInitScript);
        }

        if (settings.facebook_pixel_id) {
            const fbScript = document.createElement('script');
            fbScript.innerHTML = `
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${settings.facebook_pixel_id}');
                fbq('track', 'PageView');
            `;
            document.head.appendChild(fbScript);
            
            const fbNoScript = document.createElement('noscript');
            fbNoScript.innerHTML = `<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${settings.facebook_pixel_id}&ev=PageView&noscript=1"/>`;
            document.body.appendChild(fbNoScript);
        }
        
    } catch (error) {
        console.error("تعذر تحميل إعدادات الموقع:", error);
    } finally {
        // ✅ FIX: Reveal the page content only after the check is complete.
        if (document.documentElement.style.visibility !== 'visible') {
            document.documentElement.style.visibility = 'visible';
        }
    }
}

// -----------------------------------------------------------------
// 9. تحميل إعدادات الموقع وتفعيل قائمة المستخدم عند تحميل الصفحة
// -----------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    loadSiteSettings();

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
