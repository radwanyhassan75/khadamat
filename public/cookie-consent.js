// =================================================================
//          ملف إشعار ملفات تعريف الارتباط (الكوكيز) - النسخة الاحترافية
//          يقوم هذا الملف بإنشاء وعرض إشعار الموافقة تلقائيًا
// =================================================================

document.addEventListener('DOMContentLoaded', () => {

    const COOKIE_NAME = 'user_cookie_consent';
    const COOKIE_EXPIRATION_DAYS = 365;

    /**
     * Checks if the user has already given consent.
     * @returns {boolean} True if the consent cookie exists, false otherwise.
     */
    function hasConsent() {
        return document.cookie.split(';').some((item) => item.trim().startsWith(`${COOKIE_NAME}=`));
    }

    /**
     * Sets the consent cookie and hides the banner.
     */
    function giveConsent() {
        const d = new Date();
        d.setTime(d.getTime() + (COOKIE_EXPIRATION_DAYS * 24 * 60 * 60 * 1000));
        const expires = "expires=" + d.toUTCString();
        document.cookie = `${COOKIE_NAME}=true;${expires};path=/;SameSite=Lax`;
        
        const banner = document.getElementById('cookie-consent-banner');
        if (banner) {
            // Add a fade-out animation before hiding
            banner.style.opacity = '0';
            setTimeout(() => {
                banner.style.display = 'none';
            }, 500);
        }
    }

    /**
     * Creates and injects the professional cookie banner into the page.
     */
    function createBanner() {
        // 1. Create the main banner element
        const banner = document.createElement('div');
        banner.id = 'cookie-consent-banner';
        banner.innerHTML = `
            <div class="cookie-content">
                <div class="cookie-icon">
                    <i class="fas fa-cookie-bite"></i>
                </div>
                <div class="cookie-text-content">
                    <h3 class="cookie-title">خصوصيتك تهمنا</h3>
                    <p class="cookie-text">
                        نحن نستخدم ملفات تعريف الارتباط لتحسين تجربتك على موقعنا. من خلال الاستمرار في التصفح، فإنك توافق على استخدامنا لهذه الملفات. يمكنك معرفة المزيد من خلال الاطلاع على:
                    </p>
                    <div class="cookie-links">
                        <a href="privacy-policy.html" class="cookie-link">سياسة الخصوصية</a>
                        <a href="terms-and-conditions.html" class="cookie-link">الشروط والأحكام</a>
                        <a href="refund-policy.html" class="cookie-link">سياسة الاسترجاع</a>
                        <a href="data-deletion.html" class="cookie-link">سياسة حذف البيانات</a>
                    </div>
                </div>
            </div>
            <div class="cookie-actions">
                <button id="cookie-consent-accept" class="cookie-button">أوافق</button>
            </div>
        `;

        // 2. Create the style element
        const styles = document.createElement('style');
        styles.textContent = `
            #cookie-consent-banner {
                position: fixed;
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%) translateY(200%);
                width: calc(100% - 40px);
                max-width: 900px;
                background-color: #ffffff;
                color: #2c3e50;
                padding: 20px 25px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                z-index: 9999;
                border-radius: 12px;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
                animation: slideUp 0.5s 1s ease-in-out forwards;
                transition: opacity 0.5s ease;
            }
            @keyframes slideUp {
                to { transform: translateX(-50%) translateY(0); }
            }
            .cookie-content {
                display: flex;
                align-items: center;
                gap: 20px;
            }
            .cookie-icon i {
                font-size: 2.5rem;
                color: #0056b3;
            }
            .cookie-title {
                font-weight: 700;
                font-size: 1.1rem;
                margin: 0 0 5px 0;
            }
            .cookie-text {
                margin: 0;
                font-size: 0.9rem;
                color: #555;
            }
            .cookie-links {
                margin-top: 10px;
                display: flex;
                flex-wrap: wrap;
                gap: 15px;
            }
            .cookie-link {
                color: #0056b3;
                text-decoration: underline;
                font-size: 0.85rem;
                font-weight: 600;
            }
            .cookie-button {
                background-color: #0056b3;
                color: white;
                border: none;
                padding: 12px 30px;
                border-radius: 50px;
                cursor: pointer;
                font-family: 'Cairo', sans-serif;
                font-weight: 700;
                white-space: nowrap;
                transition: all 0.3s;
            }
            .cookie-button:hover {
                background-color: #00458e;
                transform: translateY(-2px);
            }
            @media (max-width: 768px) {
                #cookie-consent-banner {
                    flex-direction: column;
                    text-align: center;
                }
                .cookie-content {
                    flex-direction: column;
                    gap: 15px;
                }
                .cookie-actions {
                    width: 100%;
                    margin-top: 20px;
                }
                .cookie-button {
                    width: 100%;
                }
                .cookie-links {
                    justify-content: center;
                }
            }
        `;

        // 3. Append elements to the document
        document.head.appendChild(styles);
        document.body.appendChild(banner);

        // 4. Add event listener to the button
        document.getElementById('cookie-consent-accept').addEventListener('click', giveConsent);
    }

    // --- Main Logic ---
    if (!hasConsent()) {
        createBanner();
    }
});
