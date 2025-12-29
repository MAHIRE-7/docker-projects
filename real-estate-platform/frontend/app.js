const API_BASE = '/api';
let currentUser = null;
let authToken = null;
let currentSection = 'home';

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
}

function showLoggedIn() {
    document.getElementById('loginBtn').classList.add('hidden');
    document.getElementById('registerBtn').classList.add('hidden');
    document.getElementById('logoutBtn').classList.remove('hidden');
    document.getElementById('favoritesBtn').classList.remove('hidden');
    document.getElementById('userInfo').classList.remove('hidden');
    document.getElementById('userInfo').textContent = `Hello, ${currentUser.username}`;
    
    if (currentUser.role === 'agent') {
        document.getElementById('agentPanelBtn').classList.remove('hidden');
    }
}

function showLoggedOut() {
    document.getElementById('loginBtn').classList.remove('hidden');
    document.getElementById('registerBtn').classList.remove('hidden');
    document.getElementById('logoutBtn').classList.add('hidden');
    document.getElementById('favoritesBtn').classList.add('hidden');
    document.getElementById('agentPanelBtn').classList.add('hidden');
    document.getElementById('userInfo').classList.add('hidden');
}

// Navigation
function showSection(section) {
    document.querySelectorAll('.section').forEach(s => s.classList.add('hidden'));
    document.getElementById(section + 'Section').classList.remove('hidden');
    currentSection = section;
    
    if (section === 'properties') {
        loadProperties();
    } else if (section === 'agents') {
        loadAgents();
    } else if (section === 'home') {
        loadFeaturedProperties();
    }
}

// Properties
async function loadProperties(filters = {}) {
    try {
        const params = new URLSearchParams(filters);
        const response = await fetch(`${API_BASE}/properties?${params}`);
        const properties = await response.json();
        displayProperties(properties, 'propertiesList');
    } catch (err) {
        console.error('Failed to load properties:', err);
    }
}

async function loadFeaturedProperties() {
    try {
        const response = await fetch(`${API_BASE}/properties?featured=true`);
        const properties = await response.json();
        displayProperties(properties.slice(0, 6), 'featuredProperties');
    } catch (err) {
        console.error('Failed to load featured properties:', err);
    }
}

function displayProperties(properties, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = properties.map(property => `
        <div class="property-card" onclick="showPropertyDetail('${property._id}')">
            ${property.images && property.images.length > 0 ? 
                `<img src="${API_BASE.replace('/api', '')}/uploads/${property.images[0]}" class="property-image" alt="${property.title}">` : 
                '<div class="property-image" style="background: #f0f0f0; display: flex; align-items: center; justify-content: center;">No Image</div>'
            }
            <div class="property-info">
                <div class="property-price">$${property.price.toLocaleString()}</div>
                <div class="property-title">${property.title}</div>
                <div class="property-location">${property.city}, ${property.state}</div>
                <div class="property-details">
                    <span>${property.bedrooms} bed</span>
                    <span>${property.bathrooms} bath</span>
                    <span>${property.area} sq ft</span>
                </div>
                <div class="property-actions">
                    <button class="btn btn-primary" onclick="event.stopPropagation(); showInquiryModal('${property._id}')">Inquire</button>
                    ${currentUser ? `<button class="btn btn-secondary" onclick="event.stopPropagation(); toggleFavorite('${property._id}')">♥</button>` : ''}
                </div>
            </div>
        </div>
    `).join('');
}

