// ===== CONFIG =====
const API_URL = "https://shahid0812-Api.hf.space";
let userId = localStorage.getItem('bella_user_id');
if (!userId) {
    userId = 'user_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('bella_user_id', userId);
}

// ===== DOM REFS =====
const chatBox = document.getElementById('chatBox');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const remainingDisplay = document.getElementById('remainingDisplay');

// ===== THEME TOGGLE =====
const themeToggle = document.getElementById('themeToggle');
const currentTheme = localStorage.getItem('bella_theme') || 'light';
document.documentElement.setAttribute('data-theme', currentTheme);
updateThemeIcon(currentTheme);

themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('bella_theme', next);
    updateThemeIcon(next);
});

function updateThemeIcon(theme) {
    themeToggle.innerHTML = theme === 'light' 
        ? '<i class="fas fa-moon"></i>' 
        : '<i class="fas fa-sun"></i>';
}

// ===== TYPEWRITER EFFECT =====
function typeWriter(element, text, speed = 20) {
    return new Promise((resolve) => {
        let index = 0;
        element.textContent = '';
        const cursor = document.createElement('span');
        cursor.className = 'typing-cursor';
        element.appendChild(cursor);

        function typeChar() {
            if (index < text.length) {
                cursor.before(document.createTextNode(text.charAt(index)));
                index++;
                setTimeout(typeChar, speed);
            } else {
                cursor.remove();
                resolve();
            }
        }
        typeChar();
    });
}

// ===== SEND MESSAGE =====
async function sendMessage() {
    const msg = userInput.value.trim();
    if (!msg) return;

    // Add user message
    addMessage(msg, 'user');
    userInput.value = '';
    sendBtn.disabled = true;
    sendBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

    // Create a NEW bot message container
    const botMsgDiv = document.createElement('div');
    botMsgDiv.className = 'message bot-message';
    botMsgDiv.innerHTML = `
        <div class="avatar">🤖</div>
        <div class="bubble" id="typingBubble"></div>
    `;
    chatBox.appendChild(botMsgDiv);
    const bubble = botMsgDiv.querySelector('.bubble');
    bubble.textContent = '🤔 Thinking...';
    chatBox.scrollTop = chatBox.scrollHeight;

    try {
        const resp = await fetch(`${API_URL}/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: msg, user_id: userId })
        });

        const data = await resp.json();

        if (!resp.ok) {
            throw new Error(data.detail || 'Something went wrong');
        }

        // Typewriter effect on the new bubble
        await typeWriter(bubble, data.response, 20);

        // Update remaining display
        if (data.remaining !== undefined) {
            remainingDisplay.innerHTML = `<i class="fas fa-infinity"></i> ${data.remaining} remaining`;
        }

    } catch (err) {
        bubble.textContent = '😅 Oops! ' + err.message;
    }

    sendBtn.disabled = false;
    sendBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Send';
    chatBox.scrollTop = chatBox.scrollHeight;
}

function addMessage(text, type) {
    const div = document.createElement('div');
    div.className = `message ${type}-message`;
    const avatar = type === 'user' ? '🧑' : '🤖';
    div.innerHTML = `
        <div class="avatar">${avatar}</div>
        <div class="bubble">${escapeHtml(text)}</div>
    `;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function escapeHtml(text) {
    const d = document.createElement('div');
    d.textContent = text;
    return d.innerHTML;
}

// ===== EVENT LISTENERS =====
sendBtn.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

// ===== WAITLIST =====
const waitlistForm = document.getElementById('waitlistForm');
const waitlistEmail = document.getElementById('waitlistEmail');
const waitlistMsg = document.getElementById('waitlistMessage');

waitlistForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = waitlistEmail.value.trim();
    if (!email) return;

    waitlistMsg.textContent = '⏳ Submitting...';
    waitlistMsg.style.color = 'var(--text-muted)';

    try {
        const resp = await fetch(`${API_URL}/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, name: '' })
        });
        const data = await resp.json();
        waitlistMsg.textContent = '✅ ' + data.message;
        waitlistMsg.style.color = '#10b981';
        waitlistEmail.value = '';
        showToast('You\'re on the waitlist! 🎉');
    } catch (err) {
        waitlistMsg.textContent = '❌ Something went wrong. Try again.';
        waitlistMsg.style.color = '#ef4444';
    }
});

// ===== FAQ ACCORDION =====
document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
        const item = btn.parentElement;
        const isActive = item.classList.contains('active');
        document.querySelectorAll('.faq-item').forEach(el => el.classList.remove('active'));
        if (!isActive) item.classList.add('active');
    });
});

// ===== TOAST =====
function showToast(msg) {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 4000);
}

// ===== AUTO-FOCUS =====
userInput.focus();

console.log('🤖 Bella AI loaded! User:', userId);
