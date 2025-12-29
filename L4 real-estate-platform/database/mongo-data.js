// Real Estate Platform MongoDB Data

// Connect to database
use real_estate;

// Sample properties
db.properties.insertMany([
  // Luxury Houses
  {
    agentId: 3,
    title: "Luxury Modern Villa",
    description: "Stunning 4-bedroom modern villa with panoramic city views, infinity pool, and smart home technology.",
    price: 1250000,
    propertyType: "house",
    status: "available",
    bedrooms: 4,
    bathrooms: 3,
    area: 3200,
    address: "123 Hillcrest Drive",
    city: "Beverly Hills",
    state: "CA",
    zipCode: "90210",
    images: [],
    amenities: ["Pool", "Smart Home", "Garage", "Garden", "Security System"],
    yearBuilt: 2020,
    parking: 3,
    featured: true,
    views: 245
  },
  {
    agentId: 3,
    title: "Colonial Style Family Home",
    description: "Beautiful 5-bedroom colonial home in prestigious neighborhood with mature landscaping.",
    price: 875000,
    propertyType: "house",
    status: "available",
    bedrooms: 5,
    bathrooms: 4,
    area: 2800,
    address: "456 Oak Street",
    city: "Greenwich",
    state: "CT",
    zipCode: "06830",
    images: [],
    amenities: ["Fireplace", "Hardwood Floors", "Large Yard", "Garage"],
    yearBuilt: 1995,
    parking: 2,
    featured: true,
    views: 189
  },

  // Apartments
  {
    agentId: 4,
    title: "Downtown Luxury Condo",
    description: "Modern 2-bedroom condo in the heart of downtown with city views and premium amenities.",
    price: 650000,
    propertyType: "apartment",
    status: "available",
    bedrooms: 2,
    bathrooms: 2,
    area: 1200,
    address: "789 Main Street, Unit 1205",
    city: "Seattle",
    state: "WA",
    zipCode: "98101",
    images: [],
    amenities: ["City Views", "Gym", "Concierge", "Rooftop Deck"],
    yearBuilt: 2018,
    parking: 1,
    featured: false,
    views: 156
  },
  {
    agentId: 4,
    title: "Cozy Studio Apartment",
    description: "Charming studio apartment perfect for young professionals, walking distance to metro.",
    price: 285000,
    propertyType: "apartment",
    status: "available",
    bedrooms: 0,
    bathrooms: 1,
    area: 550,
    address: "321 Pine Avenue, Unit 4B",
    city: "Portland",
    state: "OR",
    zipCode: "97201",
    images: [],
    amenities: ["Metro Access", "Laundry", "Pet Friendly"],
    yearBuilt: 2015,
    parking: 0,
    featured: false,
    views: 78
  },

  // Commercial Properties
  {
    agentId: 4,
    title: "Prime Retail Space",
    description: "High-traffic retail space in busy shopping district, perfect for restaurant or retail store.",
    price: 450000,
    propertyType: "commercial",
    status: "available",
    bedrooms: 0,
    bathrooms: 2,
    area: 2200,
    address: "555 Commerce Boulevard",
    city: "Austin",
    state: "TX",
    zipCode: "78701",
    images: [],
    amenities: ["High Traffic", "Parking", "Storage", "Loading Dock"],
    yearBuilt: 2010,
    parking: 8,
    featured: false,
    views: 134
  },

  // Land
  {
    agentId: 3,
    title: "Residential Development Land",
    description: "5-acre plot zoned for residential development, utilities available, great investment opportunity.",
    price: 320000,
    propertyType: "land",
    status: "available",
    bedrooms: 0,
    bathrooms: 0,
    area: 217800, // 5 acres in sq ft
    address: "Highway 101 & Maple Road",
    city: "Riverside",
    state: "CA",
    zipCode: "92501",
    images: [],
    amenities: ["Utilities Available", "Zoned Residential", "Highway Access"],
    yearBuilt: 0,
    parking: 0,
    featured: false,
    views: 67
  },

  // More Houses
  {
    agentId: 3,
    title: "Charming Craftsman Bungalow",
    description: "Restored 1920s craftsman with original hardwood floors and modern updates.",
    price: 525000,
    propertyType: "house",
    status: "available",
    bedrooms: 3,
    bathrooms: 2,
    area: 1650,
    address: "789 Elm Street",
    city: "Pasadena",
    state: "CA",
    zipCode: "91101",
    images: [],
    amenities: ["Hardwood Floors", "Original Details", "Updated Kitchen", "Garden"],
    yearBuilt: 1925,
    parking: 1,
    featured: true,
    views: 203
  },
  {
    agentId: 4,
    title: "Contemporary Townhouse",
    description: "Brand new 3-story townhouse with rooftop deck and attached garage.",
    price: 485000,
    propertyType: "house",
    status: "available",
    bedrooms: 3,
    bathrooms: 3,
    area: 1850,
    address: "456 Birch Lane",
    city: "Denver",
    state: "CO",
    zipCode: "80202",
    images: [],
    amenities: ["Rooftop Deck", "Garage", "Modern Design", "Energy Efficient"],
    yearBuilt: 2023,
    parking: 2,
    featured: false,
    views: 92
  }
]);

print("Sample properties inserted successfully!");

// Sample inquiries
db.inquiries.insertMany([
  {
    propertyId: null, // Will be set to actual property ID
    userId: 2,
    agentId: 3,
    name: "John Smith",
    email: "buyer@realestate.com",
    phone: "1234567891",
    message: "I'm interested in scheduling a viewing for this property. What times are available this week?",
    inquiryType: "viewing",
    status: "pending"
  },
  {
    propertyId: null,
    userId: 2,
    agentId: 4,
    name: "John Smith",
    email: "buyer@realestate.com",
    phone: "1234567891",
    message: "Can you provide more information about the HOA fees and building amenities?",
    inquiryType: "info",
    status: "pending"
  }
]);

print("Sample inquiries inserted successfully!");

// Create indexes for better performance
db.properties.createIndex({ agentId: 1 });
db.properties.createIndex({ propertyType: 1 });
db.properties.createIndex({ city: 1 });
db.properties.createIndex({ price: 1 });
db.properties.createIndex({ status: 1 });
db.properties.createIndex({ featured: 1 });

db.inquiries.createIndex({ userId: 1 });
db.inquiries.createIndex({ agentId: 1 });
db.inquiries.createIndex({ propertyId: 1 });
db.inquiries.createIndex({ status: 1 });

db.favorites.createIndex({ userId: 1 });
db.favorites.createIndex({ propertyId: 1 });

print("Database indexes created successfully!");