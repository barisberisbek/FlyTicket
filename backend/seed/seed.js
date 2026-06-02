require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const City = require('../models/City');
const Admin = require('../models/Admin');
const Flight = require('../models/Flight');
const cities = require('./cities.json');

// ---------------------------------------------------------------------------
// Sample routes – 3 batches of 10, one per day offset (+7 / +8 / +9)
// plate-number city_ids match cities.json ("34"=İstanbul, "06"=Ankara, …)
// Rules verified manually: no same-city same-hour departure OR arrival per day.
// ---------------------------------------------------------------------------
const BATCHES = [
  // --- Batch 0  (today + 7 days) ----------------------------------------
  [
    { from: '34', to: '06', depHour:  8, dur: 1.5, price:  850, seats: 180 }, // İstanbul → Ankara
    { from: '16', to: '01', depHour:  9, dur: 1.5, price:  720, seats:  90 }, // Bursa → Adana
    { from: '06', to: '35', depHour: 10, dur: 1.5, price:  780, seats: 150 }, // Ankara → İzmir
    { from: '01', to: '25', depHour: 11, dur: 2,   price:  870, seats:  90 }, // Adana → Erzurum
    { from: '35', to: '07', depHour: 12, dur: 1,   price:  650, seats: 120 }, // İzmir → Antalya
    { from: '25', to: '38', depHour: 13, dur: 1.5, price:  800, seats:  90 }, // Erzurum → Kayseri
    { from: '07', to: '61', depHour: 14, dur: 2,   price:  920, seats: 120 }, // Antalya → Trabzon
    { from: '38', to: '42', depHour: 15, dur: 1,   price:  690, seats:  90 }, // Kayseri → Konya
    { from: '61', to: '34', depHour: 16, dur: 2,   price: 1100, seats: 150 }, // Trabzon → İstanbul
    { from: '42', to: '16', depHour: 17, dur: 1.5, price:  740, seats:  90 }, // Konya → Bursa
  ],
  // --- Batch 1  (today + 8 days) ----------------------------------------
  [
    { from: '65', to: '34', depHour:  6, dur: 3,   price: 1650, seats: 150 }, // Van → İstanbul
    { from: '06', to: '34', depHour:  7, dur: 1.5, price:  900, seats: 180 }, // Ankara → İstanbul
    { from: '27', to: '06', depHour:  8, dur: 2,   price: 1050, seats: 120 }, // Gaziantep → Ankara
    { from: '55', to: '61', depHour:  9, dur: 1,   price:  520, seats:  90 }, // Samsun → Trabzon
    { from: '34', to: '35', depHour:  9, dur: 1.5, price:  950, seats: 180 }, // İstanbul → İzmir  (dep 9, diff city from 55)
    { from: '21', to: '34', depHour: 10, dur: 2.5, price: 1380, seats: 150 }, // Diyarbakır → İstanbul
    { from: '35', to: '48', depHour: 11, dur: 1,   price:  580, seats:  90 }, // İzmir → Muğla (Bodrum)
    { from: '63', to: '27', depHour: 12, dur: 1,   price:  480, seats:  90 }, // Şanlıurfa → Gaziantep
    { from: '48', to: '07', depHour: 13, dur: 1,   price:  620, seats:  90 }, // Muğla → Antalya
    { from: '42', to: '35', depHour: 14, dur: 1.5, price:  750, seats:  90 }, // Konya → İzmir
  ],
  // --- Batch 2  (today + 9 days) ----------------------------------------
  [
    { from: '27', to: '16', depHour:  7, dur: 2,   price: 1100, seats:  90 }, // Gaziantep → Bursa
    { from: '34', to: '07', depHour:  7, dur: 1.5, price:  820, seats: 180 }, // İstanbul → Antalya  (diff city from 27)
    { from: '35', to: '34', depHour:  8, dur: 1.5, price:  930, seats: 180 }, // İzmir → İstanbul
    { from: '55', to: '34', depHour:  9, dur: 2,   price:  890, seats: 120 }, // Samsun → İstanbul
    { from: '07', to: '06', depHour: 10, dur: 1.5, price:  790, seats: 120 }, // Antalya → Ankara
    { from: '16', to: '35', depHour: 10, dur: 1.5, price:  720, seats:  90 }, // Bursa → İzmir  (diff city from 07)
    { from: '21', to: '27', depHour: 11, dur: 1,   price:  560, seats:  90 }, // Diyarbakır → Gaziantep
    { from: '06', to: '61', depHour: 13, dur: 2,   price:  980, seats: 120 }, // Ankara → Trabzon
    { from: '42', to: '06', depHour: 14, dur: 1.5, price:  680, seats: 120 }, // Konya → Ankara
    { from: '61', to: '16', depHour: 16, dur: 2,   price: 1050, seats:  90 }, // Trabzon → Bursa
  ],
];

async function run() {
  await connectDB();

  // --- Cities ---
  let upserted = 0;
  for (const c of cities) {
    await City.updateOne({ city_id: c.city_id }, { $set: c }, { upsert: true });
    upserted++;
  }
  console.log(`Cities upserted: ${upserted}`);

  // --- Default admin ---
  const username = process.env.DEFAULT_ADMIN_USERNAME || 'admin';
  const password = process.env.DEFAULT_ADMIN_PASSWORD || 'Admin123!';
  if (!await Admin.findOne({ username })) {
    await Admin.create({ username, password });
    console.log(`Default admin created: ${username}`);
  } else {
    console.log(`Admin already exists: ${username}`);
  }

  // --- Sample flights ---
  const flightCount = await Flight.countDocuments();
  const TARGET = BATCHES.flat().length; // 30

  if (flightCount >= TARGET) {
    console.log(`Sample flights skipped: ${flightCount} flight(s) already in DB`);
  } else {
    // Batches are added in order. Determine how many are already done.
    const batchSize = BATCHES[0].length;
    const startBatch = Math.floor(flightCount / batchSize);

    const now = new Date();
    const cityDocs = await City.find({}, 'city_id _id');
    const cityMap = Object.fromEntries(cityDocs.map((c) => [c.city_id, c._id]));

    let created = 0;
    for (let b = startBatch; b < BATCHES.length; b++) {
      const dayOffset = 7 + b;
      const baseDate = new Date(Date.UTC(
        now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + dayOffset,
      ));
      for (const r of BATCHES[b]) {
        const fromId = cityMap[r.from];
        const toId   = cityMap[r.to];
        if (!fromId || !toId) { console.warn(`  Skipping ${r.from}→${r.to}: city not found`); continue; }
        await Flight.create({
          from_city:       fromId,
          to_city:         toId,
          departure_time:  new Date(baseDate.getTime() + r.depHour * 3600_000),
          arrival_time:    new Date(baseDate.getTime() + (r.depHour + r.dur) * 3600_000),
          price:           r.price,
          seats_total:     r.seats,
          seats_available: r.seats,
          booked_seats:    [],
        });
        created++;
      }
    }
    console.log(`Sample flights created: ${created} (total now: ${flightCount + created})`);
  }

  await mongoose.disconnect();
  console.log('Seed complete.');
}

run().catch((e) => { console.error(e); process.exit(1); });
