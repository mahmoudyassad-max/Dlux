const params = new URLSearchParams(window.location.search);
const currentId = params.get('id');
const STORAGE_KEY = 'DLUX_CART_FINAL'; 
const storeItems = JSON.parse(localStorage.getItem('DLUX_STORES')) || [];
const product = storeItems.find(item => item.id === currentId);

let userSelectedStars = 5;

document.addEventListener('DOMContentLoaded', () => {
    if (product) {
        renderDetails();
        renderRatings();
        renderRelated();
        initStars();
        updateCartBadge();
    } else {
        document.querySelector('.container').innerHTML = "<h2 style='text-align:center; padding:100px;'>المنتج غير موجود!</h2>";
    }
});

function renderDetails() {
    document.getElementById('p-title').innerText = product.name;
    document.getElementById('p-price').innerText = product.price + " دج";
    document.getElementById('main-frame').src = product.images[0];
    
    document.getElementById('thumbs-list').innerHTML = product.images.map((img, i) => 
        `<img src="${img}" class="thumb ${i===0?'active':''}" onclick="changeImg(this, '${img}')">`
    ).join('');

    document.getElementById('p-features').innerHTML = product.features
        .filter(f => f.trim() !== "").map(f => `<li>${f}</li>`).join('');
}

window.changeImg = (el, src) => {
    document.getElementById('main-frame').src = src;
    document.querySelectorAll('.thumb').forEach(t => t.classList.remove('active'));
    el.classList.add('active');
};

window.updateQty = (n) => {
    let input = document.getElementById('qty-val');
    let val = parseInt(input.value) + n;
    if (val < 1) val = 1;
    input.value = val;
};

// --- حل مشكلة الإضافة للسلة ---
window.addToCartGlobal = () => {
    const qty = parseInt(document.getElementById('qty-val').value);
    let cart = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    
    const idx = cart.findIndex(i => i.id === product.id);
    if (idx > -1) {
        cart[idx].quantity += qty;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: parseInt(product.price),
            img: product.images[0],
            quantity: qty
        });
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    alert("تمت إضافة المنتج إلى السلة ✅");
    updateCartBadge();
};

function updateCartBadge() {
    const cart = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    const count = cart.reduce((s, i) => s + i.quantity, 0);
    const badge = document.getElementById('cart-count');
    if (badge) badge.innerText = count;
}

// --- نظام التقييم والمنتجات المشابهة ---
function initStars() {
    const stars = document.querySelectorAll('#stars-selector i');
    stars.forEach(s => {
        s.addEventListener('click', () => {
            userSelectedStars = parseInt(s.dataset.value);
            stars.forEach((star, i) => star.classList.toggle('active', i < userSelectedStars));
        });
    });
}

window.submitGlobalRating = () => {
    const pIdx = storeItems.findIndex(p => p.id === currentId);
    if (!storeItems[pIdx].ratings) storeItems[pIdx].ratings = [];
    storeItems[pIdx].ratings.push(userSelectedStars);
    localStorage.setItem('DLUX_STORES', JSON.stringify(storeItems));
    alert("شكراً لتقييمك!");
    location.reload();
};

function renderRatings() {
    const ratings = product.ratings || [];
    const avg = ratings.length ? (ratings.reduce((a,b)=>a+b,0)/ratings.length).toFixed(1) : "0.0";
    document.getElementById('avg-num').innerText = avg;
    document.getElementById('rating-big-num').innerText = avg;
    document.getElementById('total-reviews-label').innerText = `${ratings.length} تقييم`;
}

function renderRelated() {
    const relatedGrid = document.getElementById('related-prods-grid');
    if (!relatedGrid) return;

    // جلب المنتجات التي تنتمي لنفس التصنيف (إن وجد) أو منتجات عشوائية
    // مع استثناء المنتج الحالي المعروض حالياً
    const related = storeItems
        .filter(p => p.id !== currentId)
        .sort(() => 0.5 - Math.random()) // ترتيب عشوائي للتغيير
        .slice(0, 4); // عرض 4 منتجات فقط

    if (related.length === 0) {
        document.querySelector('.related-section').style.display = 'none';
        return;
    }

    relatedGrid.innerHTML = related.map(p => `
        <a href="product-details.html?id=${p.id}" class="related-card">
            <div class="img-wrapper">
                <img src="${p.images[0]}" alt="${p.name}">
            </div>
            <div class="info">
                <h4>${p.name}</h4>
                <div class="price">${p.price} دج</div>
            </div>
        </a>
    `).join('');
}