require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const City = require('../models/City');
const Admin = require('../models/Admin');
const cities = require('./cities.json');

async function run() {
  await connectDB();

  let upserted = 0;
  for (const c of cities) {
    await City.updateOne({ city_id: c.city_id }, { $set: c }, { upsert: true });
    upserted++;
  }
  console.log(`Cities upserted: ${upserted}`);

  const username = process.env.DEFAULT_ADMIN_USERNAME || 'admin';
  const password = process.env.DEFAULT_ADMIN_PASSWORD || 'Admin123!';
  const exists = await Admin.findOne({ username });
  if (!exists) {
    await Admin.create({ username, password });
    console.log(`Default admin created: ${username}`);
  } else {
    console.log(`Admin already exists: ${username}`);
  }

  await mongoose.disconnect();
  console.log('Seed complete.');
}

run().catch((e) => { console.error(e); process.exit(1); });
