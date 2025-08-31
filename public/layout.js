// public/layout.js - هذا الملف يقوم ببناء الهيدر والفوتر لجميع صفحات الموقع

// HTML الخاص بالهيدر (تم استخراجه من صفحتك الرئيسية)
const headerHTML = `
<header class="main-header transparent">
    <nav class="navbar">
        <a href="index.html" class="navbar-logo">
            <img id="site-logo" src="https://github.com/radwanyhassan75/logo.png/blob/main/20832c91-c5a0-4bb1-a95f-b8c8bd097d7a-removebg-preview.png?raw=true" alt="شعار المكتب الرقمي">
        </a>
        <ul class="navbar-menu">
            <li><a href="index.html">الرئيسية</a></li>
            <li><a href="services.html">الخدمات</a></li>
            <li><a href="blog.html">المدونة</a></li>
            <li><a href="track-order.html">تتبع طلباتك</a></li>
            <li><a href="contact.html">اتصل بنا</a></li>
            <li><a href="about.html">من نحن</a></li>
        </ul>
        <div id="navbar-actions" class="navbar-actions">
            </div>
        <div class="hamburger-menu"><i class="fas fa-bars"></i></div>
    </nav>
</header>
`;

// HTML الخاص بالفوتر (تم استخراجه من صفحتك الرئيسية)
const footerHTML = `
<footer class="main-footer">
    <div class="container">
        <div class="footer-content">
            <div class="footer-section">
                <h3 class="footer-title">المكتب الرقمي</h3>
                <p>منصة متكاملة لتسهيل جميع معاملاتك الإدارية والرقمية بكفاءة وموثوقية عالية.</p>
            </div>
            <div class="footer-section">
                <h3 class="footer-title">روابط مهمة</h3>
                <ul>
                    <li><a href="about.html">من نحن</a></li>
                    <li><a href="services.html">جميع الخدمات</a></li>
                    <li><a href="faq.html">الأسئلة الشائعة</a></li>
                    <li><a href="contact.html">اتصل بنا</a></li>
                </ul>
            </div>
            <div class="footer-section">
                <h3 class="footer-title">قانوني</h3>
                <ul>
                    <li><a href="privacy-policy.html">سياسة الخصوصية</a></li>
                    <li><a href="terms-and-conditions.html">الشروط والأحكام</a></li>
                </ul>
            </div>
            <div class="footer-section">
                <h3 class="footer-title">تواصل معنا</h3>
                <div class="social-links">
                    <a href="#" aria-label="Facebook"><i class="fab fa-facebook-f"></i></a>
                    <a href="#" aria-label="WhatsApp"><i class="fab fa-whatsapp"></i></a>
                    <a href="#" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
                </div>
            </div>
        </div>
        <div class="footer-bottom">
            <p>&copy; ${new Date().getFullYear()} المكتب الرقمي. جميع الحقوق محفوظة.</p>
        </div>
    </div>
</footer>
`;

