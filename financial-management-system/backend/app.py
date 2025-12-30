from flask import Flask, request, jsonify, render_template
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from flask_migrate import Migrate
from pymongo import MongoClient
import redis
from datetime import datetime, timedelta
import os
from decimal import Decimal
import json
from sqlalchemy import Numeric

app = Flask(__name__)

# Configuration
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'financial-secret-key')
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'mysql://root:password@localhost/financial_db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'financial-secret-key')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)

print(f"JWT_SECRET_KEY: {app.config['JWT_SECRET_KEY']}")

# Initialize extensions
db = SQLAlchemy(app)
jwt = JWTManager(app)
bcrypt = Bcrypt(app)
migrate = Migrate(app, db)
CORS(app)

# JWT error handlers
@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    return jsonify({'error': 'Token has expired'}), 401

@jwt.invalid_token_loader
def invalid_token_callback(error):
    return jsonify({'error': 'Invalid token'}), 422

@jwt.unauthorized_loader
def missing_token_callback(error):
    return jsonify({'error': 'Authorization token is required'}), 401

# MongoDB connection
mongo_client = MongoClient(os.environ.get('MONGO_URL', 'mongodb://localhost:27017/'))
mongo_db = mongo_client.financial_db

# Redis connection
try:
    redis_client = redis.Redis(host=os.environ.get('REDIS_HOST', 'localhost'), 
                              port=int(os.environ.get('REDIS_PORT', 6379)), 
                              decode_responses=True)
    redis_client.ping()  # Test connection
except:
    print("Redis connection failed, continuing without Redis")
    redis_client = None

# MySQL Models (Structured Data)
class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    phone = db.Column(db.String(20))
    role = db.Column(db.Enum('client', 'advisor', 'admin'), default='client')
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    accounts = db.relationship('Account', backref='user', lazy=True)
    goals = db.relationship('FinancialGoal', backref='user', lazy=True)

class Account(db.Model):
    __tablename__ = 'accounts'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    account_number = db.Column(db.String(20), unique=True, nullable=False)
    account_type = db.Column(db.Enum('checking', 'savings', 'investment', 'credit'), nullable=False)
    account_name = db.Column(db.String(100), nullable=False)
    balance = db.Column(Numeric(15, 2), default=0.00)
    currency = db.Column(db.String(3), default='USD')
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class FinancialGoal(db.Model):
    __tablename__ = 'financial_goals'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    goal_name = db.Column(db.String(100), nullable=False)
    target_amount = db.Column(Numeric(15, 2), nullable=False)
    current_amount = db.Column(Numeric(15, 2), default=0.00)
    target_date = db.Column(db.Date, nullable=False)
    category = db.Column(db.String(50), nullable=False)
    priority = db.Column(db.Enum('low', 'medium', 'high'), default='medium')
    status = db.Column(db.Enum('active', 'completed', 'paused'), default='active')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Advisor(db.Model):
    __tablename__ = 'advisors'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    license_number = db.Column(db.String(50), unique=True)
    specialization = db.Column(db.String(100))
    experience_years = db.Column(db.Integer, default=0)
    hourly_rate = db.Column(Numeric(10, 2))
    rating = db.Column(Numeric(2, 1), default=0.0)
    total_clients = db.Column(db.Integer, default=0)
    bio = db.Column(db.Text)
    is_verified = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

# Authentication Routes
@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'Username already exists'}), 400
    
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already exists'}), 400
    
    password_hash = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    
    user = User(
        username=data['username'],
        email=data['email'],
        password_hash=password_hash,
        first_name=data['first_name'],
        last_name=data['last_name'],
        phone=data.get('phone'),
        role=data.get('role', 'client')
    )
    
    db.session.add(user)
    db.session.commit()
    
    # Create advisor profile if role is advisor
    if user.role == 'advisor':
        advisor = Advisor(user_id=user.id)
        db.session.add(advisor)
        db.session.commit()
    
    return jsonify({'message': 'User registered successfully'}), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(username=data['username']).first()
    
    if user and bcrypt.check_password_hash(user.password_hash, data['password']):
        access_token = create_access_token(identity=user.id)
        
        # Store session in Redis
        if redis_client:
            redis_client.setex(f"session:{user.id}", 86400, access_token)
        
        return jsonify({
            'access_token': access_token,
            'user': {
                'id': user.id,
                'username': user.username,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'role': user.role
            }
        })
    
    return jsonify({'error': 'Invalid credentials'}), 401

