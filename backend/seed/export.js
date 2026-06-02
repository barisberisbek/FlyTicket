/**
 * Exports all FlyTicket collections to JSON files in database-export/
 * Run: node seed/export.js
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const connectDB = require('../config/db');

const City   = require('../models/City');
const Flight = require('../models/Flight');
const Ticket = require('../models/Ticket');
const Admin  = require('../models/Admin');
const User   = require('../models/User');

const OUT_DIR = path.resolve(__dirname, '../../database-export');

async function run() {
  await connectDB();

  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  const collections = [
    { name: 'cities',  Model: City  },
    { name: 'flights', Model: Flight },
    { name: 'tickets', Model: Ticket },
    { name: 'admins',  Model: Admin  },
    { name: 'users',   Model: User   },
  ];

  for (const { name, Model } of collections) {
    const docs = await Model.find().lean();
    const file = path.join(OUT_DIR, `${name}.json`);
    fs.writeFileSync(file, JSON.stringify(docs, null, 2), 'utf8');
    console.log(`Exported ${docs.length} ${name} → database-export/${name}.json`);
  }

  await mongoose.disconnect();
  console.log('\nExport complete. Files saved to database-export/');
}

run().catch((e) => { console.error(e); process.exit(1); });
