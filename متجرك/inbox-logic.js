// --- بداية كود الحماية ---
(function checkAuth() {
    const ADMIN_PASSWORD = "123"; // اختر كلمة سرك هنا
    if (sessionStorage.getItem('admin_auth') !== 'true') {
        const password = prompt("منطقة محمية! أدخل كلمة مرور الإدارة:");
        if (password === ADMIN_PASSWORD) {
            sessionStorage.setItem('admin_auth', 'true');
        } else {
            alert("كلمة مرور خاطئة!");
            window.location.href = "index.html"; // يطرده للرئيسية
        }
    }
})();
// --- نهاية كود الحماية ---




const SHARED_KEY = 'DLUX_CHAT_DATA';
let activeChatId = null;

document.addEventListener('DOMContentLoaded', () => {
    // تحديث مستمر للقائمة والشات
    setInterval(() => {
        renderSidebar();
        if (activeChatId) renderActiveChat();
    }, 1000);

    const sendBtn = document.getElementById('admin-send-btn');
    const replyInput = document.getElementById('admin-reply-input');

    if (sendBtn) {
        sendBtn.onclick = () => {
            const text = replyInput.value.trim();
            if (!text || !activeChatId) return;

            let chats = JSON.parse(localStorage.getItem(SHARED_KEY)) || [];
            let idx = chats.findIndex(c => c.id === activeChatId);

            if (idx !== -1) {
                // التأكد من وجود مصفوفة الرسائل قبل الإضافة إليها
                if (!chats[idx].messages) chats[idx].messages = [];
                
                chats[idx].messages.push({ sender: 'admin', text: text });
                chats[idx].lastUpdate = Date.now();
                
                localStorage.setItem(SHARED_KEY, JSON.stringify(chats));
                replyInput.value = ""; // مسح الخانة بعد الإرسال
                renderActiveChat();
            }
        };
    }
});

function renderSidebar() {
    const sidebar = document.getElementById('inbox-list-sidebar');
    const chats = JSON.parse(localStorage.getItem(SHARED_KEY)) || [];
    if (!sidebar) return;

    if (chats.length === 0) {
        sidebar.innerHTML = '<p style="text-align:center; padding:20px;">لا توجد رسائل</p>';
        return;
    }

    sidebar.innerHTML = chats.sort((a,b) => b.lastUpdate - a.lastUpdate).map(c => {
        const msgs = c.messages || [];
        const lastMsgText = msgs.length > 0 ? msgs[msgs.length - 1].text : "محادثة فارغة";

        return `
        <div class="msg-item ${activeChatId === c.id ? 'active' : ''}" onclick="selectChat('${c.id}')">
            <strong>${c.name}</strong>
            <p style="font-size:0.8rem; color:#666; margin:0;">${lastMsgText.substring(0, 25)}...</p>
            <i class="fas fa-trash-alt delete-btn" onclick="event.stopPropagation(); deleteChat('${c.id}')" title="حذف المحادثة"></i>
        </div>`;
    }).join('');
}

window.selectChat = function(id) {
    activeChatId = id;
    const area = document.getElementById('admin-reply-area');
    if (area) area.style.display = 'flex'; // إظهار منطقة الإرسال
    renderActiveChat();
};

function renderActiveChat() {
    const chats = JSON.parse(localStorage.getItem(SHARED_KEY)) || [];
    const chat = chats.find(c => c.id === activeChatId);
    const box = document.getElementById('active-chat-box');

    if (chat && box && chat.messages) {
        const html = chat.messages.map(m => `
            <div class="bubble ${m.sender === 'admin' ? 'admin' : 'customer'}">
                ${m.text}
            </div>
        `).join('');
        if (box.innerHTML !== html) {
            box.innerHTML = html;
            box.scrollTop = box.scrollHeight;
        }
    }
}
window.deleteChat = function(id) {
    if (!confirm('هل أنت متأكد من حذف هذه المحادثة نهائياً؟')) return;

    let chats = JSON.parse(localStorage.getItem(SHARED_KEY)) || [];
    // فلترة المصفوفة لإزالة الزبون المختار
    chats = chats.filter(c => c.id !== id);
    
    localStorage.setItem(SHARED_KEY, JSON.stringify(chats));

    // إذا كانت المحادثة المحذوفة هي المفتوحة حالياً، قم بإغلاق نافذة الشات
    if (activeChatId === id) {
        activeChatId = null;
        document.getElementById('active-chat-box').innerHTML = '<p style="text-align:center; color:#999; margin-top:100px;">اختر زبوناً لبدء المحادثة</p>';
        document.getElementById('admin-reply-area').style.display = 'none';
    }

    renderSidebar();
};

// دالة لتنظيف النصوص ومنع تشغيل أي كود HTML مرسل
function cleanText(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}