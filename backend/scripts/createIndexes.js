const mongoose = require('mongoose');
const Product = require('../models/Product');
require('dotenv').config();

async function createIndexes() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/harvest-software');
    console.log('Connected to MongoDB');

    // Drop existing text indexes if they exist
    try {
      await Product.collection.dropIndex('product_text_index');
      console.log('Dropped existing product_text_index');
    } catch (err) {
      console.log('No existing product_text_index to drop');
    }

    try {
      await Product.collection.dropIndex('name_text');
      console.log('Dropped existing name_text index');
    } catch (err) {
      console.log('No existing name_text index to drop');
    }

    // Create text index
    await Product.collection.createIndex(
      { 
        name: 'text', 
        description: 'text', 
        type: 'text' 
      },
      {
        weights: {
          name: 10,        // Give name highest priority
          type: 5,         // Type medium priority
          description: 1   // Description lowest priority
        },
        name: 'product_text_index'
      }
    );
    console.log('Created text search index');

    // Create compound indexes for performance
    await Product.collection.createIndex({ farmerID: 1, listedDate: -1 });
    console.log('Created farmerID + listedDate index');

    await Product.collection.createIndex({ price: 1, listedDate: -1 });
    console.log('Created price + listedDate index');

    await Product.collection.createIndex({ type: 1, listedDate: -1 });
    console.log('Created type + listedDate index');

    // List all indexes
    const indexes = await Product.collection.listIndexes().toArray();
    console.log('\nCurrent indexes:');
    indexes.forEach(index => {
      console.log(`- ${index.name}: ${JSON.stringify(index.key)}`);
    });

    console.log('\nIndexes created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error creating indexes:', error);
    process.exit(1);
  }
}

createIndexes();
