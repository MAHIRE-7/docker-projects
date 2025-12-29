const API_BASE = 'http://localhost:5000/api';
let currentUser = null;
let authToken = null;
let cart = { items: [] };
let currentRestaurant = null;

// Authentication
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
    const phone = document.getElementById('regPhone').value;
    const role = document.getElementById('regRole').value;
    const password = document.getElementById('regPassword').value;
    
    try {
        const response = await fetch(`${API_BASE}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fullName, username, email, phone, role, password })
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
    
    if (currentUser.role === 'restaurant') {
        document.getElementById('restaurantBtn').classList.remove('hidden');
    }
}

function showLoggedOut() {
    document.getElementById('loginBtn').classList.remove('hidden');
    document.getElementById('registerBtn').classList.remove('hidden');
    document.getElementById('logoutBtn').classList.add('hidden');
    document.getElementById('ordersBtn').classList.add('hidden');
    document.getElementById('restaurantBtn').classList.add('hidden');
    document.getElementById('userInfo').classList.add('hidden');
}

// Restaurant functions
async function loadRestaurants(cuisine = '') {
    try {
        const response = await fetch(`${API_BASE}/restaurants`);
        let restaurants = await response.json();
        
        if (cuisine) {
            restaurants = restaurants.filter(r => r.cuisine_type === cuisine);
        }
        
        displayRestaurants(restaurants);
    } catch (err) {
        console.error('Failed to load restaurants:', err);
    }
}

function displayRestaurants(restaurants) {
    const restaurantsDiv = document.getElementById('restaurantsList');
    restaurantsDiv.innerHTML = restaurants.map(restaurant => `
        <div class="restaurant-card" onclick="showRestaurantMenu(${restaurant.id})">
            ${restaurant.image ? `<img src="${API_BASE.replace('/api', '')}/uploads/${restaurant.image}" class="restaurant-image" alt="${restaurant.name}">` : '<div class="restaurant-image" style="background: #f0f0f0; display: flex; align-items: center; justify-content: center;">No Image</div>'}
            <div class="restaurant-info">
                <div class="restaurant-name">${restaurant.name}</div>
                <div class="restaurant-cuisine">${restaurant.cuisine_type}</div>
                <div class="restaurant-details">
                    <span class="restaurant-rating">★ ${restaurant.rating}</span>
                    <span>${restaurant.delivery_time} min</span>
                    <span>$${restaurant.delivery_fee} delivery</span>
                </div>
            </div>
        </div>
    `).join('');
}

async function showRestaurantMenu(restaurantId) {
    try {
        const response = await fetch(`${API_BASE}/restaurants/${restaurantId}/menu`);
        const menuItems = await response.json();
        
        // Get restaurant info
        const restaurantsResponse = await fetch(`${API_BASE}/restaurants`);
        const restaurants = await restaurantsResponse.json();
        currentRestaurant = restaurants.find(r => r.id === restaurantId);
        
        document.querySelector('.restaurants').classList.add('hidden');
        document.getElementById('menuSection').classList.remove('hidden');
        
        document.getElementById('restaurantInfo').innerHTML = `
            <div>
                <h2>${currentRestaurant.name}</h2>
                <p>${currentRestaurant.description}</p>
                <p>Delivery: ${currentRestaurant.delivery_time} min • $${currentRestaurant.delivery_fee} fee • Min order: $${currentRestaurant.min_order}</p>
            </div>
        `;
        
        displayMenuItems(menuItems);
    } catch (err) {
        console.error('Failed to load menu:', err);
    }
}

function displayMenuItems(menuItems) {
    const menuDiv = document.getElementById('menuItems');
    menuDiv.innerHTML = menuItems.map(item => `
        <div class="menu-item">
            ${item.image ? `<img src="${API_BASE.replace('/api', '')}/uploads/${item.image}" class="menu-item-image" alt="${item.name}">` : ''}
            <div class="menu-item-name">${item.name}</div>
            <div class="menu-item-description">${item.description}</div>
            <div class="menu-item-footer">
                <div class="menu-item-price">$${item.price}</div>
                <button class="add-to-cart-btn" onclick="addToCart('${item._id}', '${item.name}', ${item.price}, ${currentRestaurant.id})">Add to Cart</button>
            </div>
        </div>
    `).join('');
}

function backToRestaurants() {
    document.querySelector('.restaurants').classList.remove('hidden');
    document.getElementById('menuSection').classList.add('hidden');
    currentRestaurant = null;
}

// Cart functions
async function addToCart(menuItemId, name, price, restaurantId) {
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
                restaurantId,
                menuItemId, 
                name, 
                price 
            })
        });
        
        if (response.ok) {
            cart = await response.json();
            updateCartCount();
            alert('Added to cart!');
        } else {
            const error = await response.json();
            alert(error.error);
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
    
    document.getElementById('cartTotal').textContent = total.toFixed(2);
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
                restaurantId: cart.restaurantId,
                items: cart.items, 
                total, 
                deliveryAddress: address 
            })
        });
        
        if (response.ok) {
            alert('Order placed successfully!');
            cart = { items: [] };
            updateCartCount();
            closeModal();
        }
    } catch (err) {
        console.error('Checkout failed:', err);
    }
}

// Restaurant management
async function addRestaurant(event) {
    event.preventDefault();
    
    const formData = new FormData();
    formData.append('name', document.getElementById('restName').value);
    formData.append('description', document.getElementById('restDescription').value);
    formData.append('cuisine_type', document.getElementById('restCuisine').value);
    formData.append('address', document.getElementById('restAddress').value);
    formData.append('phone', document.getElementById('restPhone').value);
    formData.append('delivery_time', document.getElementById('restDeliveryTime').value);
    formData.append('delivery_fee', document.getElementById('restDeliveryFee').value);
    formData.append('min_order', document.getElementById('restMinOrder').value);
    
    const imageFile = document.getElementById('restImage').files[0];
    if (imageFile) formData.append('image', imageFile);
    
    try {
        const response = await fetch(`${API_BASE}/restaurants`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${authToken}` },
            body: formData
        });
        
        if (response.ok) {
            alert('Restaurant added successfully!');
            event.target.reset();
            loadRestaurants();
        }
    } catch (err) {
        console.error('Failed to add restaurant:', err);
    }
}

