const mongoose = require('mongoose');
const Template = require('../models/Template');
require('dotenv').config();

async function seedTemplates() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hr-genai');
    console.log('Connected to MongoDB');
    
    // Clear all existing templates to make it fully dynamic
    await Template.deleteMany({});
    console.log('Cleared all existing templates');
    
    console.log('\nTemplate system ready for HR to create dynamic templates!');
    process.exit(0);
  } catch (error) {
    console.error('Error clearing templates:', error);
    process.exit(1);
  }
}

seedTemplates();