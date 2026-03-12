/**
 * Run this script once to create the initial admin user:
 *   node seed.js
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existing = await User.findOne({ email: process.env.ADMIN_EMAIL || 'admin@mcc.gov.in' });
    if (existing) {
      console.log('Admin user already exists:', existing.email);
      process.exit(0);
    }

    const admin = await User.create({
      name: 'MCC Admin',
      email: process.env.ADMIN_EMAIL || 'admin@mcc.gov.in',
      password: process.env.ADMIN_PASSWORD || 'admin123',
      role: 'admin'
    });

    console.log('✅ Admin user created:', admin.email);
    console.log('   Email:', admin.email);
    console.log('   Password: (set in .env ADMIN_PASSWORD)');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err.message);
    process.exit(1);
  }
}

seed();
