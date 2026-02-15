document.addEventListener('DOMContentLoaded', () => {
    // تشغيل العرض الأولي للمنتجات
    renderStore();
    updateCartIcon();

    // ربط البحث المباشر
    const searchInput = document.getElementById('live-search');
    if (searchInput) {
        searchInput.addEventListener('input', () => renderStore());
    }

    // ربط فلتر السعر
    const priceRange = document.getElementById('price-range');
    if (priceRange) {
        priceRange.addEventListener('input', (e) => {
            const val = e.target.value;
            document.getElementById('price-value').innerText = Number(val).toLocaleString() + " دج";
            renderStore();
        });
    }
});

/**
 * الدالة الشاملة لعرض المنتجات مع الفلترة والبحث
 */
function renderStore(categoryFilter = "") {
    const products = JSON.parse(localStorage.getItem('DLUX_STORES')) || [];
    const searchTerm = document.getElementById('live-search')?.value.toLowerCase().trim() || "";
    const maxPrice = document.getElementById('price-range')?.value || 10000000;
    const noResultsEl = document.getElementById('no-results');
    
    // معرفات الشبكات في HTML
    const grids = {
        'electronics': document.getElementById('electronics-grid'),
        'watches': document.getElementById('watches-grid'),
        'perfumes': document.getElementById('perfumes-grid'),
        'clothes': document.getElementById('clothes-grid')
    };

    // 1. تنظيف جميع الشبكات قبل إعادة الرسم
    Object.values(grids).forEach(grid => {
        if (grid) grid.innerHTML = "";
    });

    // 2. تصفية المنتجات بناءً على (البحث + السعر + القسم المختار)
    const filtered = products.filter(p => {
        const matchesName = p.name.toLowerCase().includes(searchTerm);
        const matchesPrice = Number(p.price) <= Number(maxPrice);
        const matchesCategory = categoryFilter === "" || p.category === categoryFilter;
        return matchesName && matchesPrice && matchesCategory;
    });

    // 3. التحكم في رسالة "لا توجد نتائج"
    if (filtered.length === 0 && (searchTerm !== "" || categoryFilter !== "")) {
        if (noResultsEl) noResultsEl.style.display = "block";
        toggleSectionsVisibility('none');
// ... داخل دالة renderStore بعد عملية الفلترة ...

    } else {
        // إخفاء رسالة "لا توجد نتائج" وإظهار الأقسام
        if (noResultsEl) noResultsEl.style.display = "none";
        toggleSectionsVisibility('block');

        // 4. رسم المنتجات المفلترة بالتصميم الجديد
        filtered.forEach(p => {
            const targetGrid = grids[p.category];
            if (targetGrid) {
                targetGrid.innerHTML += `
                    <div class="product-card" style="animation: fadeInUp 0.5s ease-out forwards;">
                        <div class="img-container">
                            <img src="${p.images[0]}" alt="${p.name}">
                            <div class="overlay">
                                <a href="product-details.html?id=${p.id}" class="view-btn">استكشف القطعة</a>
                            </div>
                        </div>
                        <div class="info">
                            <span class="cat-tag">${getArName(p.category)}</span>
                            <h3>${p.name}</h3>
                            <div class="price-row">
                                <span class="price">${Number(p.price).toLocaleString()} <small>دج</small></span>
                            </div>
                        </div>
                    </div>
                `;
            }
        }); // إغلاق الـ forEach بشكل صحيح
    }

    // 5. إخفاء الأقسام الفارغة أثناء البحث أو الفلترة
    handleEmptySections(grids, searchTerm !== "" || categoryFilter !== "");
}
    
    // 5. إخفاء الأقسام الفارغة أثناء البحث
    handleEmptySections(grids, searchTerm !== "" || categoryFilter !== "");
 

/**
 * وظائف مساعدة
 */
function handleEmptySections(grids, isSearching) {
    Object.keys(grids).forEach(key => {
        const grid = grids[key];
        const section = grid?.closest('.products-section');
        if (section) {
            if (grid.innerHTML === "" && isSearching) {
                section.style.display = "none";
            } else {
                section.style.display = "block";
            }
        }
    });
}

function toggleSectionsVisibility(state) {
    document.querySelectorAll('.products-section').forEach(sec => {
        sec.style.display = state;
    });
}

function getArName(cat) {
    const names = { 
        'electronics': 'إلكترونيات ذكية', 
        'watches': 'ساعة فاخرة', 
        'perfumes': 'عطر ملكي', 
        'clothes': 'أزياء راقية' 
    };
    return names[cat] || 'منتج مميز';
}

function updateCartIcon() {
    const cart = JSON.parse(localStorage.getItem('DLUX_CART_FINAL')) || [];
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const badge = document.getElementById('cart-count');
    if (badge) badge.innerText = count;
}

window.resetSearch = function() {
    const searchInput = document.getElementById('live-search');
    const priceRange = document.getElementById('price-range');
    if (searchInput) searchInput.value = "";
    if (priceRange) {
        priceRange.value = 1000000;
        document.getElementById('price-value').innerText = "100,000 دج";
    }
    renderStore("");
};

// منع الزر الأيمن للفأرة
document.addEventListener('contextmenu', e => e.preventDefault());

// منع اختصار F12 و Ctrl+Shift+I
document.onkeydown = function(e) {
    if (e.keyCode == 123 || (e.ctrlKey && e.shiftKey && e.keyCode == 73)) {
        return false;
    }
};
