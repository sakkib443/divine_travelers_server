// ===================================================================
// Local self-contained MongoDB for development
// -------------------------------------------------------------------
// Starts a real mongod (downloaded & managed by mongodb-memory-server)
// on 127.0.0.1:27017 with a PERSISTENT data folder so your data
// survives restarts. No system install / admin / Docker needed.
//
//   Run:  node local-mongo.js
//   Stop: Ctrl+C
// ===================================================================

const path = require('path');
const fs = require('fs');
const { MongoMemoryServer } = require('mongodb-memory-server');

const PORT = 27017;
const DB_NAME = 'aerovista';
const DATA_DIR = path.join(__dirname, '.local-mongo-data');

// Persist data across restarts.
fs.mkdirSync(DATA_DIR, { recursive: true });

(async () => {
  console.log('🔻 Starting local MongoDB (mongodb-memory-server)...');
  console.log('   (first run downloads the mongod binary — please wait)');

  const mongod = await MongoMemoryServer.create({
    instance: {
      port: PORT,
      ip: '127.0.0.1',
      dbName: DB_NAME,
      dbPath: DATA_DIR,
      storageEngine: 'wiredTiger',
    },
  });

  const uri = mongod.getUri();
  console.log('');
  console.log('✅ Local MongoDB is running!');
  console.log('   URI  : ' + uri);
  console.log('   Data : ' + DATA_DIR);
  console.log('   (leave this window open — Ctrl+C to stop)');
  console.log('');

  const shutdown = async () => {
    console.log('\n👋 Stopping local MongoDB...');
    try {
      await mongod.stop({ doCleanup: false, force: false });
    } catch (_) {}
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
})().catch((err) => {
  console.error('❌ Failed to start local MongoDB:', err);
  process.exit(1);
});
