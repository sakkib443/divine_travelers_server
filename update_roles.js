const { MongoClient } = require('mongodb');

async function run() {
  const client = new MongoClient('mongodb://127.0.0.1:27017');
  await client.connect();
  const db = client.db('aerovista');
  const result = await db.collection('users').updateMany(
    { role: 'super_admin' },
    { $set: { role: 'admin' } }
  );
  console.log(`Updated ${result.modifiedCount} user(s) to role: admin.`);
  await client.close();
}

run().catch(console.error);
