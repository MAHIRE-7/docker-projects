# Inventory App

Product inventory management system built with Python Flask and MariaDB.

## Features

- **Product Management** (Add, Edit, Delete products)
- **Stock Tracking** with quantity and pricing
- **Category Organization** (Electronics, Clothing, Food, etc.)
- **Inventory Statistics** (Total products, value, low stock alerts)
- **Visual Stock Indicators** (Low stock and out-of-stock highlighting)
- **MariaDB Database** for data persistence

## Technical Stack

- **Backend**: Python, Flask, SQLAlchemy
- **Database**: MariaDB
- **Frontend**: HTML, CSS, JavaScript
- **Port**: 5001 (unique port)

## API Endpoints

- `GET /` - Web interface
- `GET /api/products` - Get all products
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `GET /health` - Health check

## Docker Usage

### Start MariaDB:
```bash
docker run -d --name mariadb -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=inventory_db --network inv-app-nw -p 3308:3306 mariadb:10.6
```

### Build and run inventory app:
```bash
docker build -t inventory-app .
docker run -d -p 5001:5001 --network inv-app-nw inventory-app
```

## Docker Concepts

- **MariaDB** instead of MySQL
- **Different port** (5001) for multiple apps
- **Stock management** use case
- **Statistics dashboard**
- **Visual indicators** for stock levels

Visit: http://localhost:5001

**Test the app:**
1. Add products with categories and pricing
2. Track inventory quantities
3. View statistics dashboard
4. Edit product details
5. Delete products
6. Data persists in MariaDB