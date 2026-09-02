const mongoose = require('mongoose');

async function fix() {
  await mongoose.connect('mongodb://127.0.0.1:27017/aerovista');
  const db = mongoose.connection.db;
  await db.collection('homecontents').deleteOne({ section: 'whyChooseUs' });
  console.log('Deleted whyChooseUs section to force re-seed with Lucide strings');
  mongoose.disconnect();
}

fix().catch(console.error);
