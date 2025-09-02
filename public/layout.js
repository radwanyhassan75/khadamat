// public/layout.js - هذا الملف يقوم ببناء الهيدر والفوتر الاحترافيين لجميع صفحات الموقع

// HTML الخاص بالهيدر بتصميم عالمي مع قائمة منسدلة
const headerHTML = `
<header class="main-header">
    <nav class="navbar container">
        <a href="index.html" class="navbar-logo">
            <img id="site-logo" src="https://github.com/radwanyhassan75/logo.png/blob/main/20832c91-c5a0-4bb1-a95f-b8c8bd097d7a-removebg-preview.png?raw=true" alt="شعار المكتب الرقمي">
        </a>
        <div class="navbar-menu-container">
            <ul class="navbar-menu">
                <li><a href="index.html">الرئيسية</a></li>
                <li><a href="services.html">الخدمات</a></li>
                <li><a href="blog.html">المدونة</a></li>
                <li><a href="track-order.html">تتبع طلباتك</a></li>
                <li class="dropdown">
                    <a href="#" class="dropdown-toggle">المزيد <i class="fas fa-chevron-down"></i></a>
                    <div class="dropdown-menu">
                        <a href="prices.html">الأسعار</a>
                        <a href="payment.html">طرق الدفع</a>
                        <a href="faq.html">الأسئلة الشائعة</a>
                        <a href="about.html">من نحن</a>
                        <a href="contact.html">اتصل بنا</a>
                        <a href="my-orders.html">طلباتي</a>
                        <a href="privacy-policy.html">سياسة الخصوصية</a>
                        <a href="refund-policy.html">سياسة الاسترجاع</a>
                        <a href="terms-and-conditions.html">الشروط والأحكام</a>
                    </div>
                </li>
            </ul>
        </div>
        <div id="navbar-actions" class="navbar-actions">
            <!-- أزرار تسجيل الدخول وإنشاء الحساب ستظهر هنا -->
        </div>
        <button class="hamburger-menu" aria-label="Toggle Menu">
            <span class="hamburger-line"></span>
            <span class="hamburger-line"></span>
            <span class="hamburger-line"></span>
        </button>
    </nav>
</header>
`;

// HTML الخاص بالفوتر بتصميم عصري ومحتوى محدث بالكامل
const footerHTML = `
<footer class="main-footer">
    <div class="container">
        <div class="footer-main">
            <div class="footer-section about">
                <h3 class="footer-title">المكتب الرقمي</h3>
                <p>منصة متكاملة لتسهيل جميع معاملاتك الإدارية والرقمية بكفاءة وموثوقية عالية، مصممة لتلبية احتياجاتك اليومية.</p>
                 <div class="social-links">
                    <a href="#" aria-label="Facebook"><i class="fab fa-facebook-f"></i></a>
                    <a href="#" aria-label="WhatsApp"><i class="fab fa-whatsapp"></i></a>
                    <a href="#" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
                </div>
            </div>
            <div class="footer-section links">
                <h3 class="footer-title">روابط مهمة</h3>
                <ul>
                    <li><a href="about.html"><i class="fas fa-info-circle"></i> من نحن</a></li>
                    <li><a href="services.html"><i class="fas fa-concierge-bell"></i> جميع الخدمات</a></li>
                    <li><a href="prices.html"><i class="fas fa-tags"></i> قائمة الأسعار</a></li>
                    <li><a href="payment.html"><i class="fas fa-credit-card"></i> طرق الدفع</a></li>
                    <li><a href="faq.html"><i class="fas fa-question-circle"></i> الأسئلة الشائعة</a></li>
                    <li><a href="contact.html"><i class="fas fa-headset"></i> اتصل بنا</a></li>
                    <li><a href="my-orders.html"><i class="fas fa-receipt"></i> طلباتي</a></li>
                </ul>
            </div>
            <div class="footer-section links">
                 <h3 class="footer-title">قانوني</h3>
                 <ul>
                    <li><a href="privacy-policy.html"><i class="fas fa-user-shield"></i> سياسة الخصوصية</a></li>
                    <li><a href="terms-and-conditions.html"><i class="fas fa-file-contract"></i> الشروط والأحكام</a></li>
                    <li><a href="refund-policy.html"><i class="fas fa-undo-alt"></i> سياسة الاسترجاع</a></li>
                </ul>
            </div>
             <div class="footer-section contact">
                <h3 class="footer-title">تواصل معنا</h3>
                <ul class="contact-details">
                    <li><i class="fas fa-phone-alt"></i> <a href="tel:+212600000000">+212 6 00 00 00 00</a></li>
                    <li><i class="fas fa-envelope"></i> <a href="mailto:support@khadamatmaroc.co.uk">support@khadamatmaroc.co.uk</a></li>
                </ul>
            </div>
        </div>
        <div class="footer-bottom">
            <p>&copy; ${new Date().getFullYear()} المكتب الرقمي. جميع الحقوق محفوظة.</p>
        </div>
    </div>
</footer>
`;

