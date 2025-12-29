-- Initialize Amazon Clone Database
USE amazon_users;

-- Create admin user
INSERT IGNORE INTO users (username, email, password, fullName, role) VALUES 
('admin', 'admin@amazon.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrator', 'admin');

-- Create sample customer
INSERT IGNORE INTO users (username, email, password, fullName, role) VALUES 
('customer1', 'customer@amazon.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'John Doe', 'customer');