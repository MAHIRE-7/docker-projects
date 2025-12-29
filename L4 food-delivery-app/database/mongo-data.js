// Food Delivery Platform MongoDB Data

// Connect to database
use food_delivery;

// Sample menu items for restaurants
db.menuitems.insertMany([
  // Pizza Palace (Restaurant ID: 1)
  {
    restaurantId: 1,
    name: "Margherita Pizza",
    description: "Classic pizza with tomato sauce, mozzarella, and fresh basil",
    price: 14.99,
    category: "Pizza",
    available: true,
    rating: 4.6,
    preparationTime: 15
  },
  {
    restaurantId: 1,
    name: "Pepperoni Pizza",
    description: "Traditional pepperoni pizza with mozzarella cheese",
    price: 16.99,
    category: "Pizza",
    available: true,
    rating: 4.5,
    preparationTime: 15
  },
  {
    restaurantId: 1,
    name: "Caesar Salad",
    description: "Fresh romaine lettuce with Caesar dressing and croutons",
    price: 9.99,
    category: "Salad",
    available: true,
    rating: 4.2,
    preparationTime: 10
  },

  // Dragon Garden (Restaurant ID: 2)
  {
    restaurantId: 2,
    name: "Sweet and Sour Chicken",
    description: "Crispy chicken with bell peppers in sweet and sour sauce",
    price: 13.99,
    category: "Main Course",
    available: true,
    rating: 4.4,
    preparationTime: 20
  },
  {
    restaurantId: 2,
    name: "Beef Lo Mein",
    description: "Stir-fried noodles with beef and vegetables",
    price: 12.99,
    category: "Noodles",
    available: true,
    rating: 4.3,
    preparationTime: 18
  },
  {
    restaurantId: 2,
    name: "Pork Dumplings",
    description: "Steamed dumplings filled with seasoned pork",
    price: 8.99,
    category: "Appetizer",
    available: true,
    rating: 4.7,
    preparationTime: 12
  },

  // Spice Route (Restaurant ID: 3)
  {
    restaurantId: 3,
    name: "Chicken Tikka Masala",
    description: "Tender chicken in creamy tomato-based curry sauce",
    price: 15.99,
    category: "Curry",
    available: true,
    rating: 4.8,
    preparationTime: 25
  },
  {
    restaurantId: 3,
    name: "Lamb Biryani",
    description: "Fragrant basmati rice with spiced lamb and herbs",
    price: 18.99,
    category: "Rice",
    available: true,
    rating: 4.6,
    preparationTime: 30
  },
  {
    restaurantId: 3,
    name: "Garlic Naan",
    description: "Fresh baked bread with garlic and herbs",
    price: 3.99,
    category: "Bread",
    available: true,
    rating: 4.5,
    preparationTime: 8
  },

  // Taco Fiesta (Restaurant ID: 4)
  {
    restaurantId: 4,
    name: "Beef Tacos",
    description: "Three soft tacos with seasoned ground beef and toppings",
    price: 9.99,
    category: "Tacos",
    available: true,
    rating: 4.3,
    preparationTime: 12
  },
  {
    restaurantId: 4,
    name: "Chicken Burrito",
    description: "Large burrito with grilled chicken, rice, beans, and salsa",
    price: 11.99,
    category: "Burrito",
    available: true,
    rating: 4.4,
    preparationTime: 15
  },
  {
    restaurantId: 4,
    name: "Guacamole & Chips",
    description: "Fresh guacamole served with crispy tortilla chips",
    price: 6.99,
    category: "Appetizer",
    available: true,
    rating: 4.2,
    preparationTime: 5
  },

  // Burger Junction (Restaurant ID: 5)
  {
    restaurantId: 5,
    name: "Classic Cheeseburger",
    description: "Beef patty with cheese, lettuce, tomato, and special sauce",
    price: 12.99,
    category: "Burger",
    available: true,
    rating: 4.5,
    preparationTime: 18
  },
  {
    restaurantId: 5,
    name: "BBQ Bacon Burger",
    description: "Beef patty with bacon, BBQ sauce, and onion rings",
    price: 15.99,
    category: "Burger",
    available: true,
    rating: 4.6,
    preparationTime: 20
  },
  {
    restaurantId: 5,
    name: "Loaded Fries",
    description: "Crispy fries topped with cheese, bacon, and green onions",
    price: 7.99,
    category: "Sides",
    available: true,
    rating: 4.3,
    preparationTime: 10
  }
]);

print("Sample menu items inserted successfully!");

// Create indexes for better performance
db.menuitems.createIndex({ restaurantId: 1 });
db.menuitems.createIndex({ category: 1 });
db.orders.createIndex({ userId: 1 });
db.orders.createIndex({ restaurantId: 1 });
db.carts.createIndex({ userId: 1 });

print("Database indexes created successfully!");