// CSS الاحترافي لعمل الهيدر والفوتر
const layoutCSS = `
    :root { 
        --primary-color: #0d6efd; 
        --primary-hover: #0b5ed7;
        --dark-color: #1c2331; 
        --text-light: #f8f9fa;
        --text-dark: #212529;
        --text-muted: #6c757d;
        --border-color: #dee2e6;
        --light-bg: #f8f9fa;
    }
    html { scroll-behavior: smooth; }
    body { font-family: 'Cairo', sans-serif; margin: 0; padding-top: 90px; direction: rtl; display: flex; flex-direction: column; min-height: 100vh; background-color: var(--light-bg); }
    body.menu-open { overflow: hidden; }
    main { flex-grow: 1; }
    .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
    
    /* Header Styles */
    .main-header { position: fixed; width: 100%; top: 0; left: 0; z-index: 1000; transition: background-color 0.3s ease, box-shadow 0.3s ease; background-color: rgba(255,255,255,0.9); backdrop-filter: blur(10px); border-bottom: 1px solid transparent; }
    .main-header.scrolled { box-shadow: 0 2px 15px rgba(0,0,0,0.08); border-bottom-color: var(--border-color); }
    .navbar { display: flex; justify-content: space-between; align-items: center; height: 90px; }
    .navbar-logo img { height: 75px; transition: height 0.3s ease; }
    .main-header.scrolled .navbar-logo img { height: 65px; }

    .navbar-menu { display: flex; list-style: none; gap: 40px; margin: 0; padding: 0; align-items: center; }
    .navbar-menu a { color: var(--text-dark); text-decoration: none; font-weight: 700; font-size: 1rem; padding-bottom: 5px; position: relative; }
    .navbar-menu a::after { content: ''; position: absolute; bottom: 0; right: 0; width: 0; height: 2px; background-color: var(--primary-color); transition: width 0.3s ease; }
    .navbar-menu a:hover, .navbar-menu a.active { color: var(--primary-color); }
    .navbar-menu a:hover::after, .navbar-menu a.active::after { width: 100%; }
    
    /* Dropdown Menu */
    .dropdown { position: relative; }
    .dropdown-toggle .fa-chevron-down { font-size: 0.7em; margin-right: 5px; transition: transform 0.3s ease; }
    .dropdown:hover .dropdown-toggle .fa-chevron-down { transform: rotate(180deg); }
    .dropdown-menu { position: absolute; top: 120%; right: 0; background-color: white; border-radius: 8px; box-shadow: 0 8px 25px rgba(0,0,0,0.1); list-style: none; padding: 10px 0; min-width: 200px; opacity: 0; visibility: hidden; transform: translateY(10px); transition: opacity 0.3s ease, transform 0.3s ease, visibility 0.3s; z-index: 1100; }
    .dropdown:hover .dropdown-menu { opacity: 1; visibility: visible; transform: translateY(0); }
    .dropdown-menu a { display: block; padding: 10px 20px; font-weight: 600; white-space: nowrap; transition: background-color 0.2s ease, color 0.2s ease; }
    .dropdown-menu a:hover { background-color: #f1f5f9; color: var(--primary-color); }
    .dropdown-menu a::after { display: none; }

    .navbar-actions { display: flex; align-items: center; gap: 10px; }
    .btn { padding: 8px 20px; border-radius: 50px; text-decoration: none; font-weight: 700; transition: all 0.3s ease; display: inline-flex; align-items: center; gap: 8px; border: 1px solid transparent; cursor: pointer; }
    .btn-primary { background-color: var(--primary-color); color: white; }
    .btn-primary:hover { background-color: var(--primary-hover); }
    .btn-secondary { background: var(--light-bg); color: var(--primary-color); border-color: var(--border-color); }
    .btn-secondary:hover { background: #eef2ff; }

    /* Hamburger Menu */
    .hamburger-menu { display: none; /* ... */ }

    /* Footer Styles */
    .main-footer { background-color: var(--dark-color); color: #94a3b8; padding: 80px 20px 30px; }
    .footer-main { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 40px; margin-bottom: 60px; }
    .footer-title { color: white; font-size: 1.25rem; font-weight: 700; margin-bottom: 25px; }
    .footer-section p { line-height: 1.8; margin-bottom: 20px; font-size: 0.95rem; }
    .footer-logo { max-width: 150px; margin-bottom: 15px; }
    .footer-section ul { list-style: none; padding: 0; } .footer-section a { color: #94a3b8; text-decoration: none; line-height: 2.2; transition: color 0.3s ease; display: inline-flex; align-items: center; gap: 10px; }
    .footer-section a:hover { color: white; }
    .footer-section ul i { color: var(--primary-color); width: 20px; text-align: center; }
    .social-links { display: flex; gap: 15px; }
    .social-links a { display: inline-flex; width: 40px; height: 40px; align-items: center; justify-content: center; border-radius: 50%; background-color: #334155; color: var(--text-light); transition: background-color 0.3s ease; }
    .social-links a:hover { background-color: var(--primary-color); }
    .btn-primary-outline { background-color: transparent; color: white; border: 1px solid var(--primary-color); padding: 10px 24px; border-radius: 50px; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; gap: 10px; font-weight: 700; transition: all 0.3s ease; }
    .btn-primary-outline:hover { background-color: var(--primary-color); color: white; }
    .footer-bottom { text-align: center; border-top: 1px solid #334155; padding-top: 30px; }

    /* Responsive */
    @media (max-width: 992px) { 
        .navbar-menu { display: none; }
        .hamburger-menu { display: flex; }
        .navbar-menu-container.is-open { left: 0; }
        .navbar-menu-container { position: fixed; top: 0; left: -100%; width: 80%; max-width: 300px; height: 100%; background-color: white; transition: left 0.4s ease; display: flex; flex-direction: column; padding-top: 100px; z-index: 1001; box-shadow: 5px 0 15px rgba(0,0,0,0.1); }
        .navbar-menu { flex-direction: column; gap: 25px; align-items: flex-start; width: 100%; padding: 0 30px; }
        .navbar-menu a { font-size: 1.2rem; }
    }
`;

