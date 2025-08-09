// /chatbot.js - Version 4.0 (Proactive, File Analysis, Interactive UI)
document.addEventListener('DOMContentLoaded', () => {
    const WORKER_URL = 'https://orders-worker.radwanyhassan75.workers.dev';

    // Load Tone.js for sound effects and Marked.js for Markdown rendering
    const toneScript = document.createElement('script');
    toneScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/tone/14.7.77/Tone.js';
    document.head.appendChild(toneScript);

    const markedScript = document.createElement('script');
    markedScript.src = 'https://cdn.jsdelivr.net/npm/marked/marked.min.js';
    document.head.appendChild(markedScript);

    // 1. Create Chatbot UI Elements (Major Overhaul)
    const chatContainer = document.createElement('div');
    chatContainer.id = 'chat-container';
    chatContainer.style.cssText = `
        position: fixed;
        bottom: 25px;
        right: 25px;
        z-index: 1000;
        direction: rtl;
    `;

    const chatButton = document.createElement('button');
    chatButton.id = 'chat-button';
    chatButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17 18a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2"/>
            <rect x="3" y="11" width="18" height="10" rx="2"/>
            <circle cx="12" cy="5" r="3"/>
            <path d="M4 11V9a2 2 0 0 1 2-2h1"/>
            <path d="M20 9v2"/>
        </svg>
    `;
    chatButton.style.cssText = `
        background-color: #0056b3;
        color: white;
        border: none;
        border-radius: 50%;
        width: 60px;
        height: 60px;
        cursor: pointer;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        display: flex;
        justify-content: center;
        align-items: center;
        transition: transform 0.2s, box-shadow 0.2s;
        transform: scale(0);
        animation: pop-in 0.5s 1s forwards cubic-bezier(0.175, 0.885, 0.32, 1.275);
    `;

    const chatWindow = document.createElement('div');
    chatWindow.id = 'chat-window';
    chatWindow.style.cssText = `
        width: 400px;
        max-height: 80vh;
        background-color: white;
        border-radius: 15px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
        display: none;
        flex-direction: column;
        overflow: hidden;
        position: absolute;
        bottom: 80px;
        right: 0;
        font-family: 'Cairo', sans-serif;
        transform: translateY(20px);
        opacity: 0;
        transition: transform 0.3s ease-out, opacity 0.3s ease-out;
    `;

    // -- NEW PROFESSIONAL UI --
    chatWindow.innerHTML = `
        <div id="chat-header" style="background: linear-gradient(135deg, #0056b3, #003a75); color: white; padding: 15px 20px; text-align: right; border-bottom: 1px solid #003a75; display: flex; justify-content: space-between; align-items: center;">
            <div>
                <h3 style="margin: 0; font-size: 1.1rem; font-weight: 700;">المساعد الذكي</h3>
                <p style="margin: 2px 0 0; font-size: 0.8rem; opacity: 0.9; display: flex; align-items: center; gap: 5px;"><span style="color: #32de84; font-size: 1.2em;">●</span>متصل الآن</p>
            </div>
            <button id="close-chat" style="background: none; border: none; color: white; font-size: 24px; cursor: pointer; opacity: 0.8;">&times;</button>
        </div>
        
        <div id="chat-quick-actions" style="display: flex; justify-content: space-around; padding: 10px; background: #f8f9fa; border-bottom: 1px solid #eee;">
            <button class="quick-action-btn" data-command="__GET_MY_ORDERS__"><i class="fas fa-receipt"></i> طلباتي</button>
            <button class="quick-action-btn" data-command="__GET_MY_TICKETS__"><i class="fas fa-life-ring"></i> الدعم</button>
            <button id="upload-file-btn" class="quick-action-btn"><i class="fas fa-paperclip"></i> رفع ملف</button>
        </div>

        <div id="chat-body" style="flex-grow: 1; padding: 20px; overflow-y: auto; background-color: #f0f2f5;"></div>
        
        <div id="chat-footer" style="padding: 15px 20px; border-top: 1px solid #eee; background-color: white;">
            <form id="chat-form" style="display: flex; gap: 10px; align-items: center;">
                <input type="text" id="chat-input" placeholder="اكتب سؤالك هنا..." autocomplete="off" style="flex-grow: 1; border: 1px solid #ddd; border-radius: 25px; padding: 12px 18px; font-family: 'Cairo', sans-serif; font-size: 1rem; transition: border-color 0.2s;">
                <button type="submit" id="chat-submit-btn" style="background-color: #0056b3; color: white; border: none; border-radius: 50%; width: 45px; height: 45px; font-size: 18px; cursor: pointer; display: flex; justify-content: center; align-items: center; transition: background-color 0.2s;"><i class="fas fa-paper-plane"></i></button>
            </form>
        </div>
        <input type="file" id="file-input-hidden" style="display: none;" />
    `;

    chatContainer.appendChild(chatButton);
    chatContainer.appendChild(chatWindow);
    document.body.appendChild(chatContainer);

    // -- NEW STYLES --
    const styleSheet = document.createElement("style");
    styleSheet.textContent = `
        @keyframes pop-in { from { transform: scale(0); } to { transform: scale(1); } }
        #chat-input:focus { outline: none; border-color: #0056b3; }
        #chat-submit-btn:hover { background-color: #003a75; }
        .quick-action-btn { background: #fff; border: 1px solid #ddd; color: #333; padding: 8px 12px; border-radius: 20px; cursor: pointer; font-family: 'Cairo', sans-serif; font-size: 0.85rem; display: flex; align-items: center; gap: 5px; transition: all 0.2s ease; }
        .quick-action-btn:hover { background: #e9ecef; border-color: #ccc; }
        .quick-action-btn i { color: #0056b3; }
        .bot-message-content a { color: #0056b3; text-decoration: underline; font-weight: bold; }
        .bot-message-content ul, .bot-message-content ol { padding-right: 20px; }
        .bot-message-content li { margin-bottom: 5px; }
        .bot-message-content p { margin: 0 0 10px; }
        .bot-message-content p:last-child { margin-bottom: 0; }
        .bot-message-content strong, .bot-message-content b { color: #003a75; }
        .chat-interactive-btn { background-color: #0056b31a; border: 1px solid #0056b3; color: #0056b3; padding: 8px 12px; border-radius: 8px; margin: 5px 5px 5px 0; cursor: pointer; font-weight: bold; font-family: 'Cairo', sans-serif; }
        .chat-interactive-btn:hover { background-color: #0056b33a; }
    `;
    document.head.appendChild(styleSheet);

    const closeChatBtn = document.getElementById('close-chat');
    const chatBody = document.getElementById('chat-body');
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const fileInputHidden = document.getElementById('file-input-hidden');
    const uploadFileBtn = document.getElementById('upload-file-btn');
    let synths = {};

    toneScript.onload = () => {
        synths.send = new Tone.Synth({ oscillator: { type: 'sine' }, envelope: { attack: 0.005, decay: 0.1, sustain: 0.3, release: 0.1 } }).toDestination();
        synths.receive = new Tone.Synth({ oscillator: { type: 'triangle' }, envelope: { attack: 0.005, decay: 0.1, sustain: 0.3, release: 0.1 } }).toDestination();
    };

    function playSound(type) {
        if (window.Tone && synths[type] && Tone.context.state !== 'running') {
            Tone.start();
        }
        if (window.Tone && synths[type]) {
            const note = type === 'send' ? 'C5' : 'G4';
            synths[type].triggerAttackRelease(note, "8n", Tone.now());
        }
    }

    // --- PROACTIVE GREETING ---
    chatButton.addEventListener('click', () => {
        chatWindow.style.display = 'flex';
        setTimeout(() => {
            chatWindow.style.transform = 'translateY(0)';
            chatWindow.style.opacity = '1';
        }, 10);
        chatButton.style.display = 'none';

        // Check if chat is empty to show initial message
        if (chatBody.children.length === 0) {
            let userId = null;
            // Safely check if Firebase is loaded and a user is logged in
            if (typeof firebase !== 'undefined' && firebase.auth().currentUser) {
                userId = firebase.auth().currentUser.uid;
            }

            if (userId) {
                // Send a special command to the backend to get a personalized summary
                getBotResponse('__GET_USER_SUMMARY__');
            } else {
                // Generic greeting for guests
                addMessage('bot', 'مرحباً بك! أنا المساعد الذكي للمكتب الرقمي. كيف يمكنني مساعدتك اليوم؟');
            }
        }
    });

    closeChatBtn.addEventListener('click', () => {
        chatWindow.style.transform = 'translateY(20px)';
        chatWindow.style.opacity = '0';
        setTimeout(() => {
            chatWindow.style.display = 'none';
            chatButton.style.display = 'flex';
        }, 300);
    });

    // --- NEW: QUICK ACTIONS LISTENERS ---
    document.querySelectorAll('.quick-action-btn').forEach(btn => {
        if (btn.id !== 'upload-file-btn') {
            btn.addEventListener('click', () => {
                const command = btn.getAttribute('data-command');
                // Simulate user typing the command for a more natural flow
                addMessage('user', btn.innerText);
                getBotResponse(command);
            });
        }
    });

    uploadFileBtn.addEventListener('click', () => {
        fileInputHidden.click();
    });

    fileInputHidden.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            handleFileUpload(file);
        }
        event.target.value = ''; // Reset for re-uploading the same file
    });

    // --- NEW: INTERACTIVE MESSAGE LISTENER ---
    chatBody.addEventListener('click', (e) => {
        const target = e.target.closest('[data-command]');
        if (target && target.classList.contains('chat-interactive-btn')) {
            const command = target.getAttribute('data-command');
            const displayText = target.innerText;
            addMessage('user', `الاطلاع على: ${displayText}`);
            getBotResponse(command);
        }
    });


    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const userMessage = chatInput.value.trim();
        if (userMessage) {
            addMessage('user', userMessage);
            playSound('send');
            chatInput.value = '';
            getBotResponse(userMessage);
        }
    });

    function addMessage(sender, text) {
        const messageDiv = document.createElement('div');
        messageDiv.style.cssText = `
            padding: 12px 18px; border-radius: 18px; margin-bottom: 10px;
            max-width: 85%; line-height: 1.6;
            opacity: 0; transform: translateY(10px);
            animation: slide-in 0.3s forwards ease-out;
        `;

        if (sender === 'user') {
            messageDiv.style.backgroundColor = '#0056b3';
            messageDiv.style.color = 'white';
            messageDiv.style.marginLeft = 'auto';
            messageDiv.style.borderBottomRightRadius = '5px';
            messageDiv.textContent = text;
        } else {
            messageDiv.style.backgroundColor = '#ffffff';
            messageDiv.style.color = '#333';
            messageDiv.style.marginRight = 'auto';
            messageDiv.style.borderBottomLeftRadius = '5px';
            messageDiv.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)';

            if (window.marked) {
                const contentDiv = document.createElement('div');
                contentDiv.className = 'bot-message-content';
                let html = marked.parse(text, { sanitize: true });

                // NEW: Make specific items like order numbers interactive buttons
                html = html.replace(/\[(الطلب\s*(KH-\d+))\]/g, `<button class="chat-interactive-btn" data-command="تتبع الطلب $2">$1</button>`);
                html = html.replace(/\[(التذكرة\s*(TICKET-\d+))\]/g, `<button class="chat-interactive-btn" data-command="تتبع تذكرة $2">$1</button>`);

                contentDiv.innerHTML = html;
                messageDiv.appendChild(contentDiv);
            } else {
                messageDiv.textContent = text;
            }
        }

        chatBody.appendChild(messageDiv);
        chatBody.scrollTop = chatBody.scrollHeight;

        const style = document.createElement('style');
        style.innerHTML = `@keyframes slide-in { to { opacity: 1; transform: translateY(0); } }`;
        document.head.appendChild(style);
    }
    
    // --- NEW: File Upload Handler ---
    async function handleFileUpload(file) {
        addMessage('user', `تم رفع الملف: ${file.name}`);
        showTypingIndicator();

        const formData = new FormData();
        formData.append('file', file);
        formData.append('message', `حلل هذا المستند ${file.name} وأعطني ملخصاً.`);

        try {
            const response = await fetch(`${WORKER_URL}/api/analyze-document`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                 console.error("File Analysis Error:", errorData);
                throw new Error(`File analysis failed.`);
            }

            const data = await response.json();
            removeTypingIndicator();
            playSound('receive');
            addMessage('bot', `**تحليل الملف (${file.name}):**\n\n${data.reply}`);

        } catch (error) {
            console.error('Error during file upload:', error);
            removeTypingIndicator();
            addMessage('bot', 'عذراً، حدث خطأ أثناء تحليل الملف. يرجى التأكد من أن الملف غير تالف والمحاولة مرة أخرى.');
        }
    }


    function showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.id = 'typing-indicator';
        typingDiv.style.cssText = `
            background-color: #ffffff; color: #333; align-self: flex-start; margin-right: auto;
            padding: 12px 15px; border-radius: 18px; margin-bottom: 10px;
            box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        `;
        typingDiv.innerHTML = `<span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: #999; animation: bounce 1.2s infinite 0s;"></span>
                                <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: #999; animation: bounce 1.2s infinite 0.2s; margin: 0 3px;"></span>
                                <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: #999; animation: bounce 1.2s infinite 0.4s;"></span>`;
        chatBody.appendChild(typingDiv);
        chatBody.scrollTop = chatBody.scrollHeight;

        const style = document.createElement('style');
        style.innerHTML = `@keyframes bounce { 0%, 60%, 100% { transform: scale(0.8); } 30% { transform: scale(1.1); } }`;
        document.head.appendChild(style);
    }

    function removeTypingIndicator() {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) indicator.remove();
    }

    async function getBotResponse(userMessage) {
        showTypingIndicator();
        let userId = null;
        if (typeof firebase !== 'undefined' && firebase.auth().currentUser) {
            userId = firebase.auth().currentUser.uid;
        }

        try {
            const response = await fetch(`${WORKER_URL}/api/chatbot`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMessage, userId: userId })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("API Error details:", errorData);
                throw new Error(`Network response was not ok. Status: ${response.status}`);
            }

            const data = await response.json();
            removeTypingIndicator();
            playSound('receive');
            addMessage('bot', data.reply);

        } catch (error) {
            console.error('Error fetching bot response:', error);
            removeTypingIndicator();
            playSound('receive');
            addMessage('bot', 'عذراً، حدث خطأ ما. يرجى المحاولة مرة أخرى أو التواصل معنا مباشرة.');
        }
    }
});