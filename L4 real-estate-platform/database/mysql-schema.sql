-- Real Estate Platform Database Schema

CREATE DATABASE IF NOT EXISTS real_estate;
USE real_estate;

-- Users table (buyers, agents, admins)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    fullName VARCHAR(100),
    phone VARCHAR(20),
    address TEXT,
    role ENUM('buyer', 'agent', 'admin') DEFAULT 'buyer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Agents table (extended profile for real estate agents)
CREATE TABLE IF NOT EXISTS agents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE,
    license_number VARCHAR(50),
    agency_name VARCHAR(100),
    specialization VARCHAR(100),
    experience_years INT,
    rating DECIMAL(2,1) DEFAULT 0.0,
    total_sales INT DEFAULT 0,
    bio TEXT,
    profile_image VARCHAR(255),
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Sample data
INSERT IGNORE INTO users (username, email, password, fullName, phone, role) VALUES 
('admin', 'admin@realestate.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrator', '1234567890', 'admin'),
('buyer1', 'buyer@realestate.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'John Smith', '1234567891', 'buyer'),
('agent1', 'agent1@realestate.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Sarah Johnson', '1234567892', 'agent'),
('agent2', 'agent2@realestate.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Mike Davis', '1234567893', 'agent');

INSERT IGNORE INTO agents (user_id, license_number, agency_name, specialization, experience_years, rating, total_sales, bio, is_verified) VALUES 
(3, 'RE123456', 'Prime Properties', 'Residential Sales', 8, 4.8, 156, 'Experienced residential real estate agent specializing in luxury homes and first-time buyers.', true),
(4, 'RE789012', 'Metro Realty', 'Commercial Properties', 12, 4.6, 89, 'Commercial real estate expert with focus on office buildings and retail spaces.', true);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_agents_user_id ON agents(user_id);
CREATE INDEX idx_agents_verified ON agents(is_verified);