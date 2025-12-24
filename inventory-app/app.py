from flask import Flask, request, jsonify, render_template_string
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import os
import pymysql
import time

pymysql.install_as_MySQLdb()

app = Flask(__name__)

# MariaDB configuration
MARIADB_HOST = os.getenv('MARIADB_HOST')
MARIADB_USER = os.getenv('MARIADB_USER')
MARIADB_PASSWORD = os.getenv('MARIADB_PASSWORD')
MARIADB_DB = os.getenv('MARIADB_DB')

app.config['SQLALCHEMY_DATABASE_URI'] = f'mysql://{MARIADB_USER}:{MARIADB_PASSWORD}@{MARIADB_HOST}/{MARIADB_DB}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

def wait_for_mariadb():
    for i in range(30):
        try:
            connection = pymysql.connect(
                host=MARIADB_HOST,
                user=MARIADB_USER,
                password=MARIADB_PASSWORD,
                database=MARIADB_DB
            )
            connection.close()
            print("MariaDB is ready!")
            return True
        except:
            print(f"Waiting for MariaDB... ({i+1}/30)")
            time.sleep(2)
    return False

if wait_for_mariadb():
    db = SQLAlchemy(app)
else:
    print("MariaDB not available")
    exit(1)

class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    category = db.Column(db.String(50), nullable=False)
    quantity = db.Column(db.Integer, default=0)
    price = db.Column(db.Float, default=0.0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

HTML_TEMPLATE = '''
<!DOCTYPE html>
<html>
<head>
    <title>Inventory Manager</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .form-section { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
        .form-row { display: flex; gap: 15px; margin-bottom: 15px; }
        .form-row input, .form-row select { flex: 1; padding: 10px; border: 1px solid #ddd; border-radius: 4px; }
        .btn { padding: 10px 20px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer; }
        .btn:hover { background: #218838; }
        .inventory-table { width: 100%; border-collapse: collapse; background: white; }
        .inventory-table th, .inventory-table td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        .inventory-table th { background: #f8f9fa; font-weight: bold; }
        .low-stock { background: #fff3cd; }
        .out-of-stock { background: #f8d7da; }
        .delete-btn { background: #dc3545; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; }
        .update-btn { background: #007bff; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; margin-right: 5px; }
        .stats { display: flex; gap: 20px; margin-bottom: 30px; }
        .stat-card { background: white; padding: 20px; border-radius: 8px; flex: 1; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .stat-number { font-size: 2em; font-weight: bold; color: #28a745; }
    </style>
</head>
<body>
    <div class="header">
        <h1>📦 Inventory Manager</h1>
        <p>Track your products and stock levels</p>
    </div>

    <div class="stats">
        <div class="stat-card">
            <div class="stat-number" id="totalProducts">0</div>
            <div>Total Products</div>
        </div>
        <div class="stat-card">
            <div class="stat-number" id="totalValue">$0</div>
            <div>Total Value</div>
        </div>
        <div class="stat-card">
            <div class="stat-number" id="lowStock">0</div>
            <div>Low Stock Items</div>
        </div>
    </div>

    <div class="form-section">
        <h3>Add/Update Product</h3>
        <form id="productForm">
            <div class="form-row">
                <input type="text" id="name" placeholder="Product name" required>
                <select id="category" required>
                    <option value="">Select category</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Clothing">Clothing</option>
                    <option value="Food">Food</option>
                    <option value="Books">Books</option>
                    <option value="Tools">Tools</option>
                </select>
            </div>
            <div class="form-row">
                <input type="number" id="quantity" placeholder="Quantity" min="0" required>
                <input type="number" id="price" placeholder="Price" step="0.01" min="0" required>
            </div>
            <button type="submit" class="btn">Add Product</button>
        </form>
    </div>

    <table class="inventory-table">
        <thead>
            <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Total Value</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody id="inventoryTable"></tbody>
    </table>

    <script>
        let editingId = null;

        async function loadProducts() {
            const response = await fetch('/api/products');
            const products = await response.json();
            displayProducts(products);
            updateStats(products);
        }

        function displayProducts(products) {
            const tbody = document.getElementById('inventoryTable');
            tbody.innerHTML = products.map(product => {
                const totalValue = (product.quantity * product.price).toFixed(2);
                const rowClass = product.quantity === 0 ? 'out-of-stock' : product.quantity < 10 ? 'low-stock' : '';
                
                return `
                    <tr class="${rowClass}">
                        <td>${product.name}</td>
                        <td>${product.category}</td>
                        <td>${product.quantity}</td>
                        <td>$${product.price.toFixed(2)}</td>
                        <td>$${totalValue}</td>
                        <td>
                            <button class="update-btn" onclick="editProduct(${product.id}, '${product.name}', '${product.category}', ${product.quantity}, ${product.price})">Edit</button>
                            <button class="delete-btn" onclick="deleteProduct(${product.id})">Delete</button>
                        </td>
                    </tr>
                `;
            }).join('');
        }

        function updateStats(products) {
            const totalProducts = products.length;
            const totalValue = products.reduce((sum, p) => sum + (p.quantity * p.price), 0);
            const lowStock = products.filter(p => p.quantity < 10 && p.quantity > 0).length;

            document.getElementById('totalProducts').textContent = totalProducts;
            document.getElementById('totalValue').textContent = `$${totalValue.toFixed(2)}`;
            document.getElementById('lowStock').textContent = lowStock;
        }

        document.getElementById('productForm').onsubmit = async (e) => {
            e.preventDefault();
            
            const name = document.getElementById('name').value;
            const category = document.getElementById('category').value;
            const quantity = parseInt(document.getElementById('quantity').value);
            const price = parseFloat(document.getElementById('price').value);
            
            const url = editingId ? `/api/products/${editingId}` : '/api/products';
            const method = editingId ? 'PUT' : 'POST';
            
            await fetch(url, {
                method,
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({name, category, quantity, price})
            });
            
            document.getElementById('productForm').reset();
            editingId = null;
            loadProducts();
        };

        function editProduct(id, name, category, quantity, price) {
            editingId = id;
            document.getElementById('name').value = name;
            document.getElementById('category').value = category;
            document.getElementById('quantity').value = quantity;
            document.getElementById('price').value = price;
        }

        async function deleteProduct(id) {
            if (confirm('Delete this product?')) {
                await fetch(`/api/products/${id}`, {method: 'DELETE'});
                loadProducts();
            }
        }

        loadProducts();
    </script>
</body>
</html>
'''

@app.route('/')
def index():
    return render_template_string(HTML_TEMPLATE)

@app.route('/api/products', methods=['GET'])
def get_products():
    products = Product.query.all()
    return jsonify([{
        'id': p.id,
        'name': p.name,
        'category': p.category,
        'quantity': p.quantity,
        'price': p.price
    } for p in products])

@app.route('/api/products', methods=['POST'])
def create_product():
    data = request.json
    product = Product(
        name=data['name'],
        category=data['category'],
        quantity=data['quantity'],
        price=data['price']
    )
    db.session.add(product)
    db.session.commit()
    return jsonify({'id': product.id}), 201

@app.route('/api/products/<int:product_id>', methods=['PUT'])
def update_product(product_id):
    product = Product.query.get_or_404(product_id)
    data = request.json
    product.name = data['name']
    product.category = data['category']
    product.quantity = data['quantity']
    product.price = data['price']
    db.session.commit()
    return jsonify({'id': product.id})

@app.route('/api/products/<int:product_id>', methods=['DELETE'])
def delete_product(product_id):
    product = Product.query.get_or_404(product_id)
    db.session.delete(product)
    db.session.commit()
    return '', 204

@app.route('/health')
def health():
    return jsonify({'status': 'healthy'})

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(host='0.0.0.0', port=5001)