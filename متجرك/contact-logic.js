const SHARED_KEY = 'DLUX_CHAT_DATA';

document.addEventListener('DOMContentLoaded', () => {
    // 1. توليد معرف فريد للزبون إذا لم يكن موجوداً
    if (!localStorage.getItem('MY_PRIVATE_ID')) {
        localStorage.setItem('MY_PRIVATE_ID', 'CUST-' + Date.now() + '-' + Math.floor(Math.random() * 1000));
    }

    const myId = localStorage.getItem('MY_PRIVATE_ID');
    const sendBtn = document.getElementById('send-btn');
    const userInput = document.getElementById('user-input');

    // تحديث الشاشة فوراً وعند استقبال ردود
    refreshUI(myId);
    setInterval(() => refreshUI(myId), 1000);

    // برمجة زر الإرسال
    if (sendBtn) {
        sendBtn.onclick = (e) => {
            e.preventDefault(); // منع أي سلوك افتراضي
            const text = userInput.value.trim();
            if (!text) return;

            let allChats = JSON.parse(localStorage.getItem(SHARED_KEY)) || [];
            let myChatIdx = allChats.findIndex(c => c.id === myId);

            if (myChatIdx !== -1) {
                // التأكد من تهيئة مصفوفة الرسائل
                if (!allChats[myChatIdx].messages) allChats[myChatIdx].messages = [];
                allChats[myChatIdx].messages.push({ sender: 'user', text: text });
                allChats[myChatIdx].lastUpdate = Date.now();
            } else {
                // إنشاء محادثة جديدة لهذا الزبون
                allChats.push({
                    id: myId,
                    name: "زبون " + myId.slice(-4),
                    messages: [{ sender: 'user', text: text }],
                    lastUpdate: Date.now()
                });
            }

            localStorage.setItem(SHARED_KEY, JSON.stringify(allChats));
            userInput.value = ""; // تفريغ الحقل
            refreshUI(myId); // تحديث الواجهة فوراً
        };
    }
});

function refreshUI(myId) {
    const allChats = JSON.parse(localStorage.getItem(SHARED_KEY)) || [];
    const myChat = allChats.find(c => c.id === myId);
    const box = document.getElementById('chat-box');

    if (myChat && box && myChat.messages) {
        const html = myChat.messages.map(m => `
            <div class="message ${m.sender === 'user' ? 'user' : 'bot'}">
                ${m.text}
            </div>
        `).join('');

        if (box.innerHTML !== html) {
            box.innerHTML = html;
            box.scrollTop = box.scrollHeight;
        }
    }
}

// دالة لتنظيف النصوص ومنع تشغيل أي كود HTML مرسل
function cleanText(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}


// منع الزر الأيمن للفأرة
document.addEventListener('contextmenu', e => e.preventDefault());

// منع اختصار F12 و Ctrl+Shift+I
document.onkeydown = function(e) {
    if (e.keyCode == 123 || (e.ctrlKey && e.shiftKey && e.keyCode == 73)) {
        return false;
    }
};

