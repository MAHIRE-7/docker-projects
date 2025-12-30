// Financial Management System - MongoDB Sample Data

// Switch to financial database
use financial_db;

// Transactions Collection
db.transactions.insertMany([
  // Alice Wilson's transactions (user_id: 4)
  {
    user_id: 4,
    account_id: 1,
    transaction_type: "income",
    category: "Salary",
    amount: 4500.00,
    description: "Monthly Salary - January",
    date: new Date("2024-01-01"),
    tags: ["salary", "regular"],
    created_at: new Date("2024-01-01")
  },
  {
    user_id: 4,
    account_id: 1,
    transaction_type: "expense",
    category: "Housing",
    amount: 1200.00,
    description: "Rent Payment",
    date: new Date("2024-01-01"),
    tags: ["rent", "housing", "monthly"],
    created_at: new Date("2024-01-01")
  },
  {
    user_id: 4,
    account_id: 1,
    transaction_type: "expense",
    category: "Food",
    amount: 85.50,
    description: "Grocery Shopping - Whole Foods",
    date: new Date("2024-01-02"),
    tags: ["groceries", "food"],
    location: "Whole Foods Market",
    created_at: new Date("2024-01-02")
  },
  {
    user_id: 4,
    account_id: 1,
    transaction_type: "expense",
    category: "Transportation",
    amount: 45.00,
    description: "Gas Station Fill-up",
    date: new Date("2024-01-03"),
    tags: ["gas", "transportation"],
    created_at: new Date("2024-01-03")
  },
  {
    user_id: 4,
    account_id: 1,
    transaction_type: "expense",
    category: "Utilities",
    amount: 150.00,
    description: "Electric Bill - January",
    date: new Date("2024-01-05"),
    tags: ["utilities", "electric", "monthly"],
    created_at: new Date("2024-01-05")
  },
  {
    user_id: 4,
    account_id: 2,
    transaction_type: "income",
    category: "Transfer",
    amount: 500.00,
    description: "Transfer to Emergency Fund",
    date: new Date("2024-01-05"),
    tags: ["transfer", "savings"],
    created_at: new Date("2024-01-05")
  },
  {
    user_id: 4,
    account_id: 1,
    transaction_type: "expense",
    category: "Entertainment",
    amount: 25.00,
    description: "Netflix Subscription",
    date: new Date("2024-01-08"),
    tags: ["subscription", "entertainment"],
    created_at: new Date("2024-01-08")
  },
  {
    user_id: 4,
    account_id: 1,
    transaction_type: "expense",
    category: "Food",
    amount: 42.75,
    description: "Dinner at Italian Restaurant",
    date: new Date("2024-01-10"),
    tags: ["restaurant", "dining"],
    location: "Tony's Italian Bistro",
    created_at: new Date("2024-01-10")
  },

  // Bob Anderson's transactions (user_id: 5)
  {
    user_id: 5,
    account_id: 4,
    transaction_type: "income",
    category: "Salary",
    amount: 1900.00,
    description: "Bi-weekly Salary",
    date: new Date("2024-01-01"),
    tags: ["salary", "biweekly"],
    created_at: new Date("2024-01-01")
  },
  {
    user_id: 5,
    account_id: 4,
    transaction_type: "expense",
    category: "Housing",
    amount: 950.00,
    description: "Mortgage Payment",
    date: new Date("2024-01-01"),
    tags: ["mortgage", "housing"],
    created_at: new Date("2024-01-01")
  },
  {
    user_id: 5,
    account_id: 4,
    transaction_type: "expense",
    category: "Food",
    amount: 120.00,
    description: "Weekly Grocery Shopping",
    date: new Date("2024-01-02"),
    tags: ["groceries", "weekly"],
    created_at: new Date("2024-01-02")
  },
  {
    user_id: 5,
    account_id: 5,
    transaction_type: "income",
    category: "Transfer",
    amount: 300.00,
    description: "Vacation Fund Contribution",
    date: new Date("2024-01-05"),
    tags: ["savings", "vacation"],
    created_at: new Date("2024-01-05")
  },

  // Carol Martinez's transactions (user_id: 6)
  {
    user_id: 6,
    account_id: 6,
    transaction_type: "income",
    category: "Business",
    amount: 8000.00,
    description: "Monthly Business Revenue",
    date: new Date("2024-01-01"),
    tags: ["business", "revenue"],
    created_at: new Date("2024-01-01")
  },
  {
    user_id: 6,
    account_id: 6,
    transaction_type: "expense",
    category: "Business",
    amount: 2500.00,
    description: "Office Rent",
    date: new Date("2024-01-01"),
    tags: ["business", "rent"],
    created_at: new Date("2024-01-01")
  },
  {
    user_id: 6,
    account_id: 6,
    transaction_type: "expense",
    category: "Business",
    amount: 800.00,
    description: "Marketing Campaign",
    date: new Date("2024-01-03"),
    tags: ["business", "marketing"],
    created_at: new Date("2024-01-03")
  },
  {
    user_id: 6,
    account_id: 7,
    transaction_type: "expense",
    category: "Business",
    amount: 1500.00,
    description: "Equipment Purchase",
    date: new Date("2024-01-05"),
    tags: ["business", "equipment"],
    created_at: new Date("2024-01-05")
  }
]);