document.addEventListener('DOMContentLoaded', () => {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = layoutCSS;
    document.head.appendChild(styleSheet);
    
    const headerPlaceholder = document.getElementById('header-placeholder');
    if (headerPlaceholder) headerPlaceholder.innerHTML = headerHTML;

    const footerPlaceholder = document.getElementById('footer-placeholder');
    if (footerPlaceholder) footerPlaceholder.innerHTML = footerHTML;
    
    // UI Logic (Header, Menu, Active Links)
    const header = document.querySelector('.main-header');
    if (header) {
        window.addEventListener('scroll', () => {
            header.classList.toggle('scrolled', window.scrollY > 20);
        });
    }

    const hamburger = document.querySelector('.hamburger-menu');
    const navMenuContainer = document.querySelector('.navbar-menu-container');
    if (hamburger && navMenuContainer) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('mobile-menu-active');
            navMenuContainer.classList.toggle('is-open');
            document.body.classList.toggle('menu-open');
        });
    }
    
    // Logic for active links: highlights the current page in the navigation
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.navbar-menu a').forEach(link => {
        // Exclude dropdown menu items from direct active highlighting in the main nav
        if (link.closest('.dropdown-menu')) {
            // However, we still want to highlight dropdown items if they are the current page
            if (link.getAttribute('href') === currentPage) {
                link.classList.add('active');
                // Also, ensure the parent dropdown toggle shows as active if one of its children is active
                const parentDropdown = link.closest('.dropdown');
                if (parentDropdown) {
                    parentDropdown.querySelector('.dropdown-toggle').classList.add('active');
                }
            }
            return;
        }
        
        // For main navigation links
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        }
    });
});