// CSS الضروري لعمل الهيدر والفوتر (تم استخراجه وتجميعه)
const layoutCSS = `
    :root { --primary-color: #0056b3; --dark-color: #2c3e50; --light-color: #ffffff; --border-radius: 12px; }
    html { scroll-behavior: smooth; }
    body { font-family: 'Cairo', sans-serif; margin: 0; direction: rtl; display: flex; flex-direction: column; min-height: 100vh; }
    main { flex-grow: 1; }
    .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
    .btn { padding: 10px 24px; border-radius: 50px; text-decoration: none; font-weight: 700; transition: all 0.3s ease; display: inline-flex; align-items: center; gap: 8px; border: 2px solid transparent; cursor: pointer; }
    .btn-primary { background-color: var(--primary-color); color: var(--light-color); }
    .btn-primary:hover { background-color: #00458e; }
    .btn-secondary { background: transparent; color: var(--primary-color); border-color: var(--primary-color); }
    .btn-secondary:hover { background: var(--primary-color); color: var(--light-color); }
    .main-header { position: sticky; width: 100%; top: 0; left: 0; z-index: 1000; transition: background-color 0.4s ease, box-shadow 0.4s ease; background-color: var(--light-color); box-shadow: 0 2px 15px rgba(0,0,0,0.1); }
    .navbar { display: flex; justify-content: space-between; align-items: center; height: 90px; padding: 0 5%; max-width: 1200px; margin: 0 auto; }
    .navbar-logo img { height: 80px; }
    .navbar-menu { display: none; list-style: none; gap: 35px; margin: 0; padding: 0; align-items: center; }
    .navbar-menu a { color: var(--dark-color); text-decoration: none; font-weight: 700; font-size: 1.1rem; padding-bottom: 5px; position: relative; }
    .navbar-menu a::after { content: ''; position: absolute; bottom: 0; right: 0; width: 0; height: 3px; background-color: var(--primary-color); transition: width 0.3s ease; }
    .navbar-menu a:hover::after, .navbar-menu a.active::after { width: 100%; }
    .navbar-actions { display: flex; align-items: center; gap: 15px; min-width: 210px; justify-content: flex-end; }
    .hamburger-menu { display: block; font-size: 1.8rem; cursor: pointer; z-index: 1002; color: var(--dark-color); }
    .main-footer { background-color: var(--dark-color); color: #bdc3c7; padding: 60px 5% 20px; }
    .footer-content { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 40px; margin-bottom: 40px; }
    .footer-title { color: var(--light-color); font-size: 1.5rem; margin-bottom: 20px; font-weight: 700; border-bottom: 2px solid var(--primary-color); padding-bottom: 10px; }
    .footer-section ul { list-style: none; padding: 0; } .footer-section a { color: #bdc3c7; text-decoration: none; line-height: 2.2; }
    .social-links a { display: inline-flex; width: 40px; height: 40px; align-items: center; justify-content: center; border-radius: 50%; background-color: #34495e; color: var(--light-color); margin-left: 10px; font-size: 1rem; }
    .footer-bottom { text-align: center; border-top: 1px solid #34495e; padding-top: 20px; font-size: 0.9rem; }
    @media (max-width: 992px) {
        .navbar-menu { display: none; }
        .hamburger-menu { display: block; }
        .navbar-menu.mobile-active { display: flex; flex-direction: column; position: fixed; top: 0; right: 0; background-color: var(--light-color); width: 100%; height: 100vh; padding-top: 100px; text-align: center; gap: 20px; }
        .navbar-menu.mobile-active a { color: var(--dark-color) !important; font-size: 1.5rem; }
    }
    @media (min-width: 993px) {
        .hamburger-menu { display: none; }
        .navbar-menu { display: flex; }
    }
`;

// دالة لتشغيل كل شيء عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    // 1. إضافة الـ CSS إلى الصفحة
    const styleSheet = document.createElement("style");
    styleSheet.innerText = layoutCSS;
    document.head.appendChild(styleSheet);

    // 2. وضع الهيدر في مكانه
    const headerPlaceholder = document.getElementById('header-placeholder');
    if (headerPlaceholder) {
        headerPlaceholder.innerHTML = headerHTML;
    }

    // 3. وضع الفوتر في مكانه
    const footerPlaceholder = document.getElementById('footer-placeholder');
    if (footerPlaceholder) {
        footerPlaceholder.innerHTML = footerHTML;
    }

    // 4. تفعيل قائمة الهامبرغر للموبايل
    const hamburger = document.querySelector('.hamburger-menu');
    const navMenu = document.querySelector('.navbar-menu');
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('mobile-active');
            // تغيير شكل أيقونة الهامبرغر
            hamburger.querySelector('i').classList.toggle('fa-bars');
            hamburger.querySelector('i').classList.toggle('fa-times');
        });
    }

    // 5. تفعيل الرابط النشط في القائمة
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.navbar-menu a');
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        }
    });
});