// Budgets Collection
db.budgets.insertMany([
  {
    user_id: 4,
    name: "Monthly Budget - 2024",
    categories: [
      { category: "Housing", allocated: 1200.00, spent: 1200.00 },
      { category: "Food", allocated: 400.00, spent: 128.25 },
      { category: "Transportation", allocated: 200.00, spent: 45.00 },
      { category: "Utilities", allocated: 200.00, spent: 150.00 },
      { category: "Entertainment", allocated: 150.00, spent: 25.00 },
      { category: "Savings", allocated: 1000.00, spent: 500.00 },
      { category: "Miscellaneous", allocated: 300.00, spent: 0.00 }
    ],
    total_allocated: 3450.00,
    period: "monthly",
    start_date: new Date("2024-01-01"),
    end_date: new Date("2024-01-31"),
    status: "active",
    created_at: new Date("2024-01-01")
  },
  {
    user_id: 5,
    name: "Family Budget - Q1 2024",
    categories: [
      { category: "Housing", allocated: 950.00, spent: 950.00 },
      { category: "Food", allocated: 500.00, spent: 120.00 },
      { category: "Transportation", allocated: 300.00, spent: 0.00 },
      { category: "Healthcare", allocated: 200.00, spent: 0.00 },
      { category: "Education", allocated: 150.00, spent: 0.00 },
      { category: "Savings", allocated: 600.00, spent: 300.00 }
    ],
    total_allocated: 2700.00,
    period: "monthly",
    start_date: new Date("2024-01-01"),
    end_date: new Date("2024-03-31"),
    status: "active",
    created_at: new Date("2024-01-01")
  },
  {
    user_id: 6,
    name: "Business Budget - 2024",
    categories: [
      { category: "Office Rent", allocated: 2500.00, spent: 2500.00 },
      { category: "Marketing", allocated: 1500.00, spent: 800.00 },
      { category: "Equipment", allocated: 2000.00, spent: 1500.00 },
      { category: "Salaries", allocated: 0.00, spent: 0.00 },
      { category: "Utilities", allocated: 300.00, spent: 0.00 },
      { category: "Professional Services", allocated: 500.00, spent: 0.00 }
    ],
    total_allocated: 6800.00,
    period: "monthly",
    start_date: new Date("2024-01-01"),
    end_date: new Date("2024-12-31"),
    status: "active",
    created_at: new Date("2024-01-01")
  }
]);

// Investment Portfolios Collection
db.portfolios.insertMany([
  {
    user_id: 4,
    holdings: [
      {
        symbol: "AAPL",
        name: "Apple Inc.",
        quantity: 50,
        purchase_price: 150.00,
        current_price: 175.00,
        purchase_date: new Date("2023-06-15"),
        asset_type: "stock"
      },
      {
        symbol: "MSFT",
        name: "Microsoft Corporation",
        quantity: 30,
        purchase_price: 280.00,
        current_price: 320.00,
        purchase_date: new Date("2023-08-20"),
        asset_type: "stock"
      },
      {
        symbol: "VTI",
        name: "Vanguard Total Stock Market ETF",
        quantity: 100,
        purchase_price: 200.00,
        current_price: 220.00,
        purchase_date: new Date("2023-05-10"),
        asset_type: "etf"
      },
      {
        symbol: "BTC",
        name: "Bitcoin",
        quantity: 0.5,
        purchase_price: 35000.00,
        current_price: 42000.00,
        purchase_date: new Date("2023-09-01"),
        asset_type: "crypto"
      }
    ],
    total_value: 85000.00,
    total_gain_loss: 12500.00,
    created_at: new Date("2023-05-01"),
    updated_at: new Date("2024-01-10")
  },
  {
    user_id: 5,
    holdings: [
      {
        symbol: "SPY",
        name: "SPDR S&P 500 ETF Trust",
        quantity: 25,
        purchase_price: 400.00,
        current_price: 450.00,
        purchase_date: new Date("2023-07-01"),
        asset_type: "etf"
      },
      {
        symbol: "GOOGL",
        name: "Alphabet Inc.",
        quantity: 10,
        purchase_price: 120.00,
        current_price: 140.00,
        purchase_date: new Date("2023-09-15"),
        asset_type: "stock"
      }
    ],
    total_value: 12650.00,
    total_gain_loss: 1450.00,
    created_at: new Date("2023-07-01"),
    updated_at: new Date("2024-01-10")
  }
]);