async function addMenuItem(event) {
    event.preventDefault();
    
    const formData = new FormData();
    formData.append('restaurantId', document.getElementById('menuRestaurant').value);
    formData.append('name', document.getElementById('menuName').value);
    formData.append('description', document.getElementById('menuDescription').value);
    formData.append('price', document.getElementById('menuPrice').value);
    formData.append('category', document.getElementById('menuCategory').value);
    formData.append('preparationTime', document.getElementById('menuPrepTime').value);
    
    const imageFile = document.getElementById('menuImage').files[0];
    if (imageFile) formData.append('image', imageFile);
    
    try {
        const response = await fetch(`${API_BASE}/menu`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${authToken}` },
            body: formData
        });
        
        if (response.ok) {
            alert('Menu item added successfully!');
            event.target.reset();
        }
    } catch (err) {
        console.error('Failed to add menu item:', err);
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

function showRestaurantPanel() {
    document.getElementById('restaurantModal').style.display = 'block';
}

function showOrders() {
    alert('Orders feature coming soon!');
}

function closeModal() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });
}

// Filter functions
function filterByCuisine(cuisine) {
    document.querySelectorAll('.filter-buttons button').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    loadRestaurants(cuisine);
}

function searchRestaurants() {
    const search = document.getElementById('searchInput').value;
    // Implementation for search functionality
    console.log('Searching for:', search);
}

// Tab functions
function showTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    event.target.classList.add('active');
    document.getElementById(tabName).classList.add('active');
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
    
    // Load initial data
    loadRestaurants();
    
    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            closeModal();
        }
    });
}

// Start the app
document.addEventListener('DOMContentLoaded', initApp);