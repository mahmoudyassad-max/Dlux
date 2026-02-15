// توحيد اسم مفتاح التخزين
const STORAGE_KEY = 'DLUX_CART_FINAL';

document.addEventListener('DOMContentLoaded', () => {
    renderMyCart();
});

// 1. دالة عرض المنتجات في السلة
function renderMyCart() {
    const displayArea = document.getElementById('cart-render-area');
    const cartItems = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

    if (cartItems.length === 0) {
        displayArea.innerHTML = `
            <div style="text-align:center; padding:40px;">
                <i class="fas fa-shopping-basket" style="font-size:3rem; color:#ddd; margin-bottom:15px;"></i>
                <p>السلة فارغة حالياً</p>
                <a href="index.html" style="color:#e63946; text-decoration:none;">العودة للتسوق</a>
            </div>`;
        updatePriceSummary(0);
        return;
    }

    let subtotal = 0;
    displayArea.innerHTML = cartItems.map((item, index) => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        return `
            <div class="cart-item" style="display:flex; align-items:center; gap:15px; padding:15px 0; border-bottom:1px solid #eee;">
                <img src="${item.img}" width="70" height="70" style="object-fit:cover; border-radius:10px;">
                <div style="flex:1;">
                    <h4 style="margin:0; font-size:1rem;">${item.name}</h4>
                    <p style="margin:5px 0; color:#666; font-size:0.9rem;">${item.price} دج × ${item.quantity}</p>
                </div>
                <div style="font-weight:bold;">${itemTotal} دج</div>
                <button onclick="removeFromCart(${index})" style="background:none; border:none; color:#ff4d4d; cursor:pointer; font-size:1.1rem; padding:5px;">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        `;
    }).join('');

    updatePriceSummary(subtotal);
}

// 2. دالة حذف المنتج
window.removeFromCart = function(index) {
    let cart = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    cart.splice(index, 1); // حذف العنصر المختار من المصفوفة
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart)); // حفظ السلة الجديدة
    renderMyCart(); // إعادة عرض السلة فوراً
    updateCartBadge(); // تحديث الرقم في الهيدر
};

// 3. دالة حساب الشحن وتحديث الأرقام
window.updateShippingUI = function() {
    const subtotal = parseInt(document.getElementById('subtotal').innerText) || 0;
    const wilaya = document.getElementById('cust-wilaya').value;
    const type = document.getElementById('deliv-type').value;

    if (!wilaya || subtotal === 0) {
        document.getElementById('shipping-cost').innerText = "0";
        document.getElementById('final-total').innerText = subtotal;
        return;
    }

    let shippingCost = 700; // السعر الافتراضي
    if (wilaya === "16") shippingCost = 400; // العاصمة
    if (wilaya === "06" || wilaya === "31") shippingCost = 600; // ولايات رئيسية

    if (type === "home") shippingCost += 200; // زيادة للمنزل

    document.getElementById('shipping-cost').innerText = shippingCost;
    document.getElementById('final-total').innerText = subtotal + shippingCost;
};

// 4. تحديث ملخص السعر (يُستدعى عند الرندر)
function updatePriceSummary(subtotal) {
    document.getElementById('subtotal').innerText = subtotal;
    updateShippingUI(); // استدعاء حساب الشحن تلقائياً
    updateCartBadge();
}

// 5. تحديث أيقونة السلة في الأعلى
function updateCartBadge() {
    const cart = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    const count = cart.reduce((acc, item) => acc + item.quantity, 0);
    const badge = document.getElementById('cart-count');
    if (badge) badge.innerText = count;
}

// 6. تأكيد الطلب عبر واتساب
window.confirmOrder = function() {
    const cart = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    const name = document.getElementById('cust-name').value;
    const phone = document.getElementById('cust-phone').value;
    const wilaya = document.getElementById('cust-wilaya').options[document.getElementById('cust-wilaya').selectedIndex].text;
    const total = document.getElementById('final-total').innerText;

    if (!name || !phone || !wilaya || cart.length === 0) {
        alert("يرجى ملء البيانات وإضافة منتجات للسلة أولاً");
        return;
    }

    let message = `طلب جديد من متجر DLUX:\n`;
    message += `اسم الزبون: ${name}\nالهاتف: ${phone}\nالولاية: ${wilaya}\n\n`;
    message += `المنتجات:\n`;
    cart.forEach(item => {
        message += `- ${item.name} (${item.quantity} قطعة)\n`;
    });
    message += `\nالإجمالي النهائي: ${total} دج`;

    const encodedMsg = encodeURIComponent(message);
    window.open(`https://wa.me/213657900870?text=${encodedMsg}`); // استبدل بالأصفار رقمك
};