# Account Management Routes
@app.route('/api/accounts', methods=['GET'])
@jwt_required()
def get_accounts():
    try:
        user_id = get_jwt_identity()
        print(f"User ID from JWT: {user_id}")
        accounts = Account.query.filter_by(user_id=user_id, is_active=True).all()
        
        return jsonify([{
            'id': acc.id,
            'account_number': acc.account_number,
            'account_type': acc.account_type,
            'account_name': acc.account_name,
            'balance': float(acc.balance),
            'currency': acc.currency,
            'created_at': acc.created_at.isoformat()
        } for acc in accounts])
    except Exception as e:
        print(f"Error in get_accounts: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/accounts', methods=['POST'])
@jwt_required()
def create_account():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        print(f"Creating account for user {user_id}: {data}")
        
        # Generate account number
        import random
        account_number = f"ACC{random.randint(100000000, 999999999)}"
        
        account = Account(
            user_id=user_id,
            account_number=account_number,
            account_type=data['account_type'],
            account_name=data['account_name'],
            balance=data.get('initial_balance', 0.00),
            currency=data.get('currency', 'USD')
        )
        
        db.session.add(account)
        db.session.commit()
        
        return jsonify({'message': 'Account created successfully', 'account_id': account.id}), 201
    except Exception as e:
        print(f"Error in create_account: {e}")
        return jsonify({'error': str(e)}), 500

# Transaction Routes (MongoDB)
@app.route('/api/transactions', methods=['GET'])
@jwt_required()
def get_transactions():
    user_id = get_jwt_identity()
    account_id = request.args.get('account_id')
    
    query = {'user_id': user_id}
    if account_id:
        query['account_id'] = int(account_id)
    
    transactions = list(mongo_db.transactions.find(query).sort('date', -1).limit(100))
    
    # Convert ObjectId to string
    for transaction in transactions:
        transaction['_id'] = str(transaction['_id'])
    
    return jsonify(transactions)

@app.route('/api/transactions', methods=['POST'])
@jwt_required()
def create_transaction():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    # Verify account ownership
    account = Account.query.filter_by(id=data['account_id'], user_id=user_id).first()
    if not account:
        return jsonify({'error': 'Account not found'}), 404
    
    transaction = {
        'user_id': user_id,
        'account_id': data['account_id'],
        'transaction_type': data['transaction_type'],  # income, expense, transfer
        'category': data['category'],
        'amount': float(data['amount']),
        'description': data['description'],
        'date': datetime.fromisoformat(data['date']),
        'tags': data.get('tags', []),
        'location': data.get('location'),
        'receipt_url': data.get('receipt_url'),
        'created_at': datetime.utcnow()
    }
    
    # Update account balance
    if data['transaction_type'] == 'income':
        account.balance += Decimal(str(data['amount']))
    elif data['transaction_type'] == 'expense':
        account.balance -= Decimal(str(data['amount']))
    
    db.session.commit()
    
    result = mongo_db.transactions.insert_one(transaction)
    
    return jsonify({'message': 'Transaction created', 'transaction_id': str(result.inserted_id)}), 201

# Budget Routes (MongoDB)
@app.route('/api/budgets', methods=['GET'])
@jwt_required()
def get_budgets():
    user_id = get_jwt_identity()
    budgets = list(mongo_db.budgets.find({'user_id': user_id}))
    
    for budget in budgets:
        budget['_id'] = str(budget['_id'])
    
    return jsonify(budgets)

@app.route('/api/budgets', methods=['POST'])
@jwt_required()
def create_budget():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    budget = {
        'user_id': user_id,
        'name': data['name'],
        'categories': data['categories'],  # [{'category': 'food', 'allocated': 500, 'spent': 0}]
        'total_allocated': sum(cat['allocated'] for cat in data['categories']),
        'period': data['period'],  # monthly, weekly, yearly
        'start_date': datetime.fromisoformat(data['start_date']),
        'end_date': datetime.fromisoformat(data['end_date']),
        'status': 'active',
        'created_at': datetime.utcnow()
    }
    
    result = mongo_db.budgets.insert_one(budget)
    
    return jsonify({'message': 'Budget created', 'budget_id': str(result.inserted_id)}), 201

# Investment Portfolio Routes (MongoDB)
@app.route('/api/portfolio', methods=['GET'])
@jwt_required()
def get_portfolio():
    user_id = get_jwt_identity()
    portfolio = mongo_db.portfolios.find_one({'user_id': user_id})
    
    if portfolio:
        portfolio['_id'] = str(portfolio['_id'])
        return jsonify(portfolio)
    
    return jsonify({'holdings': [], 'total_value': 0, 'total_gain_loss': 0})

@app.route('/api/portfolio/holdings', methods=['POST'])
@jwt_required()
def add_holding():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    holding = {
        'symbol': data['symbol'],
        'name': data['name'],
        'quantity': float(data['quantity']),
        'purchase_price': float(data['purchase_price']),
        'current_price': float(data.get('current_price', data['purchase_price'])),
        'purchase_date': datetime.fromisoformat(data['purchase_date']),
        'asset_type': data['asset_type']  # stock, bond, etf, crypto
    }
    
    # Update or create portfolio
    portfolio = mongo_db.portfolios.find_one({'user_id': user_id})
    if portfolio:
        mongo_db.portfolios.update_one(
            {'user_id': user_id},
            {'$push': {'holdings': holding}}
        )
    else:
        mongo_db.portfolios.insert_one({
            'user_id': user_id,
            'holdings': [holding],
            'created_at': datetime.utcnow()
        })
    
    return jsonify({'message': 'Holding added successfully'}), 201

# Financial Goals Routes
@app.route('/api/goals', methods=['GET'])
@jwt_required()
def get_goals():
    user_id = get_jwt_identity()
    goals = FinancialGoal.query.filter_by(user_id=user_id).all()
    
    return jsonify([{
        'id': goal.id,
        'goal_name': goal.goal_name,
        'target_amount': float(goal.target_amount),
        'current_amount': float(goal.current_amount),
        'target_date': goal.target_date.isoformat(),
        'category': goal.category,
        'priority': goal.priority,
        'status': goal.status,
        'progress_percentage': (float(goal.current_amount) / float(goal.target_amount)) * 100
    } for goal in goals])

@app.route('/api/goals', methods=['POST'])
@jwt_required()
def create_goal():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    goal = FinancialGoal(
        user_id=user_id,
        goal_name=data['goal_name'],
        target_amount=data['target_amount'],
        target_date=datetime.fromisoformat(data['target_date']).date(),
        category=data['category'],
        priority=data.get('priority', 'medium')
    )
    
    db.session.add(goal)
    db.session.commit()
    
    return jsonify({'message': 'Goal created successfully', 'goal_id': goal.id}), 201

# Analytics Routes
@app.route('/api/analytics/spending', methods=['GET'])
@jwt_required()
def get_spending_analytics():
    user_id = get_jwt_identity()
    
    # Get spending by category from MongoDB
    pipeline = [
        {'$match': {'user_id': user_id, 'transaction_type': 'expense'}},
        {'$group': {
            '_id': '$category',
            'total': {'$sum': '$amount'},
            'count': {'$sum': 1}
        }},
        {'$sort': {'total': -1}}
    ]
    
    spending_by_category = list(mongo_db.transactions.aggregate(pipeline))
    
    return jsonify(spending_by_category)

@app.route('/api/analytics/income-expense', methods=['GET'])
@jwt_required()
def get_income_expense_analytics():
    user_id = get_jwt_identity()
    
    # Get monthly income vs expense
    pipeline = [
        {'$match': {'user_id': user_id}},
        {'$group': {
            '_id': {
                'year': {'$year': '$date'},
                'month': {'$month': '$date'},
                'type': '$transaction_type'
            },
            'total': {'$sum': '$amount'}
        }},
        {'$sort': {'_id.year': 1, '_id.month': 1}}
    ]
    
    monthly_data = list(mongo_db.transactions.aggregate(pipeline))
    
    return jsonify(monthly_data)

# Advisor Routes
@app.route('/api/advisors', methods=['GET'])
def get_advisors():
    advisors = db.session.query(Advisor, User).join(User).filter(Advisor.is_verified == True).all()
    
    return jsonify([{
        'id': advisor.id,
        'name': f"{user.first_name} {user.last_name}",
        'specialization': advisor.specialization,
        'experience_years': advisor.experience_years,
        'hourly_rate': float(advisor.hourly_rate) if advisor.hourly_rate else None,
        'rating': float(advisor.rating),
        'total_clients': advisor.total_clients,
        'bio': advisor.bio
    } for advisor, user in advisors])

# Dashboard Route
@app.route('/api/dashboard', methods=['GET'])
@jwt_required()
def get_dashboard():
    user_id = get_jwt_identity()
    
    # Get account balances
    accounts = Account.query.filter_by(user_id=user_id, is_active=True).all()
    total_balance = sum(float(acc.balance) for acc in accounts)
    
    # Get recent transactions
    recent_transactions = list(mongo_db.transactions.find({'user_id': user_id}).sort('date', -1).limit(5))
    for transaction in recent_transactions:
        transaction['_id'] = str(transaction['_id'])
    
    # Get goals progress
    goals = FinancialGoal.query.filter_by(user_id=user_id, status='active').all()
    
    return jsonify({
        'total_balance': total_balance,
        'account_count': len(accounts),
        'recent_transactions': recent_transactions,
        'active_goals': len(goals),
        'goals_progress': [{
            'name': goal.goal_name,
            'progress': (float(goal.current_amount) / float(goal.target_amount)) * 100
        } for goal in goals[:3]]
    })

# Health check
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'OK', 'service': 'Financial Management API'})

# Initialize database
with app.app_context():
    db.create_all()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)), debug=True)