const API_BASE = '/api';
let currentUser = null;
let authToken = null;

// Authentication Functions
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
            authToken = data.access_token;
            currentUser = data.user;
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            showMainApp();
            loadDashboard();
        } else {
            alert(data.error || 'Login failed');
        }
    } catch (err) {
        alert('Login failed. Please try again.');
    }
}

async function register(event) {
    event.preventDefault();
    const formData = {
        first_name: document.getElementById('regFirstName').value,
        last_name: document.getElementById('regLastName').value,
        username: document.getElementById('regUsername').value,
        email: document.getElementById('regEmail').value,
        phone: document.getElementById('regPhone').value,
        role: document.getElementById('regRole').value,
        password: document.getElementById('regPassword').value
    };
    
    try {
        const response = await fetch(`${API_BASE}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        if (response.ok) {
            alert('Registration successful! Please login.');
            showLogin();
        } else {
            alert(data.error || 'Registration failed');
        }
    } catch (err) {
        alert('Registration failed. Please try again.');
    }
}

function logout() {
    authToken = null;
    currentUser = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    showAuthSection();
}

// UI Navigation Functions
function showLogin() {
    document.getElementById('loginForm').classList.remove('hidden');
    document.getElementById('registerForm').classList.add('hidden');
}

function showRegister() {
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('registerForm').classList.remove('hidden');
}

function showAuthSection() {
    document.getElementById('authSection').classList.remove('hidden');
    document.getElementById('mainApp').classList.add('hidden');
    document.getElementById('navbar').classList.add('hidden');
}

function showMainApp() {
    document.getElementById('authSection').classList.add('hidden');
    document.getElementById('mainApp').classList.remove('hidden');
    document.getElementById('navbar').classList.remove('hidden');
    document.getElementById('userInfo').textContent = `${currentUser.first_name} ${currentUser.last_name}`;
    showSection('dashboard');
}

function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.add('hidden');
    });
    
    // Show selected section
    document.getElementById(sectionName + 'Section').classList.remove('hidden');
    
    // Update active nav button
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('bg-blue-700');
    });
    event.target.classList.add('bg-blue-700');
    
    // Load section data
    switch(sectionName) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'accounts':
            loadAccounts();
            break;
        case 'transactions':
            loadTransactions();
            break;
        case 'budgets':
            loadBudgets();
            break;
        case 'goals':
            loadGoals();
            break;
        case 'portfolio':
            loadPortfolio();
            break;
    }
}

// API Helper Function
async function apiCall(endpoint, method = 'GET', data = null) {
    const config = {
        method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
        }
    };
    
    if (data) {
        config.body = JSON.stringify(data);
    }
    
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, config);
        return await response.json();
    } catch (err) {
        console.error('API call failed:', err);
        return null;
    }
}

// Dashboard Functions
async function loadDashboard() {
    try {
        const dashboardData = await apiCall('/dashboard');
        if (dashboardData) {
            document.getElementById('totalBalance').textContent = `$${dashboardData.total_balance.toLocaleString()}`;
            document.getElementById('accountCount').textContent = dashboardData.account_count;
            document.getElementById('activeGoals').textContent = dashboardData.active_goals;
            
            // Load recent transactions
            displayRecentTransactions(dashboardData.recent_transactions);
            
            // Load charts
            loadSpendingChart();
            loadIncomeExpenseChart();
        }
    } catch (err) {
        console.error('Failed to load dashboard:', err);
    }
}

function displayRecentTransactions(transactions) {
    const container = document.getElementById('recentTransactions');
    if (!transactions || transactions.length === 0) {
        container.innerHTML = '<p class="text-gray-500">No recent transactions</p>';
        return;
    }
    
    container.innerHTML = transactions.map(transaction => `
        <div class="flex justify-between items-center p-3 border-b border-gray-200">
            <div class="flex items-center">
                <div class="w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                    transaction.transaction_type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                }">
                    <i class="fas ${transaction.transaction_type === 'income' ? 'fa-arrow-up' : 'fa-arrow-down'}"></i>
                </div>
                <div>
                    <p class="font-medium">${transaction.description}</p>
                    <p class="text-sm text-gray-500">${transaction.category}</p>
                </div>
            </div>
            <div class="text-right">
                <p class="font-medium ${transaction.transaction_type === 'income' ? 'text-green-600' : 'text-red-600'}">
                    ${transaction.transaction_type === 'income' ? '+' : '-'}$${Math.abs(transaction.amount).toLocaleString()}
                </p>
                <p class="text-sm text-gray-500">${new Date(transaction.date).toLocaleDateString()}</p>
            </div>
        </div>
    `).join('');
}

async function loadSpendingChart() {
    try {
        const spendingData = await apiCall('/analytics/spending');
        if (spendingData && spendingData.length > 0) {
            const ctx = document.getElementById('spendingChart').getContext('2d');
            new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: spendingData.map(item => item._id),
                    datasets: [{
                        data: spendingData.map(item => item.total),
                        backgroundColor: [
                            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
                            '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });
        }
    } catch (err) {
        console.error('Failed to load spending chart:', err);
    }
}

async function loadIncomeExpenseChart() {
    try {
        const incomeExpenseData = await apiCall('/analytics/income-expense');
        if (incomeExpenseData && incomeExpenseData.length > 0) {
            // Process data for chart
            const months = [...new Set(incomeExpenseData.map(item => `${item._id.year}-${item._id.month}`))];
            const incomeData = [];
            const expenseData = [];
            
            months.forEach(month => {
                const income = incomeExpenseData.find(item => 
                    `${item._id.year}-${item._id.month}` === month && item._id.type === 'income'
                );
                const expense = incomeExpenseData.find(item => 
                    `${item._id.year}-${item._id.month}` === month && item._id.type === 'expense'
                );
                
                incomeData.push(income ? income.total : 0);
                expenseData.push(expense ? expense.total : 0);
            });
            
            const ctx = document.getElementById('incomeExpenseChart').getContext('2d');
            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: months,
                    datasets: [
                        {
                            label: 'Income',
                            data: incomeData,
                            backgroundColor: '#10B981'
                        },
                        {
                            label: 'Expenses',
                            data: expenseData,
                            backgroundColor: '#EF4444'
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }
    } catch (err) {
        console.error('Failed to load income/expense chart:', err);
    }
}

// Account Functions
async function loadAccounts() {
    try {
        const accounts = await apiCall('/accounts');
        if (accounts) {
            displayAccounts(accounts);
        }
    } catch (err) {
        console.error('Failed to load accounts:', err);
    }
}

function displayAccounts(accounts) {
    const container = document.getElementById('accountsList');
    if (!accounts || accounts.length === 0) {
        container.innerHTML = '<p class="text-gray-500 col-span-full text-center">No accounts found</p>';
        return;
    }
    
    container.innerHTML = accounts.map(account => `
        <div class="bg-white p-6 rounded-lg shadow-md">
            <div class="flex justify-between items-start mb-4">
                <div>
                    <h3 class="text-lg font-semibold">${account.account_name}</h3>
                    <p class="text-sm text-gray-500">${account.account_type.toUpperCase()}</p>
                    <p class="text-xs text-gray-400">${account.account_number}</p>
                </div>
                <div class="text-right">
                    <p class="text-2xl font-bold ${account.balance >= 0 ? 'text-green-600' : 'text-red-600'}">
                        $${account.balance.toLocaleString()}
                    </p>
                    <p class="text-sm text-gray-500">${account.currency}</p>
                </div>
            </div>
            <div class="flex justify-between items-center">
                <span class="text-xs text-gray-400">
                    Created: ${new Date(account.created_at).toLocaleDateString()}
                </span>
                <button onclick="viewAccountDetails(${account.id})" 
                        class="text-blue-600 hover:text-blue-800 text-sm">
                    View Details
                </button>
            </div>
        </div>
    `).join('');
}

// Modal Functions
function showAddAccountModal() {
    document.getElementById('addAccountModal').classList.remove('hidden');
}

function closeModal() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.add('hidden');
    });
}

async function addAccount(event) {
    event.preventDefault();
    
    const accountData = {
        account_name: document.getElementById('accountName').value,
        account_type: document.getElementById('accountType').value,
        initial_balance: parseFloat(document.getElementById('initialBalance').value)
    };
    
    try {
        const result = await apiCall('/accounts', 'POST', accountData);
        if (result && !result.error) {
            alert('Account added successfully!');
            closeModal();
            loadAccounts();
            event.target.reset();
        } else {
            alert(result.error || 'Failed to add account');
        }
    } catch (err) {
        alert('Failed to add account');
    }
}

// Placeholder functions for other sections
async function loadTransactions() {
    console.log('Loading transactions...');
}

async function loadBudgets() {
    console.log('Loading budgets...');
}

async function loadGoals() {
    console.log('Loading goals...');
}

async function loadPortfolio() {
    console.log('Loading portfolio...');
}

function viewAccountDetails(accountId) {
    console.log('Viewing account details for:', accountId);
}

// Initialize app
function initApp() {
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('currentUser');
    
    if (storedToken && storedUser) {
        authToken = storedToken;
        currentUser = JSON.parse(storedUser);
        showMainApp();
    } else {
        showAuthSection();
    }
    
    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            closeModal();
        }
    });
}

// Start the app
document.addEventListener('DOMContentLoaded', initApp);