// Financial Reports Collection
db.reports.insertMany([
  {
    user_id: 4,
    report_type: "monthly_summary",
    period: {
      start_date: new Date("2024-01-01"),
      end_date: new Date("2024-01-31")
    },
    data: {
      total_income: 4500.00,
      total_expenses: 1547.25,
      net_income: 2952.75,
      expense_categories: {
        "Housing": 1200.00,
        "Food": 128.25,
        "Transportation": 45.00,
        "Utilities": 150.00,
        "Entertainment": 25.00
      },
      budget_variance: {
        "Food": -271.75,
        "Transportation": -155.00,
        "Utilities": -50.00,
        "Entertainment": -125.00
      }
    },
    generated_at: new Date("2024-02-01")
  },
  {
    user_id: 5,
    report_type: "quarterly_summary",
    period: {
      start_date: new Date("2023-10-01"),
      end_date: new Date("2023-12-31")
    },
    data: {
      total_income: 11400.00,
      total_expenses: 8550.00,
      net_income: 2850.00,
      savings_rate: 25.0,
      goal_progress: {
        "House Down Payment": 24.0,
        "Vacation to Europe": 40.0
      }
    },
    generated_at: new Date("2024-01-01")
  }
]);

// Financial Insights Collection
db.insights.insertMany([
  {
    user_id: 4,
    insight_type: "spending_pattern",
    title: "Food Spending Below Budget",
    description: "Your food spending is 68% below your monthly budget. Consider reallocating some funds to savings.",
    priority: "medium",
    category: "budgeting",
    action_items: [
      "Review food budget allocation",
      "Consider increasing savings contribution",
      "Track spending patterns for next month"
    ],
    created_at: new Date("2024-01-10"),
    is_read: false
  },
  {
    user_id: 4,
    insight_type: "investment_opportunity",
    title: "Emergency Fund Goal Almost Reached",
    description: "You're 75% towards your emergency fund goal. Consider diversifying excess savings into investments.",
    priority: "high",
    category: "goals",
    action_items: [
      "Complete emergency fund goal",
      "Research investment options",
      "Consult with financial advisor"
    ],
    created_at: new Date("2024-01-08"),
    is_read: false
  },
  {
    user_id: 5,
    insight_type: "goal_tracking",
    title: "House Down Payment Progress",
    description: "At your current savings rate, you'll reach your house down payment goal 3 months ahead of schedule.",
    priority: "low",
    category: "goals",
    action_items: [
      "Continue current savings rate",
      "Start researching home markets",
      "Consider pre-approval for mortgage"
    ],
    created_at: new Date("2024-01-05"),
    is_read: true
  }
]);

// Market Data Collection (for investment tracking)
db.market_data.insertMany([
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    current_price: 175.00,
    previous_close: 172.50,
    change: 2.50,
    change_percent: 1.45,
    volume: 45000000,
    market_cap: 2750000000000,
    pe_ratio: 28.5,
    updated_at: new Date("2024-01-10T16:00:00Z")
  },
  {
    symbol: "MSFT",
    name: "Microsoft Corporation",
    current_price: 320.00,
    previous_close: 315.00,
    change: 5.00,
    change_percent: 1.59,
    volume: 32000000,
    market_cap: 2400000000000,
    pe_ratio: 32.1,
    updated_at: new Date("2024-01-10T16:00:00Z")
  },
  {
    symbol: "VTI",
    name: "Vanguard Total Stock Market ETF",
    current_price: 220.00,
    previous_close: 218.50,
    change: 1.50,
    change_percent: 0.69,
    volume: 2500000,
    expense_ratio: 0.03,
    updated_at: new Date("2024-01-10T16:00:00Z")
  }
]);

// Create indexes for better performance
db.transactions.createIndex({ "user_id": 1, "date": -1 });
db.transactions.createIndex({ "account_id": 1 });
db.transactions.createIndex({ "category": 1 });
db.transactions.createIndex({ "transaction_type": 1 });
db.transactions.createIndex({ "date": -1 });

db.budgets.createIndex({ "user_id": 1 });
db.budgets.createIndex({ "status": 1 });
db.budgets.createIndex({ "period": 1 });

db.portfolios.createIndex({ "user_id": 1 });
db.portfolios.createIndex({ "holdings.symbol": 1 });

db.reports.createIndex({ "user_id": 1, "report_type": 1 });
db.reports.createIndex({ "period.start_date": 1, "period.end_date": 1 });

db.insights.createIndex({ "user_id": 1, "is_read": 1 });
db.insights.createIndex({ "priority": 1 });
db.insights.createIndex({ "category": 1 });

db.market_data.createIndex({ "symbol": 1 });
db.market_data.createIndex({ "updated_at": -1 });

print("Financial Management System MongoDB data initialized successfully!");
print("Collections created: transactions, budgets, portfolios, reports, insights, market_data");
print("Sample data inserted for 3 users with comprehensive financial information");
print("Indexes created for optimal query performance");