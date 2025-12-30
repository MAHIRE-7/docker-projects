-- Financial Management System Database Schema

-- Create database
CREATE DATABASE IF NOT EXISTS financial_db;
USE financial_db;

-- Users table (all system users)
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    phone VARCHAR(20),
    role ENUM('client', 'advisor', 'admin') DEFAULT 'client',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Accounts table (bank accounts, credit cards, investments)
CREATE TABLE accounts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    account_number VARCHAR(20) UNIQUE NOT NULL,
    account_type ENUM('checking', 'savings', 'investment', 'credit') NOT NULL,
    account_name VARCHAR(100) NOT NULL,
    balance DECIMAL(15, 2) DEFAULT 0.00,
    currency VARCHAR(3) DEFAULT 'USD',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_accounts (user_id),
    INDEX idx_account_type (account_type)
);

-- Financial Goals table
CREATE TABLE financial_goals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    goal_name VARCHAR(100) NOT NULL,
    target_amount DECIMAL(15, 2) NOT NULL,
    current_amount DECIMAL(15, 2) DEFAULT 0.00,
    target_date DATE NOT NULL,
    category VARCHAR(50) NOT NULL,
    priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
    status ENUM('active', 'completed', 'paused') DEFAULT 'active',
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_goals (user_id),
    INDEX idx_goal_status (status)
);

-- Financial Advisors table
CREATE TABLE advisors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE NOT NULL,
    license_number VARCHAR(50) UNIQUE,
    specialization VARCHAR(100),
    experience_years INT DEFAULT 0,
    hourly_rate DECIMAL(10, 2),
    rating DECIMAL(2, 1) DEFAULT 0.0,
    total_clients INT DEFAULT 0,
    bio TEXT,
    certifications JSON,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Client-Advisor Relationships table
CREATE TABLE client_advisor_relationships (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id INT NOT NULL,
    advisor_id INT NOT NULL,
    relationship_type ENUM('consultation', 'ongoing', 'completed') DEFAULT 'consultation',
    start_date DATE NOT NULL,
    end_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (advisor_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_client_advisor (client_id, advisor_id)
);

-- Recurring Transactions table
CREATE TABLE recurring_transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    account_id INT NOT NULL,
    transaction_type ENUM('income', 'expense') NOT NULL,
    category VARCHAR(50) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    description VARCHAR(255) NOT NULL,
    frequency ENUM('daily', 'weekly', 'monthly', 'yearly') NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    next_execution_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
    INDEX idx_next_execution (next_execution_date, is_active)
);

-- Notifications table
CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('info', 'warning', 'success', 'error') DEFAULT 'info',
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_notifications (user_id, is_read)
);

-- Insert sample data

-- Sample admin user
INSERT INTO users (username, email, password_hash, first_name, last_name, role) VALUES
('admin', 'admin@financetracker.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3bp.Gm.F5u', 'System', 'Administrator', 'admin');

-- Sample financial advisors
INSERT INTO users (username, email, password_hash, first_name, last_name, phone, role) VALUES
('advisor1', 'john.smith@financetracker.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3bp.Gm.F5u', 'John', 'Smith', '+1234567890', 'advisor'),
('advisor2', 'sarah.johnson@financetracker.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3bp.Gm.F5u', 'Sarah', 'Johnson', '+1234567891', 'advisor');

-- Sample advisor profiles
INSERT INTO advisors (user_id, license_number, specialization, experience_years, hourly_rate, bio, is_verified) VALUES
(2, 'CFP001234', 'Retirement Planning', 15, 150.00, 'Certified Financial Planner with 15 years of experience in retirement planning and investment management.', true),
(3, 'CFA001235', 'Investment Management', 12, 200.00, 'Chartered Financial Analyst specializing in portfolio management and risk assessment.', true);

-- Sample clients
INSERT INTO users (username, email, password_hash, first_name, last_name, phone, role) VALUES
('client1', 'alice.wilson@email.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3bp.Gm.F5u', 'Alice', 'Wilson', '+1234567892', 'client'),
('client2', 'bob.anderson@email.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3bp.Gm.F5u', 'Bob', 'Anderson', '+1234567893', 'client'),
('client3', 'carol.martinez@email.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3bp.Gm.F5u', 'Carol', 'Martinez', '+1234567894', 'client');

-- Sample accounts
INSERT INTO accounts (user_id, account_number, account_type, account_name, balance) VALUES
(4, 'ACC123456789', 'checking', 'Primary Checking', 5250.75),
(4, 'ACC123456790', 'savings', 'Emergency Fund', 15000.00),
(4, 'ACC123456791', 'investment', '401k Account', 85000.00),
(5, 'ACC123456792', 'checking', 'Main Checking', 3200.50),
(5, 'ACC123456793', 'savings', 'Vacation Fund', 8500.00),
(6, 'ACC123456794', 'checking', 'Business Checking', 12000.00),
(6, 'ACC123456795', 'credit', 'Credit Card', -1500.00);

