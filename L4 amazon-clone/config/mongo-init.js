// Initialize Amazon Clone MongoDB
db = db.getSiblingDB('amazon_store');

// Sample products
db.products.insertMany([
  {
    name: "iPhone 15 Pro",
    description: "Latest Apple smartphone with advanced features",
    price: 999.99,
    category: "electronics",
    stock: 50,
    rating: 4.8,
    reviews: 1250,
    image: null
  },
  {
    name: "Samsung Galaxy S24",
    description: "Premium Android smartphone",
    price: 899.99,
    category: "electronics", 
    stock: 30,
    rating: 4.7,
    reviews: 890,
    image: null
  },
  {
    name: "Nike Air Max",
    description: "Comfortable running shoes",
    price: 129.99,
    category: "clothing",
    stock: 100,
    rating: 4.5,
    reviews: 456,
    image: null
  },
  {
    name: "The Great Gatsby",
    description: "Classic American novel",
    price: 12.99,
    category: "books",
    stock: 200,
    rating: 4.6,
    reviews: 2340,
    image: null
  },
  {
    name: "Coffee Maker",
    description: "Automatic drip coffee maker",
    price: 79.99,
    category: "home",
    stock: 25,
    rating: 4.3,
    reviews: 167,
    image: null
  },
  {
    name: "Football",
    description: "Official size football",
    price: 24.99,
    category: "sports",
    stock: 75,
    rating: 4.4,
    reviews: 89,
    image: null
  }
]);

print("Sample products inserted successfully!");