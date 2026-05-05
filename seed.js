require('dotenv').config();
const mongoose = require('mongoose');
const Template = require('./models/Template');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/fullstack-task');
    console.log('MongoDB connected for seeding');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const templates = [
  {
    name: 'Modern SaaS Dashboard',
    description: 'A beautiful dashboard template for SaaS applications.',
    thumbnail_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=400&q=80',
    category: 'Dashboard'
  },
  {
    name: 'E-commerce Storefront',
    description: 'Complete storefront template with product grids and cart.',
    thumbnail_url: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=400&q=80',
    category: 'E-commerce'
  },
  {
    name: 'Agency Landing Page',
    description: 'Clean and professional landing page for agencies.',
    thumbnail_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=400&q=80',
    category: 'Landing Page'
  },
  {
    name: 'Personal Portfolio',
    description: 'Showcase your work with this elegant portfolio template.',
    thumbnail_url: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=400&q=80',
    category: 'Portfolio'
  },
  {
    name: 'Blog Theme',
    description: 'Minimalist blog template focusing on readability.',
    thumbnail_url: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=400&q=80',
    category: 'Blog'
  }
];

const seedData = async () => {
  await connectDB();
  try {
    // Clear existing templates
    await Template.deleteMany();
    console.log('Cleared existing templates');

    // Insert new templates
    await Template.insertMany(templates);
    console.log('Seeded templates successfully');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
