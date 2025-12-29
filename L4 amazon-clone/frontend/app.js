const API_BASE = 'http://localhost:3000/api';
let currentUser = null;
let authToken = null;
let cart = { items: [] };

// Authentication functions
async function login(event) {
    event.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        const response = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        if (response.ok) {
            authToken = data.token;
            currentUser = data.user;
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            showLoggedIn();
            closeModal();
            loadCart();
        } else {
            alert(data.error);
        }
    } catch (err) {
        alert('Login failed');
    }
}

async function register(event) {
    event.preventDefault();
    const fullName = document.getElementById('regFullName').value;
    const username = document.getElementById('regUsername').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    
    try {
        const response = await fetch(`${API_BASE}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fullName, username, email, password })
        });
        
        const data = await response.json();
        if (response.ok) {
            alert('Registration successful! Please login.');
            showLogin();
        } else {
            alert(data.error);
        }
    } catch (err) {
        alert('Registration failed');
    }
}

function logout() {
    authToken = null;
    currentUser = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    showLoggedOut();
    cart = { items: [] };
    updateCartCount();
}

function showLoggedIn() {
    document.getElementById('loginBtn').classList.add('hidden');
    document.getElementById('registerBtn').classList.add('hidden');
    document.getElementById('logoutBtn').classList.remove('hidden');
    document.getElementById('ordersBtn').classList.remove('hidden');
    document.getElementById('userInfo').classList.remove('hidden');
    document.getElementById('userInfo').textContent = `Hello, ${currentUser.username}`;
    
    if (currentUser.role === 'admin') {
        document.getElementById('adminBtn').classList.remove('hidden');
    }
}

function showLoggedOut() {
    document.getElementById('loginBtn').classList.remove('hidden');
    document.getElementById('registerBtn').classList.remove('hidden');
    document.getElementById('logoutBtn').classList.add('hidden');
    document.getElementById('ordersBtn').classList.add('hidden');
    document.getElementById('adminBtn').classList.add('hidden');
    document.getElementById('userInfo').classList.add('hidden');
}

// Product functions
async function loadProducts(category = '', search = '') {
    try {
        const params = new URLSearchParams();
        if (category) params.append('category', category);
        if (search) params.append('search', search);
        
        const response = await fetch(`${API_BASE}/products?${params}`);
        const products = await response.json();
        
        displayProducts(products);
    } catch (err) {
        console.error('Failed to load products:', err);
    }
}

function displayProducts(products) {
    const productsDiv = document.getElementById('products');
    productsDiv.innerHTML = products.map(product => `
        <div class="product-card">
            ${product.image ? `<img src="${API_BASE.replace('/api', '')}/uploads/${product.image}" class="product-image" alt="${product.name}">` : '<div class="product-image" style="background: #f0f0f0; display: flex; align-items: center; justify-content: center;">No Image</div>'}
            <div class="product-name">${product.name}</div>
            <div class="product-rating">⭐⭐⭐⭐⭐ (${product.reviews})</div>
            <div class="product-price">$${product.price}</div>
            <button class="btn btn-primary" onclick="addToCart('${product._id}', '${product.name}', ${product.price}, '${product.image || ''}')">Add to Cart</button>
        </div>
    `).join('');
}

function filterCategory(category) {
    loadProducts(category);
}

function searchProducts() {
    const search = document.getElementById('searchInput').value;
    loadProducts('', search);
}

// Cart functions
async function addToCart(productId, name, price, image) {
    if (!currentUser) {
        showLogin();
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/cart`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                userId: currentUser.id || 1, 
                productId, 
                name, 
                price, 
                image 
            })
        });
        
        if (response.ok) {
            cart = await response.json();
            updateCartCount();
            showNotification('Added to cart!');
        }
    } catch (err) {
        console.error('Failed to add to cart:', err);
    }
}

async function loadCart() {
    if (!currentUser) return;
    
    try {
        const response = await fetch(`${API_BASE}/cart/${currentUser.id || 1}`);
        cart = await response.json();
        updateCartCount();
        displayCart();
    } catch (err) {
        console.error('Failed to load cart:', err);
    }
}

function displayCart() {
    const cartItemsDiv = document.getElementById('cartItems');
    const total = cart.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;
    
    cartItemsDiv.innerHTML = cart.items?.map(item => `
        <div class="cart-item">
            <div>
                <strong>${item.name}</strong><br>
                $${item.price} x ${item.quantity}
            </div>
            <div>$${(item.price * item.quantity).toFixed(2)}</div>
        </div>
    `).join('') || '<p>Your cart is empty</p>';
    
    document.getElementById('cartTotal').textContent = `Total: $${total.toFixed(2)}`;
}

function updateCartCount() {
    const count = cart.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
    document.getElementById('cartCount').textContent = count;
}

async function checkout() {
    if (!cart.items?.length) return;
    
    const address = prompt('Enter delivery address:');
    if (!address) return;
    
    const total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    try {
        const response = await fetch(`${API_BASE}/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                userId: currentUser.id || 1, 
                items: cart.items, 
                total, 
                address 
            })
        });
        
        if (response.ok) {
            showNotification('Order placed successfully!');
            cart = { items: [] };
            updateCartCount();
            closeModal();
        }
    } catch (err) {
        console.error('Checkout failed:', err);
    }
}

// Admin functions
async function addProduct(event) {
    event.preventDefault();
    
    const formData = new FormData();
    formData.append('name', document.getElementById('productName').value);
    formData.append('description', document.getElementById('productDescription').value);
    formData.append('price', document.getElementById('productPrice').value);
    formData.append('category', document.getElementById('productCategory').value);
    formData.append('stock', document.getElementById('productStock').value);
    
    const imageFile = document.getElementById('productImage').files[0];
    if (imageFile) formData.append('image', imageFile);
    
    try {
        const response = await fetch(`${API_BASE}/products`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${authToken}` },
            body: formData
        });
        
        if (response.ok) {
            showNotification('Product added successfully!');
            closeModal();
            loadProducts();
            event.target.reset();
        }
    } catch (err) {
        console.error('Failed to add product:', err);
    }
}

// Modal functions
function showLogin() {
    document.getElementById('loginForm').classList.remove('hidden');
    document.getElementById('registerForm').classList.add('hidden');
    document.getElementById('authModal').style.display = 'block';
}

function showRegister() {
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('registerForm').classList.remove('hidden');
    document.getElementById('authModal').style.display = 'block';
}

function showCart() {
    loadCart();
    document.getElementById('cartModal').style.display = 'block';
}

function showAdmin() {
    document.getElementById('adminModal').style.display = 'block';
}

function showOrders() {
    // Implementation for orders modal
    alert('Orders feature coming soon!');
}

function closeModal() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });
}

function showNotification(message) {
    alert(message); // Simple notification, can be enhanced
}

// Initialize app
function initApp() {
    // Check for stored auth
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('currentUser');
    
    if (storedToken && storedUser) {
        authToken = storedToken;
        currentUser = JSON.parse(storedUser);
        showLoggedIn();
        loadCart();
    } else {
        showLoggedOut();
    }
    
    // Load initial products
    loadProducts();
    
    // Price range slider
    document.getElementById('priceRange').addEventListener('input', function() {
        document.getElementById('priceValue').textContent = this.value;
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            closeModal();
        }
    });
}

// Start the app
document.addEventListener('DOMContentLoaded', initApp);