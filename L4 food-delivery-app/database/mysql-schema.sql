-- Food Delivery Platform Database Schema

CREATE DATABASE IF NOT EXISTS food_delivery;
USE food_delivery;

-- Users table (customers, restaurant owners, admins)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    fullName VARCHAR(100),
    phone VARCHAR(20),
    address TEXT,
    role ENUM('customer', 'restaurant', 'admin') DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Restaurants table
CREATE TABLE IF NOT EXISTS restaurants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    cuisine_type VARCHAR(50),
    address TEXT,
    phone VARCHAR(20),
    rating DECIMAL(2,1) DEFAULT 4.0,
    delivery_time INT DEFAULT 30,
    delivery_fee DECIMAL(5,2) DEFAULT 2.99,
    min_order DECIMAL(6,2) DEFAULT 15.00,
    image VARCHAR(255),
    owner_id INT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id)
);

-- Sample data
INSERT IGNORE INTO users (username, email, password, fullName, phone, role) VALUES 
('admin', 'admin@foodexpress.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrator', '1234567890', 'admin'),
('customer1', 'customer@foodexpress.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'John Doe', '1234567891', 'customer'),
('restaurant1', 'restaurant@foodexpress.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Pizza Palace Owner', '1234567892', 'restaurant');

INSERT IGNORE INTO restaurants (name, description, cuisine_type, address, phone, rating, delivery_time, delivery_fee, min_order, owner_id) VALUES 
('Pizza Palace', 'Authentic Italian pizzas with fresh ingredients', 'italian', '123 Main St, City', '555-0101', 4.5, 25, 2.99, 12.00, 3),
('Dragon Garden', 'Traditional Chinese cuisine and dim sum', 'chinese', '456 Oak Ave, City', '555-0102', 4.3, 35, 3.49, 15.00, 3),
('Spice Route', 'Authentic Indian curries and tandoor dishes', 'indian', '789 Pine St, City', '555-0103', 4.7, 30, 2.49, 18.00, 3),
('Taco Fiesta', 'Fresh Mexican tacos and burritos', 'mexican', '321 Elm St, City', '555-0104', 4.2, 20, 1.99, 10.00, 3),
('Burger Junction', 'Gourmet burgers and American classics', 'american', '654 Maple Ave, City', '555-0105', 4.4, 15, 2.99, 8.00, 3);