-- Sample financial goals
INSERT INTO financial_goals (user_id, goal_name, target_amount, current_amount, target_date, category, priority) VALUES
(4, 'Emergency Fund', 20000.00, 15000.00, '2024-12-31', 'Emergency', 'high'),
(4, 'New Car', 35000.00, 8500.00, '2025-06-30', 'Transportation', 'medium'),
(4, 'Retirement', 1000000.00, 85000.00, '2045-12-31', 'Retirement', 'high'),
(5, 'House Down Payment', 50000.00, 12000.00, '2026-03-31', 'Housing', 'high'),
(5, 'Vacation to Europe', 8000.00, 3200.00, '2024-08-15', 'Travel', 'low'),
(6, 'Business Expansion', 100000.00, 25000.00, '2025-12-31', 'Business', 'high');

-- Sample recurring transactions
INSERT INTO recurring_transactions (user_id, account_id, transaction_type, category, amount, description, frequency, start_date, next_execution_date) VALUES
(4, 1, 'income', 'Salary', 4500.00, 'Monthly Salary', 'monthly', '2024-01-01', '2024-02-01'),
(4, 1, 'expense', 'Housing', 1200.00, 'Rent Payment', 'monthly', '2024-01-01', '2024-02-01'),
(4, 1, 'expense', 'Utilities', 150.00, 'Electric Bill', 'monthly', '2024-01-01', '2024-02-01'),
(5, 4, 'income', 'Salary', 3800.00, 'Bi-weekly Salary', 'weekly', '2024-01-01', '2024-01-15'),
(6, 6, 'income', 'Business', 8000.00, 'Business Revenue', 'monthly', '2024-01-01', '2024-02-01');

-- Sample client-advisor relationships
INSERT INTO client_advisor_relationships (client_id, advisor_id, relationship_type, start_date) VALUES
(4, 2, 'ongoing', '2023-06-15'),
(5, 3, 'consultation', '2024-01-10'),
(6, 2, 'ongoing', '2023-09-20');

-- Create indexes for better performance
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active);
CREATE INDEX idx_accounts_balance ON accounts(balance);
CREATE INDEX idx_goals_target_date ON financial_goals(target_date);
CREATE INDEX idx_goals_category ON financial_goals(category);
CREATE INDEX idx_advisors_specialization ON advisors(specialization);
CREATE INDEX idx_advisors_verified ON advisors(is_verified);
CREATE INDEX idx_recurring_frequency ON recurring_transactions(frequency);

-- Create views for common queries
CREATE VIEW user_account_summary AS
SELECT 
    u.id as user_id,
    u.first_name,
    u.last_name,
    COUNT(a.id) as total_accounts,
    SUM(CASE WHEN a.account_type != 'credit' THEN a.balance ELSE 0 END) as total_assets,
    SUM(CASE WHEN a.account_type = 'credit' AND a.balance < 0 THEN ABS(a.balance) ELSE 0 END) as total_debt,
    (SUM(CASE WHEN a.account_type != 'credit' THEN a.balance ELSE 0 END) - 
     SUM(CASE WHEN a.account_type = 'credit' AND a.balance < 0 THEN ABS(a.balance) ELSE 0 END)) as net_worth
FROM users u
LEFT JOIN accounts a ON u.id = a.user_id AND a.is_active = true
WHERE u.role = 'client' AND u.is_active = true
GROUP BY u.id, u.first_name, u.last_name;

CREATE VIEW goal_progress_summary AS
SELECT 
    fg.*,
    u.first_name,
    u.last_name,
    ROUND((fg.current_amount / fg.target_amount) * 100, 2) as progress_percentage,
    DATEDIFF(fg.target_date, CURDATE()) as days_remaining
FROM financial_goals fg
JOIN users u ON fg.user_id = u.id
WHERE fg.status = 'active';

DELIMITER //
CREATE TRIGGER update_account_balance_on_goal_contribution
AFTER UPDATE ON financial_goals
FOR EACH ROW
BEGIN
    IF NEW.current_amount > OLD.current_amount THEN
        -- Log the contribution (this would typically be handled by the application)
        INSERT INTO notifications (user_id, title, message, type)
        VALUES (NEW.user_id, 'Goal Progress', 
                CONCAT('You contributed $', (NEW.current_amount - OLD.current_amount), ' to your goal: ', NEW.goal_name), 
                'success');
    END IF;
END//
DELIMITER ;