document.addEventListener('DOMContentLoaded', () => {
    renderOffers();
    startCountdown("2026-12-31T23:59:59"); // حدد تاريخ انتهاء العروض هنا
    updateCartIcon();
});

/**
 * دالة عرض المنتجات التي عليها تخفيضات فقط
 */
function renderOffers() {
    const products = JSON.parse(localStorage.getItem('DLUX_STORES')) || [];
    const grid = document.getElementById('offers-grid');
    
    // فلترة المنتجات: نفترض أن المنتج الذي عليه عرض لديه خاصية discountPrice أو هو في قسم offers
    const offerItems = products.filter(p => p.oldPrice || p.category === 'offers');

    if (offerItems.length === 0) {
        grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 50px;">
            <h3>لا توجد عروض نشطة حالياً. انتظرونا قريباً!</h3>
            <a href="index.html" class="view-btn" style="margin-top:20px; display:inline-block;">العودة للمتجر</a>
        </div>`;
        return;
    }

    grid.innerHTML = offerItems.map(p => {
        // حساب نسبة الخصم تلقائياً إذا وجد سعر قديم
        let discountPercent = "";
        if (p.oldPrice) {
            const calc = Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100);
            discountPercent = `<div class="discount-badge">خصم ${calc}%</div>`;
        }

        return `
            <div class="product-card">
                ${discountPercent}
                <div class="img-container">
                    <img src="${p.images[0]}" alt="${p.name}">
                    <div class="overlay">
                        <a href="product-details.html?id=${p.id}" class="view-btn">استكشف العرض</a>
                    </div>
                </div>
                <div class="info">
                    <span class="cat-tag">${p.category}</span>
                    <h3>${p.name}</h3>
                    <div class="price-row">
                        <span class="price" style="color: #e63946;">${Number(p.price).toLocaleString()} دج</span>
                        ${p.oldPrice ? `<span class="old-price">${Number(p.oldPrice).toLocaleString()} دج</span>` : ''}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * نظام العداد التنازلي
 */
function startCountdown(endDate) {
    const target = new Date(endDate).getTime();

    const interval = setInterval(() => {
        const now = new Date().getTime();
        const diff = target - now;

        if (diff < 0) {
            clearInterval(interval);
            document.getElementById('timer').innerHTML = "<h4>انتهت العروض!</h4>";
            return;
        }

        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);

        document.getElementById('days').innerText = d < 10 ? '0' + d : d;
        document.getElementById('hours').innerText = h < 10 ? '0' + h : h;
        document.getElementById('minutes').innerText = m < 10 ? '0' + m : m;
        document.getElementById('seconds').innerText = s < 10 ? '0' + s : s;
    }, 1000);
}

function updateCartIcon() {
    const cart = JSON.parse(localStorage.getItem('DLUX_CART_FINAL')) || [];
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const badge = document.getElementById('cart-count');
    if(badge) badge.innerText = count;
}