async function showPropertyDetail(propertyId) {
    try {
        const response = await fetch(`${API_BASE}/properties/${propertyId}`);
        const property = await response.json();
        
        document.getElementById('propertyDetail').innerHTML = `
            <div class="property-detail">
                <div>
                    <h2>${property.title}</h2>
                    <div class="property-price" style="font-size: 2rem; margin: 1rem 0;">$${property.price.toLocaleString()}</div>
                    <div class="property-images">
                        ${property.images.map(img => `<img src="${API_BASE.replace('/api', '')}/uploads/${img}" alt="Property image">`).join('')}
                    </div>
                    <p>${property.description}</p>
                    <div class="amenities">
                        ${property.amenities.map(amenity => `<span class="amenity-tag">${amenity}</span>`).join('')}
                    </div>
                </div>
                <div>
                    <div class="property-specs">
                        <div class="spec-item">
                            <div class="spec-value">${property.bedrooms}</div>
                            <div class="spec-label">Bedrooms</div>
                        </div>
                        <div class="spec-item">
                            <div class="spec-value">${property.bathrooms}</div>
                            <div class="spec-label">Bathrooms</div>
                        </div>
                        <div class="spec-item">
                            <div class="spec-value">${property.area}</div>
                            <div class="spec-label">Sq Ft</div>
                        </div>
                        <div class="spec-item">
                            <div class="spec-value">${property.yearBuilt}</div>
                            <div class="spec-label">Year Built</div>
                        </div>
                    </div>
                    <div style="margin-top: 2rem;">
                        <h4>Location</h4>
                        <p>${property.address}<br>${property.city}, ${property.state} ${property.zipCode}</p>
                    </div>
                    <div style="margin-top: 2rem;">
                        <button class="btn btn-primary" onclick="showInquiryModal('${property._id}')" style="width: 100%;">Contact Agent</button>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('propertyModal').style.display = 'block';
    } catch (err) {
        console.error('Failed to load property details:', err);
    }
}

// Search and Filter
function searchProperties() {
    const filters = {
        type: document.getElementById('searchType').value,
        city: document.getElementById('searchCity').value,
        minPrice: document.getElementById('searchMinPrice').value,
        maxPrice: document.getElementById('searchMaxPrice').value,
        bedrooms: document.getElementById('searchBedrooms').value
    };
    
    // Remove empty filters
    Object.keys(filters).forEach(key => {
        if (!filters[key]) delete filters[key];
    });
    
    showSection('properties');
    loadProperties(filters);
}

function filterProperties() {
    const filters = {
        type: document.getElementById('filterType').value,
        status: document.getElementById('filterStatus').value
    };
    
    Object.keys(filters).forEach(key => {
        if (!filters[key]) delete filters[key];
    });
    
    loadProperties(filters);
}

// Agents
async function loadAgents() {
    try {
        const response = await fetch(`${API_BASE}/agents`);
        const agents = await response.json();
        displayAgents(agents);
    } catch (err) {
        console.error('Failed to load agents:', err);
    }
}

function displayAgents(agents) {
    const container = document.getElementById('agentsList');
    container.innerHTML = agents.map(agent => `
        <div class="agent-card">
            ${agent.profile_image ? 
                `<img src="${API_BASE.replace('/api', '')}/uploads/${agent.profile_image}" class="agent-image" alt="${agent.fullName}">` : 
                '<div class="agent-image" style="background: #ddd; display: flex; align-items: center; justify-content: center;">No Photo</div>'
            }
            <div class="agent-name">${agent.fullName}</div>
            <div class="agent-agency">${agent.agency_name || 'Independent Agent'}</div>
            <div class="agent-specialization">${agent.specialization || 'General Real Estate'}</div>
            <div class="agent-stats">
                <div>
                    <div style="font-weight: bold;">${agent.rating || '0.0'}</div>
                    <div style="font-size: 0.8rem;">Rating</div>
                </div>
                <div>
                    <div style="font-weight: bold;">${agent.total_sales || '0'}</div>
                    <div style="font-size: 0.8rem;">Sales</div>
                </div>
                <div>
                    <div style="font-weight: bold;">${agent.experience_years || '0'}</div>
                    <div style="font-size: 0.8rem;">Years</div>
                </div>
            </div>
        </div>
    `).join('');
}

// Agent Panel
async function addProperty(event) {
    event.preventDefault();
    
    const formData = new FormData();
    formData.append('title', document.getElementById('propTitle').value);
    formData.append('propertyType', document.getElementById('propType').value);
    formData.append('description', document.getElementById('propDescription').value);
    formData.append('price', document.getElementById('propPrice').value);
    formData.append('bedrooms', document.getElementById('propBedrooms').value);
    formData.append('bathrooms', document.getElementById('propBathrooms').value);
    formData.append('area', document.getElementById('propArea').value);
    formData.append('address', document.getElementById('propAddress').value);
    formData.append('city', document.getElementById('propCity').value);
    formData.append('state', document.getElementById('propState').value);
    formData.append('zipCode', document.getElementById('propZip').value);
    formData.append('yearBuilt', document.getElementById('propYear').value);
    formData.append('parking', document.getElementById('propParking').value);
    formData.append('amenities', document.getElementById('propAmenities').value);
    
    const imageFiles = document.getElementById('propImages').files;
    for (let i = 0; i < imageFiles.length; i++) {
        formData.append('images', imageFiles[i]);
    }
    
    try {
        const response = await fetch(`${API_BASE}/properties`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${authToken}` },
            body: formData
        });
        
        if (response.ok) {
            alert('Property added successfully!');
            event.target.reset();
            loadProperties();
        }
    } catch (err) {
        console.error('Failed to add property:', err);
    }
}

// Inquiries
function showInquiryModal(propertyId) {
    document.getElementById('inquiryPropertyId').value = propertyId;
    document.getElementById('inquiryModal').style.display = 'block';
}

async function submitInquiry(event) {
    event.preventDefault();
    
    const inquiryData = {
        propertyId: document.getElementById('inquiryPropertyId').value,
        name: document.getElementById('inquiryName').value,
        email: document.getElementById('inquiryEmail').value,
        phone: document.getElementById('inquiryPhone').value,
        inquiryType: document.getElementById('inquiryType').value,
        message: document.getElementById('inquiryMessage').value
    };
    
    try {
        const response = await fetch(`${API_BASE}/inquiries`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': authToken ? `Bearer ${authToken}` : ''
            },
            body: JSON.stringify(inquiryData)
        });
        
        if (response.ok) {
            alert('Inquiry sent successfully!');
            closeModal();
            event.target.reset();
        }
    } catch (err) {
        console.error('Failed to submit inquiry:', err);
    }
}

// Favorites
async function toggleFavorite(propertyId) {
    if (!currentUser) {
        showLogin();
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/favorites`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ propertyId })
        });
        
        if (response.ok) {
            alert('Added to favorites!');
        }
    } catch (err) {
        console.error('Failed to toggle favorite:', err);
    }
}

async function showFavorites() {
    try {
        const response = await fetch(`${API_BASE}/favorites`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const properties = await response.json();
        displayProperties(properties, 'propertiesList');
        showSection('properties');
    } catch (err) {
        console.error('Failed to load favorites:', err);
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

function showAgentPanel() {
    document.getElementById('agentModal').style.display = 'block';
}

function closeModal() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });
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
    } else {
        showLoggedOut();
    }
    
    // Load initial data
    loadFeaturedProperties();
    
    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            closeModal();
        }
    });
}

// Start the app
document.addEventListener('DOMContentLoaded', initApp);