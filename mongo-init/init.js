// MongoDB initialization script
db = db.getSiblingDB('api_db');

// Create collections
db.createCollection('users');

// Insert initial data
db.users.insertMany([
  {
    name: 'John Doe',
    email: 'john@example.com',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

// Create indexes
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ createdAt: 1 });

print('Database initialized successfully!'); 