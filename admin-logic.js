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

// بعد ذلك يبدأ كودك القديم
const SHARED_KEY = 'DLUX_CHAT_DATA';
// ... بقية الكود



let uploadedImages = [];
const STORAGE_KEY = 'DLUX_STORES';

// 1. معالجة الصور وتصغيرها فور اختيارها
document.getElementById('p-files').addEventListener('change', function(e) {
    const files = e.target.files;
    const previewArea = document.getElementById('image-preview-area');
    previewArea.innerHTML = "";
    uploadedImages = [];

    Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = function(event) {
            const img = new Image();
            img.src = event.target.result;
            img.onload = function() {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                const maxWidth = 500; 
                const scale = maxWidth / img.width;
                canvas.width = maxWidth;
                canvas.height = img.height * scale;
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                
                const base64 = canvas.toDataURL('image/jpeg', 0.7);
                uploadedImages.push(base64);
                previewArea.innerHTML += `<img src="${base64}">`;
            };
        };
        reader.readAsDataURL(file);
    });
});

// 2. دالة حفظ المنتج الموحدة
// 2. دالة حفظ المنتج الموحدة (المعدلة لدعم العروض)
function handleSaveProduct() {
    const name = document.getElementById('p-name').value;
    const price = document.getElementById('p-price').value;
    // جلب السعر القديم من الحقل الجديد الذي أضفته في HTML
    const oldPrice = document.getElementById('prod-old-price').value; 
    const category = document.getElementById('p-category').value;
    const features = document.getElementById('p-features').value.split('\n').filter(f => f.trim() !== "");

    if (!name || !price || uploadedImages.length === 0) {
        alert("❌ يرجى ملء البيانات ورفع صورة واحدة على الأقل");
        return;
    }

    const newProduct = {
        id: "prod_" + Date.now(),
        name: name,
        price: price,
        // حفظ السعر القديم كرقم إذا وُجد، أو null إذا كان فارغاً
        oldPrice: oldPrice ? oldPrice : null, 
        category: category,
        images: uploadedImages,
        features: features,
        ratings: []
    };

    let products = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    products.push(newProduct);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));

    alert("✅ تم النشر بنجاح! سيظهر المنتج في صفحة العروض إذا أضفت سعراً قديماً.");
    location.reload(); 
}

// 3. عرض قائمة الحذف
// التصحيح لدالة عرض القائمة (renderManageList)
function renderManageList() {
    const listArea = document.getElementById('manage-list');
    const products = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

    if (products.length === 0) {
        listArea.innerHTML = "<p style='color:#888; text-align:center;'>لا توجد منتجات منشورة.</p>";
        return;
    }

    listArea.innerHTML = products.map((p, index) => `
        <div class="product-item">
            <div style="display:flex; align-items:center; gap:15px;">
                <img src="${p.images && p.images[0] ? p.images[0] : 'https://via.placeholder.com/50'}" width="50" height="50" style="object-fit:cover; border-radius:8px;">
                <div>
                    <strong>${p.name}</strong>
                    <div style="font-size:0.8rem; color:#666;">${p.category} | ${p.price} دج</div>
                </div>
            </div>
            <div style="display:flex; gap:10px;">
                <button class="edit-btn" onclick="openEditModal('${p.id}')" style="color: #1d3557; background:none; border:none; cursor:pointer; font-size:1.2rem;">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="delete-btn" onclick="deleteProduct(${index})" style="color: #e63946; background:none; border:none; cursor:pointer; font-size:1.2rem;">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        </div>
    `).join('');
}

window.deleteProduct = function(index) {
    if (confirm("هل أنت متأكد من حذف هذا المنتج نهائياً؟")) {
        let products = JSON.parse(localStorage.getItem(STORAGE_KEY));
        products.splice(index, 1);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
        renderManageList();
    }
}

document.addEventListener('DOMContentLoaded', renderManageList);

// فتح نافذة التعديل وتعبئة البيانات
// 1. فتح نافذة التعديل وتعبئة كافة البيانات
window.openEditModal = function(id) {
    const products = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    const product = products.find(p => p.id === id);

    if (product) {
        document.getElementById('edit-p-id').value = product.id;
        document.getElementById('edit-p-name').value = product.name;
        document.getElementById('edit-p-price').value = product.price;
        document.getElementById('edit-p-old-price').value = product.oldPrice || '';
        document.getElementById('edit-p-category').value = product.category;
        
        // تحويل مصفوفة المميزات إلى نص بأسطر لتسهيل التعديل
        const featuresText = product.features ? product.features.join('\n') : '';
        document.getElementById('edit-p-features').value = featuresText;
        
        document.getElementById('editModal').style.display = "block";
    }
}

// 2. حفظ كافة التعديلات الجديدة
window.saveProductChanges = function() {
    const id = document.getElementById('edit-p-id').value;
    let products = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    const index = products.findIndex(p => p.id === id);

    if (index !== -1) {
        // تحديث البيانات الأساسية
        products[index].name = document.getElementById('edit-p-name').value;
        products[index].price = parseFloat(document.getElementById('edit-p-price').value);
        
        const oldP = document.getElementById('edit-p-old-price').value;
        products[index].oldPrice = oldP ? parseFloat(oldP) : null;
        
        products[index].category = document.getElementById('edit-p-category').value;

        // تحديث المميزات: تحويل النص المكتوب بأسطر إلى مصفوفة مرة أخرى
        const featuresInput = document.getElementById('edit-p-features').value;
        products[index].features = featuresInput.split('\n').filter(f => f.trim() !== "");

        // حفظ في الذاكرة
        localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
        
        alert("✅ تم تحديث كافة بيانات المنتج بنجاح!");
        closeEditModal();
        renderManageList(); // تحديث القائمة فوراً
    }
}


// منع الزر الأيمن للفأرة
document.addEventListener('contextmenu', e => e.preventDefault());

// منع اختصار F12 و Ctrl+Shift+I
document.onkeydown = function(e) {
    if (e.keyCode == 123 || (e.ctrlKey && e.shiftKey && e.keyCode == 73)) {
        return false;
    }
};